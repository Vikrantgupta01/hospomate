package com.hospomate.controller;

import com.hospomate.model.Staff;
import com.hospomate.repository.JobAreaRepository;
import com.hospomate.repository.StaffRepository;
import com.hospomate.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private JobAreaRepository jobAreaRepository;

    @Autowired
    private StoreRepository storeRepository;

    @GetMapping("/store/{storeId}")
    public List<Staff> getStoreStaff(@PathVariable long storeId) {
        return staffRepository.findByStoreId(storeId);
    }

    @PostMapping
    public Staff createStaff(@RequestBody Staff staff) {
        if (staff.getStore() != null && staff.getStore().getId() != null) {
            staff.setStore(storeRepository.findById(staff.getStore().getId()).orElseThrow());
        }
        if (staff.getJobArea() != null && staff.getJobArea().getId() != null) {
            staff.setJobArea(jobAreaRepository.findById(staff.getJobArea().getId()).orElse(null));
        }
        return staffRepository.save(staff);
    }

    @PutMapping("/{id}")
    public Staff updateStaff(@PathVariable long id, @RequestBody Staff staffDetails) {
        Staff staff = staffRepository.findById(id).orElseThrow();
        staff.setName(staffDetails.getName());
        staff.setEmail(staffDetails.getEmail());
        staff.setPhone(staffDetails.getPhone());
        staff.setJobTitle(staffDetails.getJobTitle());
        staff.setHourlyRate(staffDetails.getHourlyRate());

        if (staffDetails.getJobArea() != null && staffDetails.getJobArea().getId() != null) {
            staff.setJobArea(jobAreaRepository.findById(staffDetails.getJobArea().getId()).orElse(null));
        } else {
            staff.setJobArea(null);
        }

        return staffRepository.save(staff);
    }

    @DeleteMapping("/{id}")
    public void deleteStaff(@PathVariable long id) {
        staffRepository.deleteById(id);
    } // No changes needed here, just context matching coverage
}
