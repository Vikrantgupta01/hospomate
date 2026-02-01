package com.hospomate.repository;

import com.hospomate.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByStoreId(Long storeId);

    List<MenuItem> findByNameContainingIgnoreCase(String name);
}
