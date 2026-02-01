package com.hospomate.controller;

import com.hospomate.model.JobArea;
import com.hospomate.model.Store;
import com.hospomate.repository.JobAreaRepository;
import com.hospomate.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-areas")
public class JobAreaController {

    @Autowired
    private JobAreaRepository jobAreaRepository;

    @Autowired
    private StoreRepository storeRepository;

    @GetMapping("/store/{storeId}")
    public List<JobArea> getStoreJobAreas(@PathVariable long storeId) {
        return jobAreaRepository.findByStoreId(storeId);
    }

    @PostMapping("/store/{storeId}")
    public JobArea createJobArea(@PathVariable long storeId, @RequestBody JobArea jobArea) {
        Store store = storeRepository.findById(storeId).orElseThrow();
        jobArea.setStore(store);
        return jobAreaRepository.save(jobArea);
    }

    @DeleteMapping("/{id}")
    public void deleteJobArea(@PathVariable long id) {
        jobAreaRepository.deleteById(id);
    }
}
