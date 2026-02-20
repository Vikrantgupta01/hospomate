package com.hospomate.controller;

import com.hospomate.model.KnowledgeDoc;
import com.hospomate.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    @Autowired
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public List<KnowledgeDoc> getAllDocuments(@RequestParam(required = false) Long storeId) {
        if (storeId != null) {
            return documentService.getDocumentsByStore(storeId);
        }
        return documentService.getAllDocuments();
    }

    @PostMapping
    public ResponseEntity<KnowledgeDoc> uploadDocument(@RequestParam("file") MultipartFile file,
            @RequestParam("storeId") Long storeId) {
        try {
            KnowledgeDoc doc = documentService.ingestDocument(file, storeId);
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
