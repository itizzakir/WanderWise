package com.wanderwise.wanderwise_backend.notification.dto;

import com.wanderwise.wanderwise_backend.notification.TravelerNotification;

public record TravelerNotificationResponse(
        Long notificationId,
        String id,
        String type,
        String title,
        String message,
        String createdAt,
        Boolean read
) {
    public static TravelerNotificationResponse fromEntity(TravelerNotification notification) {
        Long notificationId = notification.getId();
        return new TravelerNotificationResponse(
                notificationId,
                "NTF-" + notificationId,
                notification.getType().name(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getCreatedAt().toString(),
                notification.getRead()
        );
    }
}
