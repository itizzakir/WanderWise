package com.wanderwise.wanderwise_backend.auth.dto;

import com.wanderwise.wanderwise_backend.user.Role;
import com.wanderwise.wanderwise_backend.user.User;

public record AuthResponse(
        String token,
        String tokenType,
        UserPayload user
) {
    public static AuthResponse fromUser(String token, User user) {
        Role role = user.getRole() != null ? user.getRole() : Role.USER;
        return new AuthResponse(
                token,
                "Bearer",
                new UserPayload(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getMobileNumber(),
                        role,
                        "https://i.pravatar.cc/150?u=" + user.getEmail()
                )
        );
    }

    public record UserPayload(
            Long id,
            String name,
            String email,
            String mobileNumber,
            Role role,
            String avatar
    ) {
    }
}
