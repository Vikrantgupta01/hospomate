package com.hospomate.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
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
}
