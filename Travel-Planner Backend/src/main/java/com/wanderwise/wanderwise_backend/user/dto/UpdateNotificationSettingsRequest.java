package com.wanderwise.wanderwise_backend.user.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationSettingsRequest(
        @NotNull(message = "Email notification preference is required")
        Boolean emailNotificationsEnabled,

        @NotNull(message = "SMS notification preference is required")
        Boolean smsNotificationsEnabled
) {
}
