package com.hospomate.service;

import com.hospomate.dto.ProcedureRequest;
import com.hospomate.dto.ProcedureTaskDTO;
import com.hospomate.dto.TaskExecutionRequest;
import com.hospomate.model.*;
import com.hospomate.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProcedureService {
    @Autowired
    private ProcedureRepository procedureRepository;
    @Autowired
    private ProcedureTaskRepository taskRepository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private JobAreaRepository jobAreaRepository;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProcedureExecutionRepository executionRepository;
    @Autowired
    private TaskExecutionRepository taskExecutionRepository;

    public List<Procedure> getProceduresByStore(Long storeId) {
        return procedureRepository.findByStoreId(storeId);
    }

    public List<Procedure> getProceduresForStaff(Long staffId) {
        Staff staff = staffRepository.findById(staffId).orElseThrow(() -> new RuntimeException("Staff not found"));
        if (staff.getJobArea() == null) {
            return List.of();
        }
        return procedureRepository.findByJobAreaId(staff.getJobArea().getId());
    }

    public Procedure getProcedure(Long id) {
        return procedureRepository.findById(id).orElseThrow(() -> new RuntimeException("Procedure not found"));
    }

    @Autowired
    private org.springframework.ai.vectorstore.VectorStore vectorStore;

    @Transactional
    public Procedure createProcedure(ProcedureRequest request) {
        Procedure procedure = new Procedure();
        updateProcedureFromRequest(procedure, request);
        procedure = procedureRepository.save(procedure);
        ingestProcedure(procedure);
        return procedure;
    }

    @Transactional
    public Procedure updateProcedure(Long id, ProcedureRequest request) {
        Procedure procedure = getProcedure(id);
        updateProcedureFromRequest(procedure, request);
        procedure = procedureRepository.save(procedure);
        ingestProcedure(procedure);
        return procedure;
    }

    @Transactional
    public void deleteProcedure(Long id) {
        procedureRepository.deleteById(id);
        // Clean up from vector store (Optional, requires ID tracking)
        // vectorStore.delete(List.of(id.toString()));
    }

    private void ingestProcedure(Procedure procedure) {
        try {
            System.out.println("Starting ingestion for procedure ID: " + procedure.getId());
            // Re-fetch to ensure we have full objects (avoid lazy loading / detached
            // issues)
            Store store = storeRepository.findById(procedure.getStore().getId()).orElse(null);
            JobArea jobArea = jobAreaRepository.findById(procedure.getJobArea().getId()).orElse(null);

            if (store == null || jobArea == null) {
                System.err.println("Skipping ingestion: Store or JobArea not found for procedure " + procedure.getId());
                return;
            }

            // 1. Convert Procedure to Text
            StringBuilder content = new StringBuilder();
            content.append("Procedure: ").append(procedure.getName()).append("\n");
            content.append("Job Area: ").append(jobArea.getName()).append("\n");
            content.append("Store ID: ").append(store.getId()).append("\n");
            content.append("Steps:\n");

            for (ProcedureTask task : procedure.getTasks()) {
                content.append(task.getOrderIndex()).append(". ").append(task.getDescription()).append("\n");
            }

            System.out.println("Constructed content for embedding (length " + content.length() + "): "
                    + content.toString().substring(0, Math.min(content.length(), 50)) + "...");

            // 2. Create Document with Metadata
            org.springframework.ai.document.Document doc = new org.springframework.ai.document.Document(
                    content.toString(),
                    java.util.Map.of(
                            "procedureId", String.valueOf(procedure.getId()),
                            "storeId", String.valueOf(store.getId()),
                            "jobAreaId", String.valueOf(jobArea.getId())));

            // 3. Save to Vector Store
            vectorStore.add(List.of(doc));
            System.out.println("Procedure ingestion completed successfully for ID: " + procedure.getId());

        } catch (Exception e) {
            System.err.println("Failed to ingest procedure: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void updateProcedureFromRequest(Procedure procedure, ProcedureRequest request) {
        procedure.setName(request.name());
        procedure.setType(request.type());
        procedure.setCutoffTime(request.cutoffTime());
        procedure.setStore(
                storeRepository.findById(request.storeId()).orElseThrow(() -> new RuntimeException("Store not found")));
        procedure.setJobArea(jobAreaRepository.findById(request.jobAreaId())
                .orElseThrow(() -> new RuntimeException("JobArea not found")));

        procedure.getTasks().clear();

        if (request.tasks() != null) {
            for (ProcedureTaskDTO taskDTO : request.tasks()) {
                ProcedureTask task = new ProcedureTask();
                task.setDescription(taskDTO.description());
                task.setTaskType(taskDTO.taskType());
                task.setRequired(taskDTO.isRequired());
                task.setOrderIndex(taskDTO.orderIndex());
                task.setProcedure(procedure);
                procedure.getTasks().add(task);
            }
        }
    }

    @Transactional
    public ProcedureExecution startExecution(Long procedureId, Long userId) {
        Procedure procedure = getProcedure(procedureId);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Check if existing execution for today exists
        List<ProcedureExecution> existing = executionRepository.findByProcedureIdAndDate(procedureId, LocalDate.now());
        if (!existing.isEmpty()) {
            return existing.get(0); // Return existing execution to resume
        }

        ProcedureExecution execution = new ProcedureExecution();
        execution.setProcedure(procedure);
        execution.setUser(user);
        execution.setDate(LocalDate.now());
        execution.setStartedAt(LocalDateTime.now());
        execution.setStatus(ProcedureExecution.Status.IN_PROGRESS);

        execution = executionRepository.save(execution);

        // Populate initial task executions
        for (ProcedureTask task : procedure.getTasks()) {
            TaskExecution taskExecution = new TaskExecution();
            taskExecution.setExecution(execution);
            taskExecution.setTask(task);
            taskExecution.setCompleted(false);
            taskExecutionRepository.save(taskExecution);
        }

        // Refresh to get the list
        return executionRepository.findById(execution.getId()).orElse(execution);
    }

    @Transactional
    public TaskExecution updateTaskExecution(Long executionId, Long taskId, TaskExecutionRequest request) {
        ProcedureExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));
        ProcedureTask task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));

        TaskExecution taskExecution = taskExecutionRepository.findByExecutionId(executionId).stream()
                .filter(te -> te.getTask().getId().equals(taskId))
                .findFirst()
                .orElse(new TaskExecution());

        if (taskExecution.getId() == null) {
            taskExecution.setExecution(execution);
            taskExecution.setTask(task);
            // Don't save yet, will be saved below
        }

        taskExecution.setCompleted(request.isCompleted());
        taskExecution.setPhotoUrl(request.photoUrl());
        taskExecution.setComment(request.comment());

        return taskExecutionRepository.save(taskExecution);
    }

    @Transactional
    public ProcedureExecution completeExecution(Long executionId) {
        ProcedureExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));
        execution.setStatus(ProcedureExecution.Status.COMPLETED);
        execution.setCompletedAt(LocalDateTime.now());
        return executionRepository.save(execution);
    }

    public ProcedureExecution getExecution(Long id) {
        return executionRepository.findById(id).orElseThrow(() -> new RuntimeException("Execution not found"));
    }
}
