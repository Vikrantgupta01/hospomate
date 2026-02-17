package com.hospomate.controller;

import com.hospomate.dto.ProcedureRequest;
import com.hospomate.model.Procedure;
import com.hospomate.service.ProcedureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/procedures")
public class ProcedureController {

    @Autowired
    private ProcedureService procedureService;

    @GetMapping("/store/{storeId}")
    public List<Procedure> getByStore(@PathVariable Long storeId) {
        return procedureService.getProceduresByStore(storeId);
    }

    @GetMapping("/{id}")
    public Procedure getById(@PathVariable Long id) {
        return procedureService.getProcedure(id);
    }

    @PostMapping
    public Procedure create(@RequestBody ProcedureRequest request) {
        return procedureService.createProcedure(request);
    }

    @PutMapping("/{id}")
    public Procedure update(@PathVariable Long id, @RequestBody ProcedureRequest request) {
        return procedureService.updateProcedure(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        procedureService.deleteProcedure(id);
        return ResponseEntity.noContent().build();
    }
}
