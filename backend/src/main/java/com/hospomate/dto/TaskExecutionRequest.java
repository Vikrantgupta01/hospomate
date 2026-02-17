package com.hospomate.dto;

public record TaskExecutionRequest(
        boolean isCompleted,
        String photoUrl,
        String comment) {
}
