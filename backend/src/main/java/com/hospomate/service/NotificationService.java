package com.hospomate.service;

import com.hospomate.model.Procedure;
import com.hospomate.model.ProcedureExecution;
import com.hospomate.repository.ProcedureExecutionRepository;
import com.hospomate.repository.ProcedureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private ProcedureRepository procedureRepository;

    @Autowired
    private ProcedureExecutionRepository executionRepository;

    // Run every 15 minutes
    @Scheduled(fixedRate = 900000)
    public void checkOverdueProcedures() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Procedure> procedures = procedureRepository.findAll();

        for (Procedure procedure : procedures) {
            LocalTime cutoff = procedure.getCutoffTime();
            // Check if 1 hour passed since cutoff
            if (now.isAfter(cutoff.plusHours(1))) {
                // Check if execution exists and is completed
                boolean completed = executionRepository.findByProcedureIdAndDate(procedure.getId(), today).stream()
                        .anyMatch(e -> e.getStatus() == ProcedureExecution.Status.COMPLETED);

                if (!completed) {
                    sendNotification(procedure);
                }
            }
        }
    }

    private void sendNotification(Procedure procedure) {
        // In a real app, this would send Email/SMS/Push
        System.out.println("ALERT: Procedure '" + procedure.getName() +
                "' for " + procedure.getJobArea().getName() +
                " was not completed by cutoff time " + procedure.getCutoffTime());
    }
}
