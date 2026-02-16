package com.hospomate.service;

import com.hospomate.dto.ShiftComparisonDTO;
import com.squareup.square.core.Environment;
import com.squareup.square.SquareClient;

import com.squareup.square.types.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SquareService {

    @Value("${square.access.token}")
    private String accessToken;

    @Value("${square.location.id}")
    private String locationId;

    @Value("${square.environment}")
    private String environment;

    private String locationTimezone; // Cache timezone
    private SquareClient squareClient;

    public SquareService() {
    }

    private SquareClient getClient() {
        if (squareClient == null) {
            squareClient = SquareClient.builder()
                    .token(accessToken)
                    .environment(environment.equalsIgnoreCase("sandbox") ? Environment.SANDBOX : Environment.PRODUCTION)
                    .build();
        }
        return squareClient;
    }

    public Map<String, Object> getSquareShiftReport(Long storeId, LocalDateTime start,
            LocalDateTime end) {

        // Map to merge Scheduled and Actual (Both from Square)
        // Key: "TeamMemberId|YYYY-MM-DD"
        Map<String, com.hospomate.dto.ShiftReportDTO> reportMap = new java.util.HashMap<>();
        Map<String, String> squareStaffNames = fetchTeamMemberNames();
        System.out.println("DEBUG: Fetched " + squareStaffNames.size() + " team members.");

        // 1. Fetch Square Scheduled Shifts
        List<ScheduledShift> scheduledShifts = fetchScheduledShifts(start, end);
        System.out.println("DEBUG: Fetched " + scheduledShifts.size() + " scheduled shifts.");

        for (ScheduledShift sched : scheduledShifts) {
            ScheduledShiftDetails details = sched.getPublishedShiftDetails()
                    .orElse(sched.getDraftShiftDetails().orElse(null));
            if (details == null) {
                System.out.println("DEBUG: Skipping scheduled shift with no details (ID: "
                        + sched.getId().orElse("Unknown") + ")");
                continue;
            }

            String tmId = details.getTeamMemberId().orElse(null);
            if (tmId == null) {
                System.out.println("DEBUG: Skipping scheduled shift with no TeamMemberId");
                continue;
            }

            String startAtStr = details.getStartAt().orElse(null);
            String endAtStr = details.getEndAt().orElse(null);

            LocalDateTime schedStart = parseSquareTime(startAtStr);
            LocalDateTime schedEnd = parseSquareTime(endAtStr);

            if (schedStart == null) {
                System.out.println("DEBUG: Skipping scheduled shift with invalid start time: " + startAtStr);
                continue;
            }

            String date = schedStart.toLocalDate().toString();
            String key = tmId + "|" + date;

            com.hospomate.dto.ShiftReportDTO dto = reportMap.getOrDefault(key, new com.hospomate.dto.ShiftReportDTO());
            String staffName = squareStaffNames.getOrDefault(tmId, "Unknown Square Staff").trim();
            dto.setStaffName(staffName);
            dto.setDate(date);
            dto.setDayOfWeek(schedStart.getDayOfWeek().toString());
            dto.setScheduledStartTime(schedStart);
            dto.setScheduledEndTime(schedEnd);

            // Initialize totals if new
            if (dto.getActualClockInTime() == null) {
                dto.setVarianceMinutes(0);
            }
            reportMap.put(key, dto);
        }
        System.out.println("DEBUG: Processed scheduled shifts. Map size: " + reportMap.size());

        // 2. Fetch Square Shifts (Actual - Timecards)
        List<Shift> actualShifts = fetchSquareShifts(start, end);
        System.out.println("DEBUG: Fetched " + actualShifts.size() + " actual shifts.");

        for (Shift actual : actualShifts) {
            String tmId = actual.getTeamMemberId().orElse(null);
            if (tmId == null)
                continue;

            LocalDateTime actualStart = parseSquareTime(actual.getStartAt()); // Shift.startAt is String (not Optional)
            LocalDateTime actualEnd = parseSquareTime(actual.getEndAt().orElse(null)); // Shift.endAt is Optional

            if (actualStart == null)
                continue;

            String date = actualStart.toLocalDate().toString();
            String key = tmId + "|" + date;

            com.hospomate.dto.ShiftReportDTO dto = reportMap.getOrDefault(key, new com.hospomate.dto.ShiftReportDTO());
            if (dto.getStaffName() == null) {
                String staffName = squareStaffNames.getOrDefault(tmId, "Unknown Square Staff").trim();
                dto.setStaffName(staffName);
            }
            dto.setDate(date);
            if (dto.getDayOfWeek() == null) {
                dto.setDayOfWeek(actualStart.getDayOfWeek().toString());
            }

            dto.setActualClockInTime(actualStart);
            dto.setActualClockOutTime(actualEnd);

            reportMap.put(key, dto);
        }

        // 3. Calculate Variance and finalize list
        List<com.hospomate.dto.ShiftReportDTO> report = new ArrayList<>(reportMap.values());
        for (com.hospomate.dto.ShiftReportDTO dto : report) {
            long scheduledMinutes = 0;
            long actualMinutes = 0;

            if (dto.getScheduledStartTime() != null && dto.getScheduledEndTime() != null) {
                scheduledMinutes = java.time.temporal.ChronoUnit.MINUTES.between(dto.getScheduledStartTime(),
                        dto.getScheduledEndTime());
            }
            if (dto.getActualClockInTime() != null && dto.getActualClockOutTime() != null) {
                actualMinutes = java.time.temporal.ChronoUnit.MINUTES.between(dto.getActualClockInTime(),
                        dto.getActualClockOutTime());
            }

            // Variance: Actual - Scheduled
            // If Only Scheduled (Actual=0), Variance = -Scheduled (Underworked/Absent)
            // If Only Actual (Scheduled=0), Variance = +Actual (Overworked/Unscheduled)
            dto.setVarianceMinutes((int) (actualMinutes - scheduledMinutes));
        }

        // Sort by Date then Name
        report.sort((a, b) -> {
            int dateCmp = b.getDate().compareTo(a.getDate()); // Descending Date
            if (dateCmp != 0)
                return dateCmp;
            return a.getStaffName().compareTo(b.getStaffName());
        });

        System.out.println("DEBUG: Returning report with " + report.size() + " entries.");

        // 4. Fetch Daily Sales
        Map<String, Double> salesMap = fetchDailySales(start, end);

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("shifts", report);
        response.put("dailySales", salesMap);

        return response;
    }

    // Deprecated or Modified: compareShifts (keeping for backward compat if needed,
    // or removing)
    public List<ShiftComparisonDTO> compareShifts(Long storeId, LocalDateTime start, LocalDateTime end) {
        // ... implementation if needed, but we are switching to getSquareShiftReport
        return new ArrayList<>();
    }

    private List<Shift> fetchSquareShifts(LocalDateTime start, LocalDateTime end) {
        List<Shift> allShifts = new ArrayList<>();
        String cursor = null;

        try {
            com.squareup.square.labor.ShiftsClient shiftsClient = getClient().labor().shifts();

            do {
                com.squareup.square.labor.types.SearchShiftsRequest.Builder requestBuilder = com.squareup.square.labor.types.SearchShiftsRequest
                        .builder()
                        .query(ShiftQuery.builder()
                                .filter(ShiftFilter.builder()
                                        .locationIds(List.of(locationId))
                                        .start(TimeRange.builder()
                                                .startAt(start.atZone(ZoneId.systemDefault()).toOffsetDateTime()
                                                        .toString())
                                                .endAt(end.atZone(ZoneId.systemDefault()).toOffsetDateTime().toString())
                                                .build())
                                        .build())
                                .build())
                        .limit(50);

                if (cursor != null) {
                    requestBuilder.cursor(cursor);
                }

                SearchShiftsResponse response = shiftsClient.search(requestBuilder.build());
                if (response.getShifts().isPresent()) {
                    allShifts.addAll(response.getShifts().get());
                }
                cursor = response.getCursor().orElse(null);

            } while (cursor != null);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return allShifts;
    }

    private List<ScheduledShift> fetchScheduledShifts(LocalDateTime start, LocalDateTime end) {
        List<ScheduledShift> allShifts = new ArrayList<>();
        String cursor = null;

        try {
            com.squareup.square.LaborClient laborClient = getClient().labor();

            do {
                SearchScheduledShiftsRequest.Builder requestBuilder = SearchScheduledShiftsRequest.builder()
                        .query(ScheduledShiftQuery.builder()
                                .filter(ScheduledShiftFilter.builder()
                                        .start(TimeRange.builder()
                                                .startAt(start.atZone(ZoneId.systemDefault()).toOffsetDateTime()
                                                        .toString())
                                                .endAt(end.atZone(ZoneId.systemDefault()).toOffsetDateTime().toString())
                                                .build())
                                        .locationIds(List.of(locationId))
                                        .build())
                                .build())
                        .limit(50); // Keep limit at 50 to avoid VALUE_TOO_HIGH error

                if (cursor != null) {
                    requestBuilder.cursor(cursor);
                }

                SearchScheduledShiftsResponse response = laborClient.searchScheduledShifts(requestBuilder.build());
                if (response.getScheduledShifts().isPresent()) {
                    allShifts.addAll(response.getScheduledShifts().get());
                }
                cursor = response.getCursor().orElse(null);

            } while (cursor != null);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return allShifts;
    }

    private Map<String, String> fetchTeamMemberNames() {
        Map<String, String> nameMap = new java.util.HashMap<>();
        try {
            com.squareup.square.TeamMembersClient teamApi = getClient().teamMembers();
            SearchTeamMembersRequest request = SearchTeamMembersRequest.builder()
                    .limit(100)
                    .build();

            SearchTeamMembersResponse response = teamApi.search(request);
            if (response.getTeamMembers().isPresent()) {
                for (TeamMember tm : response.getTeamMembers().get()) {
                    String given = tm.getGivenName().orElse("");
                    String family = tm.getFamilyName().orElse("");
                    String fullName = (given + " " + family).trim();
                    nameMap.put(tm.getId().orElse(""), fullName);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return nameMap;
    }

    private LocalDateTime parseSquareTime(String isoDate) {
        if (isoDate == null)
            return null;
        return OffsetDateTime.parse(isoDate).toLocalDateTime(); // simplified timezone handling
    }

    private Map<String, Double> fetchDailySales(LocalDateTime start, LocalDateTime end) {
        Map<String, Double> salesMap = new java.util.HashMap<>();
        String cursor = null;

        // Ensure we have the timezone
        if (locationTimezone == null) {
            fetchLocationTimezone();
        }
        ZoneId zoneId = (locationTimezone != null) ? ZoneId.of(locationTimezone) : ZoneId.systemDefault();

        try {
            com.squareup.square.OrdersClient ordersClient = getClient().orders();

            do {
                SearchOrdersRequest.Builder requestBuilder = SearchOrdersRequest.builder()
                        .locationIds(List.of(locationId))
                        .query(SearchOrdersQuery.builder()
                                .filter(SearchOrdersFilter.builder()
                                        // Filter in memory to avoid OrderState enum issues
                                        // .stateFilter(...)
                                        .dateTimeFilter(SearchOrdersDateTimeFilter.builder()
                                                .closedAt(TimeRange.builder()
                                                        .startAt(start.atZone(ZoneId.systemDefault()).toOffsetDateTime()
                                                                .toString())
                                                        .endAt(end.atZone(ZoneId.systemDefault()).toOffsetDateTime()
                                                                .toString())
                                                        .build())
                                                .build())
                                        .build())
                                .build())
                        .limit(50);

                if (cursor != null) {
                    requestBuilder.cursor(cursor);
                }

                SearchOrdersResponse response = ordersClient.search(requestBuilder.build());
                if (response.getOrders().isPresent()) {
                    List<Order> orders = response.getOrders().get();

                    for (Order order : orders) {
                        // Handle Optional[COMPLETED] or just COMPLETED
                        String state = String.valueOf(order.getState());

                        if (!state.contains("COMPLETED")) {
                            continue;
                        }
                        if (order.getTotalMoney() != null && order.getTotalMoney().isPresent()) {
                            String closedAt = order.getClosedAt().orElse(null); // ISO String
                            if (closedAt != null) {
                                // Convert UTC ISO string to ZonedDateTime, then to Location's Timezone, then to
                                // LocalDate
                                String date = OffsetDateTime.parse(closedAt)
                                        .atZoneSameInstant(zoneId)
                                        .toLocalDate().toString();

                                // getAmount() returns Optional<Long> in this SDK version
                                double amount = order.getTotalMoney().get().getAmount().orElse(0L).doubleValue()
                                        / 100.0;
                                salesMap.put(date, salesMap.getOrDefault(date, 0.0) + amount);
                            }
                        }
                    }
                }
                cursor = response.getCursor().orElse(null);

            } while (cursor != null);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return salesMap;
    }

    private void fetchLocationTimezone() {
        // Fallback to Sydney for now as SDK methods are failing compilation
        // TODO: Implement dynamic timezone fetching once SDK signature is confirmed
        this.locationTimezone = "Australia/Sydney";
    }
}
