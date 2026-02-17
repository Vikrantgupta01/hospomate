package com.hospomate.dto;

import com.hospomate.model.Procedure;
import java.time.LocalTime;
import java.util.List;

public record ProcedureRequest(
        Long storeId,
        Long jobAreaId,
        String name,
        Procedure.ProcedureType type,
        LocalTime cutoffTime,
        List<ProcedureTaskDTO> tasks) {
}
