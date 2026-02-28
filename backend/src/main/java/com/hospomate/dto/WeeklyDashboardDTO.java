package com.hospomate.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class WeeklyDashboardDTO {
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private Map<String, BigDecimal> revenueByCategory;
    private Map<String, BigDecimal> revenueByDay;
    private List<HourlyInsightDTO> hourlyInsights;

    // Staff Name -> Revenue Generated
    private Map<String, BigDecimal> revenueByStaffName;

    // Job Title -> Revenue Generated
    private Map<String, BigDecimal> revenueByJobTitle;

    // Trading Hours
    private String openingTime;
    private String closingTime;

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Map<String, BigDecimal> getRevenueByCategory() {
        return revenueByCategory;
    }

    public void setRevenueByCategory(Map<String, BigDecimal> revenueByCategory) {
        this.revenueByCategory = revenueByCategory;
    }

    public Map<String, BigDecimal> getRevenueByDay() {
        return revenueByDay;
    }

    public void setRevenueByDay(Map<String, BigDecimal> revenueByDay) {
        this.revenueByDay = revenueByDay;
    }

    public List<HourlyInsightDTO> getHourlyInsights() {
        return hourlyInsights;
    }

    public void setHourlyInsights(List<HourlyInsightDTO> hourlyInsights) {
        this.hourlyInsights = hourlyInsights;
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

    public String getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(String openingTime) {
        this.openingTime = openingTime;
    }

    public String getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(String closingTime) {
        this.closingTime = closingTime;
    }
}
