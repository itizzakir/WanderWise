package com.wanderwise.wanderwise_backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileSettingsRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name can be up to 100 characters")
        String name,

        @NotBlank(message = "Mobile number is required")
        @Size(max = 20, message = "Mobile number can be up to 20 characters")
        String mobileNumber
) {
}
