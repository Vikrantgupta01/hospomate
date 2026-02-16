package com.hospomate.controller;

import com.hospomate.model.Shift;
import com.hospomate.dto.ShiftComparisonDTO;
import com.hospomate.repository.ShiftRepository;
import com.hospomate.service.SquareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private SquareService squareService;

    @GetMapping("/staff/{staffId}")
    public List<Shift> getStaffShifts(@PathVariable long staffId) {
        return shiftRepository.findByStaffId(staffId);
    }

    @PostMapping
    public Shift createShift(@RequestBody Shift shift) {
        return shiftRepository.save(shift);
    }

    @PostMapping("/{id}/clock-in")
    public ResponseEntity<Shift> clockIn(@PathVariable long id) {
        Shift shift = shiftRepository.findById(id).orElseThrow();
        shift.setClockInTime(LocalDateTime.now());
        return ResponseEntity.ok(shiftRepository.save(shift));
    }

    @GetMapping("/store/{storeId}")
    public List<Shift> getStoreShifts(@PathVariable long storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        if (start != null && end != null) {
            return shiftRepository.findByStaff_Store_IdAndStartTimeBetween(storeId, start, end);
        }
        return shiftRepository.findByStaff_Store_Id(storeId);
    }

    @PostMapping("/{id}/clock-out")
    public ResponseEntity<Shift> clockOut(@PathVariable long id) {
        Shift shift = shiftRepository.findById(id).orElseThrow();
        shift.setClockOutTime(LocalDateTime.now());
        return ResponseEntity.ok(shiftRepository.save(shift));
    }

    @PutMapping("/{id}")
    public Shift updateShift(@PathVariable long id, @RequestBody Shift shiftDetails) {
        Shift shift = shiftRepository.findById(id).orElseThrow();
        shift.setStartTime(shiftDetails.getStartTime());
        shift.setEndTime(shiftDetails.getEndTime());
        shift.setJobArea(shiftDetails.getJobArea());
        shift.setStaff(shiftDetails.getStaff()); // Re-assign staff
        return shiftRepository.save(shift);
    }

    @DeleteMapping("/{id}")
    public void deleteShift(@PathVariable long id) {
        shiftRepository.deleteById(id);
    }

    @PostMapping("/publish/{storeId}")
    public void publishRoster(@PathVariable long storeId) {
        List<Shift> shifts = shiftRepository.findByStaff_Store_Id(storeId);
        for (Shift s : shifts) {
            if (!s.isPublished()) {
                s.setPublished(true);
                shiftRepository.save(s);
            }
        }
        // Mock Notification Trigger here
        System.out.println("Roster published for store " + storeId);
    }

    @GetMapping("/comparison/{storeId}")
    public List<ShiftComparisonDTO> getShiftComparison(@PathVariable long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return squareService.compareShifts(storeId, start, end);
    }

    @GetMapping("/report/{storeId}")
    public Map<String, Object> getShiftReport(@PathVariable long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        // Fetch completely Square-driven report
        return squareService.getSquareShiftReport(storeId, start, end);
    }
}
