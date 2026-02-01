package com.hospomate.controller;

import com.hospomate.model.Shift;
import com.hospomate.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    @Autowired
    private ShiftRepository shiftRepository;

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
    public List<Shift> getStoreShifts(@PathVariable long storeId) {
        // Assuming we need a custom query in repository or filter.
        // For simplicity, let's add finding by Store via Staff.
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
}
