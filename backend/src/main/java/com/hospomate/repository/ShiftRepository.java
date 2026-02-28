package com.hospomate.repository;

import com.hospomate.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByStaffId(Long staffId);

    List<Shift> findByStaff_Store_Id(Long storeId);

    List<Shift> findByStaff_Store_IdAndStartTimeBetween(Long storeId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT s FROM Shift s WHERE s.staff.store.id = :storeId AND s.clockInTime < :end AND (s.clockOutTime IS NULL OR s.clockOutTime > :start)")
    List<Shift> findActiveShiftsByStoreAndTimeRange(@Param("storeId") Long storeId, @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
