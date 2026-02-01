package com.hospomate.repository;

import com.hospomate.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByOwnerId(Long ownerId);

    List<Store> findByNameContainingIgnoreCase(String name);
}
