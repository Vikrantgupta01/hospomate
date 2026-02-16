package com.hospomate.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class InvoiceCost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long storeId;

    private String supplierName;
    private LocalDate invoiceDate;
    private Double totalAmount;

    @Column(columnDefinition = "TEXT")
    private String rawJsonData; // Stores the full structured data from Claude

    private String originalFileName;
    private String status; // e.g. "PENDING_REVIEW", "CONFIRMED"

    public InvoiceCost() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getRawJsonData() {
        return rawJsonData;
    }

    public void setRawJsonData(String rawJsonData) {
        this.rawJsonData = rawJsonData;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
