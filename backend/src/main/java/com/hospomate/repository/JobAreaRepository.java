package com.hospomate.repository;

import com.hospomate.model.JobArea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobAreaRepository extends JpaRepository<JobArea, Long> {
    List<JobArea> findByStoreId(Long storeId);
}
