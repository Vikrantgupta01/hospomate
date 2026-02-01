package com.hospomate.repository;

import com.hospomate.model.InvoiceCost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceCostRepository extends JpaRepository<InvoiceCost, Long> {
    List<InvoiceCost> findByStoreId(Long storeId);
}
