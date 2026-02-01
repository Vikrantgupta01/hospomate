package com.hospomate.service;

import com.hospomate.model.InvoiceCost;
import com.hospomate.repository.InvoiceCostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceParserService {

    private final ChatModel chatModel;
    private final InvoiceCostRepository repository;

    @Value("${spring.ai.anthropic.api-key:UNSET}")
    private String apiKey;

    public InvoiceCost parseAndSaveInvoice(Long storeId, MultipartFile file) throws IOException {
        log.info("Starting invoice parse for storeId: {}, file: {}", storeId, file.getOriginalFilename());
        String text = extractTextFromPdf(file);

        String jsonResponse;
        if ("UNSET".equals(apiKey)) {
            log.warn("Anthropic API Key not set. Using mock parsing response.");
            jsonResponse = mockClaudeResponse(text);
        } else {
            jsonResponse = callClaudeForParsing(text);
        }

        InvoiceCost cost = new InvoiceCost();
        cost.setStoreId(storeId);
        cost.setOriginalFileName(file.getOriginalFilename());
        cost.setRawJsonData(jsonResponse);
        cost.setStatus("PENDING_REVIEW");

        // Simple heuristic extraction from JSON for the main fields
        // In a real app, we'd use a JSON parser (Jackson) here
        try {
            if (jsonResponse.contains("\"total\"")) {
                String sub = jsonResponse.substring(jsonResponse.indexOf("\"total\"") + 7);
                String val = sub.substring(sub.indexOf(":") + 1, sub.indexOf(",")).trim();
                cost.setTotalAmount(Double.parseDouble(val));
            }
            if (jsonResponse.contains("\"supplier\"")) {
                String sub = jsonResponse.substring(jsonResponse.indexOf("\"supplier\"") + 10);
                String val = sub.substring(sub.indexOf("\"") + 1, sub.lastIndexOf("\"")).trim();
                cost.setSupplierName(val);
            }
        } catch (Exception e) {
            log.error("Failed to parse summary fields from Claude response", e);
        }

        cost.setInvoiceDate(LocalDate.now()); // Fallback to upload date

        return repository.save(cost);
    }

    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String callClaudeForParsing(String invoiceText) {
        String systemPrompt = """
                You are an expert hospitality accountant. Extract data from the following invoice text.
                Return ONLY a valid JSON object with these keys:
                supplier (string), date (string), total (number), items (array of {name, quantity, price, total}).
                If data is missing, use null.
                """;

        UserMessage userMessage = new UserMessage(invoiceText);
        ChatResponse response = chatModel.call(new Prompt(List.of(new UserMessage(systemPrompt), userMessage)));
        return response.getResult().getOutput().getContent();
    }

    private String mockClaudeResponse(String text) {
        return """
                {
                  "supplier": "Mock Wholesaler Co.",
                  "date": "2024-05-20",
                  "total": 145.50,
                  "items": [
                    {"name": "Organic Milk 2L", "quantity": 10, "price": 4.50, "total": 45.00},
                    {"name": "Coffee Beans 1kg", "quantity": 5, "price": 20.10, "total": 100.50}
                  ]
                }
                """;
    }
}
