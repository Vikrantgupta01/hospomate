package com.hospomate.dto;

import java.time.LocalDateTime;

public class ShiftReportDTO {
    private String staffName;
    private String dayOfWeek;
    private String date;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private LocalDateTime actualClockInTime;
    private LocalDateTime actualClockOutTime;
    private long varianceMinutes;

    // Getters and Setters

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public LocalDateTime getScheduledStartTime() {
        return scheduledStartTime;
    }

    public void setScheduledStartTime(LocalDateTime scheduledStartTime) {
        this.scheduledStartTime = scheduledStartTime;
    }

    public LocalDateTime getScheduledEndTime() {
        return scheduledEndTime;
    }

    public void setScheduledEndTime(LocalDateTime scheduledEndTime) {
        this.scheduledEndTime = scheduledEndTime;
    }

    public LocalDateTime getActualClockInTime() {
        return actualClockInTime;
    }

    public void setActualClockInTime(LocalDateTime actualClockInTime) {
        this.actualClockInTime = actualClockInTime;
    }

    public LocalDateTime getActualClockOutTime() {
        return actualClockOutTime;
    }

    public void setActualClockOutTime(LocalDateTime actualClockOutTime) {
        this.actualClockOutTime = actualClockOutTime;
    }

    public long getVarianceMinutes() {
        return varianceMinutes;
    }

    public void setVarianceMinutes(long varianceMinutes) {
        this.varianceMinutes = varianceMinutes;
    }
}
