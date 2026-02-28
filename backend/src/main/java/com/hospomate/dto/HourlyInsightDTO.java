package com.hospomate.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class HourlyInsightDTO {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private long totalItemsSold;
    private int activeStaffCount;

    // Category Name -> Revenue
    private Map<String, BigDecimal> revenueByCategory;

    // Staff Name -> Revenue Generated
    private Map<String, BigDecimal> revenueByStaffName;

    // Job Title -> Revenue Generated
    private Map<String, BigDecimal> revenueByJobTitle;

    private boolean isUnderutilised;
    private BigDecimal revenuePerStaffMember = BigDecimal.ZERO;

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalItemsSold() {
        return totalItemsSold;
    }

    public void setTotalItemsSold(long totalItemsSold) {
        this.totalItemsSold = totalItemsSold;
    }

    public int getActiveStaffCount() {
        return activeStaffCount;
    }

    public void setActiveStaffCount(int activeStaffCount) {
        this.activeStaffCount = activeStaffCount;
    }

    public Map<String, BigDecimal> getRevenueByCategory() {
        return revenueByCategory;
    }

    public void setRevenueByCategory(Map<String, BigDecimal> revenueByCategory) {
        this.revenueByCategory = revenueByCategory;
    }

    public Map<String, BigDecimal> getRevenueByStaffName() {
        return revenueByStaffName;
    }

    public void setRevenueByStaffName(Map<String, BigDecimal> revenueByStaffName) {
        this.revenueByStaffName = revenueByStaffName;
    }

    public Map<String, BigDecimal> getRevenueByJobTitle() {
        return revenueByJobTitle;
    }

    public void setRevenueByJobTitle(Map<String, BigDecimal> revenueByJobTitle) {
        this.revenueByJobTitle = revenueByJobTitle;
    }

    public boolean isUnderutilised() {
        return isUnderutilised;
    }

    public void setUnderutilised(boolean underutilised) {
        isUnderutilised = underutilised;
    }

    public BigDecimal getRevenuePerStaffMember() {
        return revenuePerStaffMember;
    }

    public void setRevenuePerStaffMember(BigDecimal revenuePerStaffMember) {
        this.revenuePerStaffMember = revenuePerStaffMember;
    }
}
