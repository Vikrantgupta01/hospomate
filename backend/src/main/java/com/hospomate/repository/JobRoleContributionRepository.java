package com.hospomate.repository;

import com.hospomate.model.JobRoleContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRoleContributionRepository extends JpaRepository<JobRoleContribution, Long> {
    List<JobRoleContribution> findByStoreId(Long storeId);

    List<JobRoleContribution> findByStoreIdAndJobTitle(Long storeId, String jobTitle);
}
