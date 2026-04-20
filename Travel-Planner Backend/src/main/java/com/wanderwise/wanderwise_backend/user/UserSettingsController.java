package com.wanderwise.wanderwise_backend.user;

import com.wanderwise.wanderwise_backend.user.dto.UpdateNotificationSettingsRequest;
import com.wanderwise.wanderwise_backend.user.dto.UpdatePreferenceSettingsRequest;
import com.wanderwise.wanderwise_backend.user.dto.UpdateProfileSettingsRequest;
import com.wanderwise.wanderwise_backend.user.dto.UserSettingsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/settings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class UserSettingsController {

    private final UserSettingsService userSettingsService;

    @GetMapping
    public ResponseEntity<UserSettingsResponse> getSettings(Authentication authentication) {
        return ResponseEntity.ok(userSettingsService.getCurrentUserSettings(authentication.getName()));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserSettingsResponse> updateProfile(
            @Valid @RequestBody UpdateProfileSettingsRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(userSettingsService.updateProfile(authentication.getName(), request));
    }

    @PatchMapping("/preferences")
    public ResponseEntity<UserSettingsResponse> updatePreferences(
            @Valid @RequestBody UpdatePreferenceSettingsRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(userSettingsService.updatePreferences(authentication.getName(), request));
    }

    @PatchMapping("/notifications")
    public ResponseEntity<UserSettingsResponse> updateNotificationSettings(
            @Valid @RequestBody UpdateNotificationSettingsRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                userSettingsService.updateNotificationSettings(authentication.getName(), request)
        );
    }
}
