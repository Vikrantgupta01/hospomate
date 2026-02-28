package com.hospomate.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "job_role_contributions")
public class JobRoleContribution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false)
    private String jobTitle;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    // e.g. 50.0 for 50%, 100.0 for 100%
    @Column(nullable = false)
    private BigDecimal contributionPercentage;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Store getStore() {
        return store;
    }

    public void setStore(Store store) {
        this.store = store;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getContributionPercentage() {
        return contributionPercentage;
    }

    public void setContributionPercentage(BigDecimal contributionPercentage) {
        this.contributionPercentage = contributionPercentage;
    }
}
