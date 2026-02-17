package com.hospomate.repository;

import com.hospomate.model.ProcedureExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProcedureExecutionRepository extends JpaRepository<ProcedureExecution, Long> {
    List<ProcedureExecution> findByProcedureIdAndDate(Long procedureId, LocalDate date);

    Optional<ProcedureExecution> findByProcedureIdAndDateAndStatus(Long procedureId, LocalDate date,
            ProcedureExecution.Status status);

    List<ProcedureExecution> findByDate(LocalDate date);
}
