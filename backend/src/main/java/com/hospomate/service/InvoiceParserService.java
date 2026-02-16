package com.hospomate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospomate.model.InvoiceCost;
import com.hospomate.repository.InvoiceCostRepository;
import org.apache.pdfbox.Loader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InvoiceParserService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceParserService.class);

    private final InvoiceCostRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public InvoiceParserService(InvoiceCostRepository repository) {
        this.repository = repository;
    }

    @Value("${gemini.api.key:UNSET}")
    private String apiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    public InvoiceCost parseAndSaveInvoice(Long storeId, MultipartFile file) throws IOException {
        log.info("Starting invoice parse for storeId: {}, file: {}", storeId, file.getOriginalFilename());
        String text = extractTextFromPdf(file);

        String jsonResponse;
        if ("UNSET".equals(apiKey)) {
            log.warn("Gemini API Key not set. Using fallback heuristic parser.");
            jsonResponse = parseWithHeuristic(text);
        } else {
            jsonResponse = callGeminiForParsing(text);
        }

        InvoiceCost cost = new InvoiceCost();
        cost.setStoreId(storeId);
        cost.setOriginalFileName(file.getOriginalFilename());
        cost.setRawJsonData(jsonResponse);
        cost.setStatus("PENDING_REVIEW");

        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            if (root.has("total")) {
                cost.setTotalAmount(root.get("total").asDouble());
            }
            if (root.has("supplier")) {
                cost.setSupplierName(root.get("supplier").asText());
            }
        } catch (Exception e) {
            log.error("Failed to parse summary fields from response", e);
        }

        cost.setInvoiceDate(LocalDate.now());

        return repository.save(cost);
    }

    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String callGeminiForParsing(String invoiceText) {
        try {
            String promptText = """
                    You are an expert hospitality accountant. Extract data from the following invoice text.
                    Return ONLY a valid JSON object (no markdown formatting, no backticks) with these keys:
                    supplier (string), date (string yyyy-MM-dd), total (number), items (array of {name, quantity, price, total}).

                    INVOICE TEXT:
                    """
                    + invoiceText;

            // payload structure for Gemini
            Map<String, Object> part = new HashMap<>();
            part.put("text", promptText);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            Map<String, Object> payload = new HashMap<>();
            payload.put("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            String url = GEMINI_URL + apiKey;
            String response = restTemplate.postForObject(url, entity, String.class);

            // Parse response to get the 'text' field from candidates
            JsonNode root = objectMapper.readTree(response);
            String resultText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text")
                    .asText();

            // Cleanup markdown if present
            return resultText.replaceAll("```json", "").replaceAll("```", "").trim();

        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return parseWithHeuristic(invoiceText);
        }
    }

    private String parseWithHeuristic(String text) {
        // Fallback or "Heuristic" mode if API fails or key is missing
        // This is a very basic fallback just to return valid JSON
        Map<String, Object> fallback = new HashMap<>();

        // Try to find total
        double total = 0.0;
        try {
            // Simple regex for total could go here, but keeping it simple for now
            if (text.toLowerCase().contains("total")) {
                fallback.put("extracted_note", "Found 'total' keyword but heuristics are limited.");
            }
        } catch (Exception ignored) {
        }

        fallback.put("supplier", "Unknown Supplier (Check PDF)");
        fallback.put("date", LocalDate.now().toString());
        fallback.put("total", total);
        fallback.put("items", List.of());

        try {
            return objectMapper.writeValueAsString(fallback);
        } catch (Exception e) {
            return "{}";
        }
    }
}
