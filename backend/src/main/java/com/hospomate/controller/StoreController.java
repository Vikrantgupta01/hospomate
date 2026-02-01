package com.hospomate.controller;

import com.hospomate.model.MenuItem;
import com.hospomate.model.Store;
import com.hospomate.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    @Autowired
    private StoreService storeService;

    @GetMapping
    public List<Store> getAllStores() {
        return storeService.getAllStores();
    }

    @GetMapping("/search")
    public List<Store> searchStores(@RequestParam String query) {
        return storeService.searchStores(query);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Store> getStore(@PathVariable Long id) {
        return storeService.getStoreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/menu")
    public List<MenuItem> getStoreMenu(@PathVariable Long id) {
        return storeService.getMenuByStoreId(id);
    }

    // Admin/Owner only - simplified for now
    @PostMapping("/{id}/menu")
    public MenuItem addMenuItem(@PathVariable Long id, @RequestBody MenuItem item) {
        return storeService.addMenuItem(id, item);
    }

    @PutMapping("/menu/{itemId}")
    public MenuItem updateMenuItem(@PathVariable Long itemId, @RequestBody MenuItem item) {
        return storeService.updateMenuItem(itemId, item);
    }

    @DeleteMapping("/menu/{itemId}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long itemId) {
        storeService.deleteMenuItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public Store updateStore(@PathVariable Long id, @RequestBody Store store) {
        return storeService.updateStore(id, store);
    }
}
