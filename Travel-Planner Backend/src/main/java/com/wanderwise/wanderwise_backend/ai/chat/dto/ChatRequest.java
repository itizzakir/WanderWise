package com.wanderwise.wanderwise_backend.ai.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @Size(max = 80, message = "Conversation id can be up to 80 characters")
        String conversationId,

        @NotBlank(message = "Message is required")
        @Size(max = 2000, message = "Message can be up to 2000 characters")
        String message
) {
}
