package com.wanderwise.wanderwise_backend.auth.dto;

import com.wanderwise.wanderwise_backend.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name cannot exceed 100 characters")
        String name,
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email")
        String email,
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,
        @NotBlank(message = "Mobile number is required")
        @Pattern(
                regexp = "^[0-9+()\\-\\s]{7,20}$",
                message = "Please provide a valid mobile number"
        )
        String mobileNumber,
        Role role
) {
}
