package com.hospomate.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "procedures")
public class Procedure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne
    @JoinColumn(name = "job_area_id", nullable = false)
    private JobArea jobArea;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProcedureType type;

    @Column(nullable = false)
    private LocalTime cutoffTime;

    @OneToMany(mappedBy = "procedure", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ProcedureTask> tasks = new java.util.ArrayList<>();

    public enum ProcedureType {
        OPENING, CLOSING
    }

    // Getters and Setters

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

    public JobArea getJobArea() {
        return jobArea;
    }

    public void setJobArea(JobArea jobArea) {
        this.jobArea = jobArea;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ProcedureType getType() {
        return type;
    }

    public void setType(ProcedureType type) {
        this.type = type;
    }

    public LocalTime getCutoffTime() {
        return cutoffTime;
    }

    public void setCutoffTime(LocalTime cutoffTime) {
        this.cutoffTime = cutoffTime;
    }

    public java.util.List<ProcedureTask> getTasks() {
        return tasks;
    }

    public void setTasks(java.util.List<ProcedureTask> tasks) {
        this.tasks = tasks;
    }
}
