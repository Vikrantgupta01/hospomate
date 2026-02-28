package com.hospomate.service;

import com.hospomate.dto.HourlyInsightDTO;
import com.hospomate.model.*;
import com.hospomate.repository.JobRoleContributionRepository;
import com.hospomate.repository.StaffRepository;
import com.hospomate.repository.StoreRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RevenueIntelligenceService {

    private final JobRoleContributionRepository contributionRepository;
    private final StoreRepository storeRepository;
    private final StaffRepository staffRepository;
    private final SquareService squareService;

    public RevenueIntelligenceService(
            JobRoleContributionRepository contributionRepository,
            StoreRepository storeRepository,
            StaffRepository staffRepository,
            SquareService squareService) {
        this.contributionRepository = contributionRepository;
        this.storeRepository = storeRepository;
        this.staffRepository = staffRepository;
        this.squareService = squareService;
    }

    public HourlyInsightDTO calculateHourlyInsight(Long storeId, LocalDateTime start, LocalDateTime end,
            List<com.squareup.square.types.Order> squareOrders, List<com.squareup.square.types.Shift> squareShifts,
            Map<String, String> variationToCategoryMap) {
        java.util.Objects.requireNonNull(storeId, "Store ID cannot be null");
        Store store = storeRepository.findById(storeId).orElseThrow(() -> new RuntimeException("Store not found"));

        List<JobRoleContribution> contributions = contributionRepository.findByStoreId(storeId);

        HourlyInsightDTO dto = new HourlyInsightDTO();
        dto.setStartTime(start);
        dto.setEndTime(end);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalItemsSold = 0;
        Map<String, BigDecimal> revenueByCategory = new HashMap<>();

        // Aggregate Revenue and Items from Square Orders Memory List
        for (com.squareup.square.types.Order order : squareOrders) {
            String closedAtStr = order.getClosedAt().orElse(null);
            if (closedAtStr == null)
                continue;

            LocalDateTime closedAt = java.time.OffsetDateTime.parse(closedAtStr)
                    .atZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime();

            // strictly starts on or after start, strictly before end
            if (closedAt.isBefore(start) || !closedAt.isBefore(end)) {
                continue; // Not in this hour bucket
            }

            if (order.getLineItems().isPresent() && !order.getLineItems().get().isEmpty()) {
                for (com.squareup.square.types.OrderLineItem item : order.getLineItems().get()) {
                    long qty = 1;
                    try {
                        qty = Long.parseLong(item.getQuantity());
                    } catch (NumberFormatException ignored) {
                    }

                    totalItemsSold += qty;

                    String categoryName = "Uncategorized";
                    if (item.getCatalogObjectId().isPresent()) {
                        String variationId = item.getCatalogObjectId().get();
                        if (variationToCategoryMap.containsKey(variationId)) {
                            categoryName = variationToCategoryMap.get(variationId);
                        }
                    }

                    double itemTotal = 0.0;
                    if (item.getGrossSalesMoney() != null && item.getGrossSalesMoney().isPresent()) {
                        itemTotal = item.getGrossSalesMoney().get().getAmount().orElse(0L).doubleValue() / 100.0;
                    } else if (item.getTotalMoney() != null && item.getTotalMoney().isPresent()) {
                        itemTotal = item.getTotalMoney().get().getAmount().orElse(0L).doubleValue() / 100.0;
                    }

                    totalRevenue = totalRevenue.add(BigDecimal.valueOf(itemTotal));

                    revenueByCategory.put(categoryName,
                            revenueByCategory.getOrDefault(categoryName, BigDecimal.ZERO)
                                    .add(BigDecimal.valueOf(itemTotal)));
                } // end for items

                if (order.getServiceCharges().isPresent()) {
                    for (com.squareup.square.types.OrderServiceCharge sc : order.getServiceCharges().get()) {
                        if (sc.getAmountMoney() != null && sc.getAmountMoney().isPresent()) {
                            double scAmount = sc.getAmountMoney().get().getAmount().orElse(0L).doubleValue() / 100.0;
                            totalRevenue = totalRevenue.add(BigDecimal.valueOf(scAmount));
                            revenueByCategory.put("Surcharges", revenueByCategory
                                    .getOrDefault("Surcharges", BigDecimal.ZERO).add(BigDecimal.valueOf(scAmount)));
                        }
                    }
                }
            } else {
                if (order.getTotalMoney().isPresent()) {
                    double customAmount = order.getTotalMoney().get().getAmount().orElse(0L).doubleValue() / 100.0;

                    // Subtract tip if present inside net amounts
                    // Unfortunately Square Order totalMoney includes tip, so we must subtract it if
                    // we want gross revenue from custom amounts.
                    if (order.getNetAmounts() != null && order.getNetAmounts().isPresent()
                            && order.getNetAmounts().get().getTipMoney().isPresent()) {
                        double tip = order.getNetAmounts().get().getTipMoney().get().getAmount().orElse(0L)
                                .doubleValue() / 100.0;
                        customAmount -= tip;
                    }

                    totalRevenue = totalRevenue.add(BigDecimal.valueOf(customAmount));
                    totalItemsSold += 1;
                    revenueByCategory.put("Custom Amount", revenueByCategory
                            .getOrDefault("Custom Amount", BigDecimal.ZERO).add(BigDecimal.valueOf(customAmount)));
                }
            } // end logic lines

            if (start.getHour() == 10) {
                double orderTotal = order.getTotalMoney().isPresent()
                        ? order.getTotalMoney().get().getAmount().orElse(0L).doubleValue() / 100.0
                        : 0.0;
                System.out.println("DEBUG ORDER | OrderTotalId: " + order.getId() + " | OrderTotal: " + orderTotal);
            }
        } // end for orders

        dto.setTotalRevenue(totalRevenue);
        dto.setTotalItemsSold(totalItemsSold);
        dto.setRevenueByCategory(revenueByCategory);

        // Staff Analysis - Filter Square Shifts into this hourly bucket
        List<com.squareup.square.types.Shift> activeShifts = new java.util.ArrayList<>();
        for (com.squareup.square.types.Shift shift : squareShifts) {
            String startAtStr = shift.getStartAt();
            String endAtStr = shift.getEndAt().orElse(null);
            if (startAtStr == null) {
                continue;
            }

            LocalDateTime shiftStart = java.time.OffsetDateTime.parse(startAtStr)
                    .atZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime();
            LocalDateTime shiftEnd = endAtStr != null ? java.time.OffsetDateTime.parse(endAtStr)
                    .atZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime()
                    : LocalDateTime.now();

            // Check overlap
            if (shiftStart.isBefore(end) && shiftEnd.isAfter(start)) {
                activeShifts.add(shift);
            }
        }

        int activeStaffCount = activeShifts.size();
        dto.setActiveStaffCount(activeStaffCount);

        BigDecimal threshold = store.getRevenuePerLabourHourThreshold();
        if (threshold == null) {
            threshold = new BigDecimal("50.00");
        }

        if (activeStaffCount > 0) {
            BigDecimal revenuePerStaff = totalRevenue.divide(BigDecimal.valueOf(activeStaffCount), 2,
                    RoundingMode.HALF_UP);
            dto.setRevenuePerStaffMember(revenuePerStaff);
            dto.setUnderutilised(revenuePerStaff.compareTo(threshold) < 0);
        } else {
            dto.setUnderutilised(false);
            dto.setRevenuePerStaffMember(BigDecimal.ZERO);
        }

        // Feature 3.2: Job Title Contribution Mapping
        // Distribute revenue based on the roles present
        Map<String, BigDecimal> revenueByJobTitle = new HashMap<>();
        Map<String, BigDecimal> revenueByStaffName = new HashMap<>();

        // 1. Group staff by role and resolve Local Staff Name/Title through TeamMember
        // ID
        Map<String, Integer> staffCountByRole = new HashMap<>();

        List<Staff> localStaffList = staffRepository.findByStoreId(storeId);

        // Fetch real Square Staff names to match against Local Staff DB
        Map<String, String> squareStaffNames = squareService.fetchTeamMemberNames();

        for (com.squareup.square.types.Shift s : activeShifts) {
            String tmId = s.getTeamMemberId().orElse(null);

            String role = "Unassigned";
            String squareName = squareStaffNames.getOrDefault(tmId, "Unknown Square Staff");

            // Attempt to match the Square Name closely to our Database Staff name
            for (Staff localStaff : localStaffList) {
                if (localStaff.getName() != null
                        && squareName.toLowerCase().contains(localStaff.getName().toLowerCase().trim())) {
                    if (localStaff.getJobTitle() != null) {
                        role = localStaff.getJobTitle();
                    }
                    break;
                }
            }

            staffCountByRole.put(role, staffCountByRole.getOrDefault(role, 0) + 1);
        }

        // 2. Build Contribution Map: Category Name -> (Role -> Percentage)
        Map<String, Map<String, BigDecimal>> categoryRolePercentages = new HashMap<>();
        for (JobRoleContribution contrib : contributions) {
            String catName = contrib.getCategoryName();
            categoryRolePercentages.putIfAbsent(catName, new HashMap<>());
            categoryRolePercentages.get(catName).put(contrib.getJobTitle(),
                    contrib.getContributionPercentage().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        }

        // 3. Re-distribute category revenue to roles
        for (Map.Entry<String, BigDecimal> catEntry : revenueByCategory.entrySet()) {
            String cat = catEntry.getKey();
            BigDecimal catRev = catEntry.getValue();

            Map<String, BigDecimal> rolePercentages = categoryRolePercentages.getOrDefault(cat, new HashMap<>());

            for (Map.Entry<String, BigDecimal> roleEntry : rolePercentages.entrySet()) {
                String role = roleEntry.getKey();
                BigDecimal percentage = roleEntry.getValue();

                // If there are staff in this role currently working
                if (staffCountByRole.containsKey(role)) {
                    BigDecimal roleRevenueShare = catRev.multiply(percentage);
                    revenueByJobTitle.put(role,
                            revenueByJobTitle.getOrDefault(role, BigDecimal.ZERO).add(roleRevenueShare));
                }
            }
        }

        dto.setRevenueByJobTitle(revenueByJobTitle);

        // 4. Distribute Job Title Revenue equally among staff members in that role
        for (com.squareup.square.types.Shift s : activeShifts) {
            String tmId = s.getTeamMemberId().orElse(null);
            String squareName = squareStaffNames.getOrDefault(tmId, "Square User " + tmId);

            String role = "Unassigned";
            for (Staff localStaff : localStaffList) {
                if (localStaff.getName() != null
                        && squareName.toLowerCase().contains(localStaff.getName().toLowerCase().trim())) {
                    if (localStaff.getJobTitle() != null) {
                        role = localStaff.getJobTitle();
                    }
                    break;
                }
            }

            int count = staffCountByRole.getOrDefault(role, 1);
            BigDecimal totalRoleRev = revenueByJobTitle.getOrDefault(role, BigDecimal.ZERO);

            BigDecimal staffShare = totalRoleRev.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);

            String staffName = squareName;
            revenueByStaffName.put(staffName,
                    revenueByStaffName.getOrDefault(staffName, BigDecimal.ZERO).add(staffShare));
        }

        dto.setRevenueByStaffName(revenueByStaffName);

        return dto;
    }

    @org.springframework.cache.annotation.Cacheable(value = "weeklyInsights", key = "#storeId + '-' + #weekStart")
    public com.hospomate.dto.WeeklyDashboardDTO getWeeklyDashboard(Long storeId, java.time.LocalDate weekStart) {
        com.hospomate.dto.WeeklyDashboardDTO weeklyDTO = new com.hospomate.dto.WeeklyDashboardDTO();
        java.util.List<HourlyInsightDTO> hourlyInsights = new java.util.ArrayList<>();

        BigDecimal weeklyTotalRevenue = BigDecimal.ZERO;
        Map<String, BigDecimal> weeklyRevenueByCategory = new HashMap<>();
        Map<String, BigDecimal> weeklyRevenueByDay = new HashMap<>();
        Map<String, BigDecimal> weeklyRevenueByJobTitle = new HashMap<>();
        Map<String, BigDecimal> weeklyRevenueByStaffName = new HashMap<>();

        // NEW LOGIC: Batch Fetch from Square once per Week
        LocalDateTime globalStart = weekStart.atStartOfDay();
        LocalDateTime globalEnd = weekStart.plusDays(7).atStartOfDay();

        List<com.squareup.square.types.Shift> squareShifts = squareService.fetchSquareShifts(globalStart, globalEnd);
        List<com.squareup.square.types.Order> squareOrders = squareService.fetchDetailedSquareOrders(globalStart,
                globalEnd);
        System.out.println("DEBUG: Fetched " + squareShifts.size() + " shifts and " + squareOrders.size()
                + " orders for week starting " + weekStart);
        Map<String, String> variationToCategoryMap = squareService.fetchVariationToCategoryMap();

        for (int i = 0; i < 7; i++) {
            java.time.LocalDate date = weekStart.plusDays(i);
            String dayName = date.getDayOfWeek().name();
            BigDecimal dailyRevenue = BigDecimal.ZERO;

            // Analyze all 24 hours to ensure weekly totals encompass pre/post-trading sales
            for (int h = 0; h < 24; h++) {
                LocalDateTime start = date.atTime(h, 0);
                LocalDateTime end = start.plusHours(1);

                HourlyInsightDTO hourlyDto = calculateHourlyInsight(storeId, start, end, squareOrders, squareShifts,
                        variationToCategoryMap);
                hourlyInsights.add(hourlyDto);

                dailyRevenue = dailyRevenue.add(hourlyDto.getTotalRevenue());
                weeklyTotalRevenue = weeklyTotalRevenue.add(hourlyDto.getTotalRevenue());

                for (Map.Entry<String, BigDecimal> catEntry : hourlyDto.getRevenueByCategory().entrySet()) {
                    weeklyRevenueByCategory.put(catEntry.getKey(),
                            weeklyRevenueByCategory.getOrDefault(catEntry.getKey(), BigDecimal.ZERO)
                                    .add(catEntry.getValue()));
                }

                for (Map.Entry<String, BigDecimal> jobEntry : hourlyDto.getRevenueByJobTitle().entrySet()) {
                    weeklyRevenueByJobTitle.put(jobEntry.getKey(),
                            weeklyRevenueByJobTitle.getOrDefault(jobEntry.getKey(), BigDecimal.ZERO)
                                    .add(jobEntry.getValue()));
                }

                for (Map.Entry<String, BigDecimal> staffEntry : hourlyDto.getRevenueByStaffName().entrySet()) {
                    weeklyRevenueByStaffName.put(staffEntry.getKey(),
                            weeklyRevenueByStaffName.getOrDefault(staffEntry.getKey(), BigDecimal.ZERO)
                                    .add(staffEntry.getValue()));
                }
            }
            weeklyRevenueByDay.put(dayName, dailyRevenue);
        }

        weeklyDTO.setTotalRevenue(weeklyTotalRevenue);
        weeklyDTO.setRevenueByCategory(weeklyRevenueByCategory);
        weeklyDTO.setRevenueByDay(weeklyRevenueByDay);
        weeklyDTO.setRevenueByJobTitle(weeklyRevenueByJobTitle);
        weeklyDTO.setRevenueByStaffName(weeklyRevenueByStaffName);
        weeklyDTO.setHourlyInsights(hourlyInsights);

        return weeklyDTO;
    }
}
