package com.hospomate.repository;

import com.hospomate.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
