package com.wanderwise.wanderwise_backend.admin.dto;

import com.wanderwise.wanderwise_backend.user.Role;
import com.wanderwise.wanderwise_backend.user.UserStatus;

public record AdminUserResponse(
        Long id,
        String name,
        String email,
        String mobileNumber,
        Role role,
        UserStatus status,
        Integer tripsBooked,
        String lastLogin,
        String avatar
) {
}
