package com.hospomate.controller;

import com.hospomate.dto.WeeklyDashboardDTO;
import com.hospomate.service.RevenueIntelligenceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/insights")
public class IntelligenceController {

    private final RevenueIntelligenceService intelligenceService;

    public IntelligenceController(RevenueIntelligenceService intelligenceService) {
        this.intelligenceService = intelligenceService;
    }

    @GetMapping("/weekly/{storeId}")
    public ResponseEntity<WeeklyDashboardDTO> getWeeklyDashboard(
            @PathVariable Long storeId,
            @RequestParam("weekStart") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        WeeklyDashboardDTO dashboard = intelligenceService.getWeeklyDashboard(storeId, weekStart);
        return ResponseEntity.ok(dashboard);
    }
}
