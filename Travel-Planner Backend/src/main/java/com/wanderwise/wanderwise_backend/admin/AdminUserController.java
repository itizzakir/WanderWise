package com.wanderwise.wanderwise_backend.admin;

import com.wanderwise.wanderwise_backend.admin.dto.AdminUserResponse;
import com.wanderwise.wanderwise_backend.admin.dto.UpdateUserRoleRequest;
import com.wanderwise.wanderwise_backend.admin.dto.UpdateUserStatusRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<AdminUserResponse> updateRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(adminUserService.updateRole(userId, request.role(), authentication.getName()));
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<AdminUserResponse> updateStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(adminUserService.updateStatus(userId, request.status(), authentication.getName()));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId, Authentication authentication) {
        adminUserService.deleteUser(userId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
