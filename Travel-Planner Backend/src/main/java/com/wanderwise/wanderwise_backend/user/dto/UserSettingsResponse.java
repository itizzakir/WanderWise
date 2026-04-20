package com.wanderwise.wanderwise_backend.user.dto;

import com.wanderwise.wanderwise_backend.user.Role;
import com.wanderwise.wanderwise_backend.user.User;

public record UserSettingsResponse(
        Long id,
        String name,
        String email,
        String mobileNumber,
        Role role,
        String avatar,
        String preferredLanguage,
        String preferredCurrency,
        String timeFormat,
        String timeZone,
        Boolean emailNotificationsEnabled,
        Boolean smsNotificationsEnabled
) {
    public static UserSettingsResponse fromUser(User user) {
        Role role = user.getRole() != null ? user.getRole() : Role.USER;
        String email = user.getEmail() != null ? user.getEmail() : "";
        return new UserSettingsResponse(
                user.getId(),
                user.getName(),
                email,
                user.getMobileNumber(),
                role,
                "https://i.pravatar.cc/150?u=" + email,
                user.getPreferredLanguage(),
                user.getPreferredCurrency(),
                user.getTimeFormat(),
                user.getTimeZone(),
                user.getEmailNotificationsEnabled(),
                user.getSmsNotificationsEnabled()
        );
    }
}
