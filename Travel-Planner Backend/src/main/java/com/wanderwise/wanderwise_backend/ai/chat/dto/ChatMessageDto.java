package com.wanderwise.wanderwise_backend.ai.chat.dto;

public record ChatMessageDto(
        String role,
        String content,
        String timestamp
) {
}
