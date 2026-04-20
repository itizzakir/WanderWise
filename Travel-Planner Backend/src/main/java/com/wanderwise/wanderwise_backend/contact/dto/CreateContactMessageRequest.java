package com.wanderwise.wanderwise_backend.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateContactMessageRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 120, message = "Full name can be up to 120 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email")
        @Size(max = 160, message = "Email can be up to 160 characters")
        String email,

        @NotBlank(message = "Subject is required")
        @Size(max = 120, message = "Subject can be up to 120 characters")
        String subject,

        @NotBlank(message = "Message is required")
        @Size(max = 2000, message = "Message can be up to 2000 characters")
        String message
) {
}
