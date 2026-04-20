package com.wanderwise.wanderwise_backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email")
        String email,
        @NotBlank(message = "Password is required")
        String password
) {
}
