package com.hospomate.repository;

import com.hospomate.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByStoreId(Long storeId);

    Optional<Staff> findByUserId(Long userId);
}
