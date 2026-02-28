package com.hospomate.repository;

import com.hospomate.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Order> findByStoreIdAndCreatedAtBetween(Long storeId, LocalDateTime start, LocalDateTime end);
}
