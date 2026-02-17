package com.hospomate.controller;

import com.hospomate.dto.TaskExecutionRequest;
import com.hospomate.model.ProcedureExecution;
import com.hospomate.model.TaskExecution;
import com.hospomate.service.ProcedureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/procedures/execute")
public class ProcedureExecutionController {

    @Autowired
    private ProcedureService procedureService;

    @PostMapping("/{procedureId}/user/{userId}")
    public ProcedureExecution start(@PathVariable Long procedureId, @PathVariable Long userId) {
        return procedureService.startExecution(procedureId, userId);
    }

    @PostMapping("/{executionId}/task/{taskId}")
    public TaskExecution updateTask(@PathVariable Long executionId, @PathVariable Long taskId,
            @RequestBody TaskExecutionRequest request) {
        return procedureService.updateTaskExecution(executionId, taskId, request);
    }

    @PostMapping("/{executionId}/complete")
    public ProcedureExecution complete(@PathVariable Long executionId) {
        return procedureService.completeExecution(executionId);
    }

    @GetMapping("/{id}")
    public ProcedureExecution get(@PathVariable Long id) {
        return procedureService.getExecution(id);
    }
}
