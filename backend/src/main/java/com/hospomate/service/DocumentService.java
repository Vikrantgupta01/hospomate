package com.hospomate.service;

import com.hospomate.model.KnowledgeDoc;
import com.hospomate.repository.KnowledgeDocRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    private final KnowledgeDocRepository knowledgeDocRepository;
    private final VectorStore vectorStore;

    @Autowired
    public DocumentService(KnowledgeDocRepository knowledgeDocRepository, VectorStore vectorStore) {
        this.knowledgeDocRepository = knowledgeDocRepository;
        this.vectorStore = vectorStore;
    }

    public List<KnowledgeDoc> getAllDocuments() {
        return knowledgeDocRepository.findAll();
    }

    public List<KnowledgeDoc> getDocumentsByStore(Long storeId) {
        return knowledgeDocRepository.findByStoreId(storeId);
    }

    public KnowledgeDoc ingestDocument(MultipartFile file, Long storeId) throws IOException {
        logger.info("Starting ingestion for file: {} for storeId: {}", file.getOriginalFilename(), storeId);

        // 1. Save Entity
        KnowledgeDoc doc = new KnowledgeDoc();
        doc.setFilename(file.getOriginalFilename());
        doc.setUploadDate(LocalDateTime.now());
        doc.setStatus(KnowledgeDoc.Status.PENDING);
        doc.setStoreId(storeId);
        doc = knowledgeDocRepository.save(doc);

        try {
            // 2. Read PDF using Spring AI
            Resource resource = new ByteArrayResource(file.getBytes());
            PagePdfDocumentReader reader = new PagePdfDocumentReader(resource);
            List<Document> documents = reader.get();
            if (documents == null || documents.isEmpty()) {
                throw new RuntimeException("No content extracted from PDF");
            }
            logger.info("Extracted {} documents from PDF", documents.size());
            documents.forEach(d -> logger.info("Doc Content Length: {}",
                    d.getContent() != null ? d.getContent().length() : "NULL"));

            List<Document> validDocuments = documents.stream()
                    .filter(d -> d.getContent() != null && !d.getContent().isBlank())
                    .toList();

            if (validDocuments.isEmpty()) {
                throw new RuntimeException("No valid text content extracted from PDF");
            }

            // 3. Split into chunks (Manual Character Splitter to avoid NPE in
            // TokenTextSplitter)
            List<Document> chunks = new java.util.ArrayList<>();
            int chunkSize = 2000; // Characters
            int overlap = 200;

            for (Document d : validDocuments) {
                String content = d.getContent();
                for (int i = 0; i < content.length(); i += (chunkSize - overlap)) {
                    int end = Math.min(i + chunkSize, content.length());
                    String chunkText = content.substring(i, end);
                    if (chunkText.isBlank())
                        continue; // Skip blank chunks

                    // Copy metadata
                    try {
                        Map<String, Object> metadata = new java.util.HashMap<>(d.getMetadata());
                        chunks.add(new Document(chunkText, metadata));
                    } catch (Exception e) {
                        logger.error("Chunk processing failed. Chunk length: {}. Content: [{}]", chunkText.length(),
                                chunkText);
                        throw e;
                    }
                }
            }

            // 4. Add Metadata
            for (Document chunk : chunks) {
                chunk.getMetadata().putAll(Map.of(
                        "docId", String.valueOf(doc.getId()),
                        "storeId", String.valueOf(storeId),
                        "filename", doc.getFilename(),
                        "type", "KNOWLEDGE_BASE"));
            }

            // 5. Store in Vector Store
            vectorStore.add(chunks);

            // 6. Update Status
            doc.setStatus(KnowledgeDoc.Status.INDEXED);
            logger.info("Successfully ingested document: {}", doc.getFilename());

        } catch (Exception e) {
            logger.error("Failed to ingest document", e);
            doc.setStatus(KnowledgeDoc.Status.FAILED);
            doc.setErrorMessage(e.toString());
        }

        return knowledgeDocRepository.save(doc);
    }
}
