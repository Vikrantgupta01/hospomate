package com.hospomate.model;

import jakarta.persistence.*;

@Entity
@Table(name = "task_executions")
public class TaskExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id", nullable = false)
    private ProcedureExecution execution;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private ProcedureTask task;

    private boolean isCompleted;
    private String photoUrl;
    private String comment;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public ProcedureExecution getExecution() {
        return execution;
    }

    public void setExecution(ProcedureExecution execution) {
        this.execution = execution;
    }

    public ProcedureTask getTask() {
        return task;
    }

    public void setTask(ProcedureTask task) {
        this.task = task;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
