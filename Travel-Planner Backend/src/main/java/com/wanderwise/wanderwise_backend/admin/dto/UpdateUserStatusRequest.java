package com.wanderwise.wanderwise_backend.admin.dto;

import com.wanderwise.wanderwise_backend.user.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull(message = "Status is required")
        UserStatus status
) {
}
