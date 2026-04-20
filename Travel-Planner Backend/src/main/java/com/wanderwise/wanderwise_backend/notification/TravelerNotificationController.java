package com.wanderwise.wanderwise_backend.notification;

import com.wanderwise.wanderwise_backend.notification.dto.TravelerNotificationResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class TravelerNotificationController {

    private final TravelerNotificationService travelerNotificationService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<TravelerNotificationResponse>> getMyNotifications(
            Authentication authentication
    ) {
        return ResponseEntity.ok(travelerNotificationService.getMyNotifications(authentication.getName()));
    }

    @PatchMapping("/me/{notificationId}/read")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<TravelerNotificationResponse> markRead(
            @PathVariable Long notificationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                travelerNotificationService.markNotificationRead(authentication.getName(), notificationId)
        );
    }

    @PatchMapping("/me/read-all")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<TravelerNotificationResponse>> markAllRead(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                travelerNotificationService.markAllNotificationsRead(authentication.getName())
        );
    }

    @DeleteMapping("/me/{notificationId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId,
            Authentication authentication
    ) {
        travelerNotificationService.deleteNotification(authentication.getName(), notificationId);
        return ResponseEntity.noContent().build();
    }
}
