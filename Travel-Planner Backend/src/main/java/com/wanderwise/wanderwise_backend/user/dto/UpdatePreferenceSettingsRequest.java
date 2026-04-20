package com.wanderwise.wanderwise_backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePreferenceSettingsRequest(
        @NotBlank(message = "Language is required")
        @Size(max = 50, message = "Language can be up to 50 characters")
        String preferredLanguage,

        @NotBlank(message = "Currency is required")
        @Size(max = 10, message = "Currency can be up to 10 characters")
        String preferredCurrency,

        @NotBlank(message = "Time format is required")
        @Size(max = 20, message = "Time format can be up to 20 characters")
        String timeFormat,

        @NotBlank(message = "Time zone is required")
        @Size(max = 50, message = "Time zone can be up to 50 characters")
        String timeZone
) {
}
