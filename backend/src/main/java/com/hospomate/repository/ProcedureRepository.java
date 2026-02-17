package com.hospomate.repository;

import com.hospomate.model.Procedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcedureRepository extends JpaRepository<Procedure, Long> {
    List<Procedure> findByStoreId(Long storeId);

    List<Procedure> findByJobAreaId(Long jobAreaId);
}
