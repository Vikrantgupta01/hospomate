package com.hospomate.dto;

import com.hospomate.model.Shift;
import java.time.LocalDateTime;

public class ShiftComparisonDTO {
    private Shift scheduledShift;
    private LocalDateTime actualStart;
    private LocalDateTime actualEnd;
    private String employeeName;
    private String status; // "MATCHED", "MISSING_CLOCK_IN", "MISSING_CLOCK_OUT", "UNSCHEDULED"
    private long varianceMinutes; // Difference in duration

    public Shift getScheduledShift() {
        return scheduledShift;
    }

    public void setScheduledShift(Shift scheduledShift) {
        this.scheduledShift = scheduledShift;
    }

    public LocalDateTime getActualStart() {
        return actualStart;
    }

    public void setActualStart(LocalDateTime actualStart) {
        this.actualStart = actualStart;
    }

    public LocalDateTime getActualEnd() {
        return actualEnd;
    }

    public void setActualEnd(LocalDateTime actualEnd) {
        this.actualEnd = actualEnd;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getVarianceMinutes() {
        return varianceMinutes;
    }

    public void setVarianceMinutes(long varianceMinutes) {
        this.varianceMinutes = varianceMinutes;
    }
}
