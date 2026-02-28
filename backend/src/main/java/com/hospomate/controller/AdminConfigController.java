package com.hospomate.controller;

import com.hospomate.model.JobRoleContribution;
import com.hospomate.model.Store;
import com.hospomate.repository.JobRoleContributionRepository;
import com.hospomate.repository.StoreRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/config")
public class AdminConfigController {

    private final JobRoleContributionRepository contributionRepository;
    private final StoreRepository storeRepository;
    private final com.hospomate.service.SquareService squareService;

    public AdminConfigController(
            JobRoleContributionRepository contributionRepository,
            StoreRepository storeRepository,
            com.hospomate.service.SquareService squareService) {
        this.contributionRepository = contributionRepository;
        this.storeRepository = storeRepository;
        this.squareService = squareService;
    }

    @GetMapping("/square-categories")
    public ResponseEntity<List<String>> getSquareCategories() {
        return ResponseEntity.ok(squareService.fetchSquareCategoryNames());
    }

    @GetMapping("/job-roles/{storeId}")
    public ResponseEntity<List<String>> getJobRoles(@PathVariable Long storeId) {
        return ResponseEntity.ok(squareService.fetchSquareJobTitles());
    }

    @GetMapping("/contributions/{storeId}")
    public ResponseEntity<List<JobRoleContribution>> getContributions(@PathVariable Long storeId) {
        return ResponseEntity.ok(contributionRepository.findByStoreId(storeId));
    }

    @PostMapping("/contributions/{storeId}")
    public ResponseEntity<JobRoleContribution> createContribution(@PathVariable Long storeId,
            @RequestBody JobRoleContribution contribution) {
        java.util.Objects.requireNonNull(storeId, "Store ID must not be null");
        Store store = storeRepository.findById(storeId).orElseThrow();
        contribution.setStore(store);
        java.util.Objects.requireNonNull(contribution.getCategoryName(), "Category name must not be null");
        return ResponseEntity.ok(contributionRepository.save(contribution));
    }

    @DeleteMapping("/contributions/{id}")
    public ResponseEntity<Void> deleteContribution(@PathVariable Long id) {
        java.util.Objects.requireNonNull(id, "ID must not be null");
        contributionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
