package com.wanderwise.wanderwise_backend.admin.dto;

import com.wanderwise.wanderwise_backend.user.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
        @NotNull(message = "Role is required")
        Role role
) {
}
