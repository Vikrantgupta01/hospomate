package com.hospomate.controller;

import com.hospomate.dto.OrderRequest;
import com.hospomate.model.Order;
import com.hospomate.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping("/store/{storeId}")
    public List<Order> getStoreOrders(@PathVariable Long storeId) {
        return orderService.getOrdersByStore(storeId);
    }

    @GetMapping("/customer/{customerId}")
    public List<Order> getCustomerOrders(@PathVariable Long customerId) {
        return orderService.getOrdersByCustomer(customerId);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
}
