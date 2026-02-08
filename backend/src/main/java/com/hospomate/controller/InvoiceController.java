package com.hospomate.controller;

import com.hospomate.model.InvoiceCost;
import com.hospomate.service.InvoiceParserService;
import com.hospomate.repository.InvoiceCostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/stores/{storeId}/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceParserService parserService;
    private final InvoiceCostRepository repository;

    @PostMapping("/upload")
    public ResponseEntity<InvoiceCost> uploadInvoice(
            @PathVariable Long storeId,
            @RequestParam("file") MultipartFile file) {
        try {
            InvoiceCost result = parserService.parseAndSaveInvoice(storeId, file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<InvoiceCost>> getInvoices(@PathVariable Long storeId) {
        return ResponseEntity.ok(repository.findByStoreId(storeId));
    }

    @PutMapping("/{invoiceId}/status")
    public ResponseEntity<InvoiceCost> updateStatus(
            @PathVariable Long storeId,
            @PathVariable Long invoiceId,
            @RequestParam String status) {

        return repository.findById(invoiceId)
                .map(invoice -> {
                    invoice.setStatus(status);
                    return ResponseEntity.ok(repository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
