package com.hospomate.repository;

import com.hospomate.model.ProcedureTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcedureTaskRepository extends JpaRepository<ProcedureTask, Long> {
    List<ProcedureTask> findByProcedureIdOrderByOrderIndexAsc(Long procedureId);
}
