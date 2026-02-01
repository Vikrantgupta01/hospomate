package com.hospomate.service;

import com.hospomate.model.MenuItem;
import com.hospomate.model.Store;
import com.hospomate.repository.MenuItemRepository;
import com.hospomate.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    public List<Store> searchStores(String query) {
        return storeRepository.findByNameContainingIgnoreCase(query);
    }

    public Optional<Store> getStoreById(Long id) {
        return storeRepository.findById(id);
    }

    public List<MenuItem> getMenuByStoreId(Long storeId) {
        return menuItemRepository.findByStoreId(storeId);
    }

    public MenuItem addMenuItem(Long storeId, MenuItem item) {
        Store store = storeRepository.findById(storeId).orElseThrow();
        item.setStore(store);
        return menuItemRepository.save(item);
    }

    public MenuItem updateMenuItem(Long itemId, MenuItem itemDetails) {
        MenuItem item = menuItemRepository.findById(itemId).orElseThrow();
        item.setName(itemDetails.getName());
        item.setDescription(itemDetails.getDescription());
        item.setPrice(itemDetails.getPrice());
        item.setImageUrl(itemDetails.getImageUrl());
        item.setAvailable(itemDetails.isAvailable());
        return menuItemRepository.save(item);
    }

    public void deleteMenuItem(Long itemId) {
        menuItemRepository.deleteById(itemId);
    }

    public Store updateStore(Long storeId, Store storeDetails) {
        Store store = storeRepository.findById(storeId).orElseThrow();
        store.setName(storeDetails.getName());
        store.setAddress(storeDetails.getAddress());
        store.setImageUrl(storeDetails.getImageUrl());
        return storeRepository.save(store);
    }
}
