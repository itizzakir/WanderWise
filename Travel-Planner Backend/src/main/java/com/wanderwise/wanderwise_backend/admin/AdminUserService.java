package com.wanderwise.wanderwise_backend.admin;

import com.wanderwise.wanderwise_backend.admin.dto.AdminUserResponse;
import com.wanderwise.wanderwise_backend.user.Role;
import com.wanderwise.wanderwise_backend.user.User;
import com.wanderwise.wanderwise_backend.user.UserRepository;
import com.wanderwise.wanderwise_backend.user.UserStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAllByOrderByIdAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminUserResponse updateRole(Long userId, Role role, String adminEmail) {
        User user = getUserOrThrow(userId);
        if (user.getEmail() != null
                && user.getEmail().equalsIgnoreCase(adminEmail)
                && user.getRole() != role) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot change your own role");
        }
        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateStatus(Long userId, UserStatus status, String adminEmail) {
        User user = getUserOrThrow(userId);
        if (user.getEmail() != null
                && user.getEmail().equalsIgnoreCase(adminEmail)
                && user.getStatus() != status) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot change your own status");
        }
        user.setStatus(status);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId, String adminEmail) {
        User user = getUserOrThrow(userId);
        if (user.getEmail() != null && user.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot remove your own account");
        }
        userRepository.delete(user);
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private AdminUserResponse toResponse(User user) {
        Role role = user.getRole() != null ? user.getRole() : Role.USER;
        UserStatus status = user.getStatus() != null ? user.getStatus() : UserStatus.ACTIVE;
        int tripsBooked = user.getTripsBooked() != null ? user.getTripsBooked() : 0;
        LocalDateTime lastLogin = user.getLastLogin();
        String email = user.getEmail() != null ? user.getEmail() : "";

        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                email,
                user.getMobileNumber(),
                role,
                status,
                tripsBooked,
                lastLogin != null ? lastLogin.toString() : "Never",
                "https://i.pravatar.cc/150?u=" + email
        );
    }
}
