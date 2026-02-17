package com.hospomate.dto;

import com.hospomate.model.ProcedureTask;

public record ProcedureTaskDTO(
        Long id,
        String description,
        ProcedureTask.TaskType taskType,
        boolean isRequired,
        int orderIndex) {
}
