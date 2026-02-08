package com.hospomate.repository;

import com.hospomate.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByStaffId(Long staffId);

    List<Shift> findByStaff_Store_Id(Long storeId);

    List<Shift> findByStaff_Store_IdAndStartTimeBetween(Long storeId, java.time.LocalDateTime start,
            java.time.LocalDateTime end);
}
