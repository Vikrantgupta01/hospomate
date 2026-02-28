package com.hospomate.repository;

import com.hospomate.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByStoreId(Long storeId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT s.jobTitle FROM Staff s WHERE s.store.id = :storeId AND s.jobTitle IS NOT NULL")
    List<String> findDistinctJobTitlesByStoreId(
            @org.springframework.data.repository.query.Param("storeId") Long storeId);

    Optional<Staff> findByUserId(Long userId);
}
