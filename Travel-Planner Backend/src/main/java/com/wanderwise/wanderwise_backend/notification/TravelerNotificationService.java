package com.wanderwise.wanderwise_backend.notification;

import com.wanderwise.wanderwise_backend.notification.dto.TravelerNotificationResponse;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TravelerNotificationService {

    private final TravelerNotificationRepository travelerNotificationRepository;

    @Transactional
    public void createNotification(String userEmail, TravelerNotificationType type, String title, String message) {
        if (isBlank(userEmail) || type == null || isBlank(title) || isBlank(message)) {
            return;
        }

        TravelerNotification notification = TravelerNotification.builder()
                .userEmail(userEmail.trim().toLowerCase())
                .type(type)
                .title(title.trim())
                .message(message.trim())
                .read(false)
                .build();

        travelerNotificationRepository.save(notification);
    }

    @Transactional
    public List<TravelerNotificationResponse> getMyNotifications(String userEmail) {
        return travelerNotificationRepository.findAllByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(TravelerNotificationResponse::fromEntity)
                .toList();
    }

    @Transactional
    public TravelerNotificationResponse markNotificationRead(String userEmail, Long notificationId) {
        TravelerNotification notification = getMyNotification(userEmail, notificationId);
        notification.setRead(true);
        TravelerNotification saved = travelerNotificationRepository.save(notification);
        return TravelerNotificationResponse.fromEntity(saved);
    }

    @Transactional
    public List<TravelerNotificationResponse> markAllNotificationsRead(String userEmail) {
        List<TravelerNotification> notifications =
                travelerNotificationRepository.findAllByUserEmailOrderByCreatedAtDesc(userEmail);

        boolean hasChanges = false;
        for (TravelerNotification entry : notifications) {
            if (!Boolean.TRUE.equals(entry.getRead())) {
                entry.setRead(true);
                hasChanges = true;
            }
        }

        List<TravelerNotification> updated = hasChanges
                ? travelerNotificationRepository.saveAll(notifications)
                : notifications;

        return updated.stream()
                .map(TravelerNotificationResponse::fromEntity)
                .toList();
    }

    @Transactional
    public void deleteNotification(String userEmail, Long notificationId) {
        TravelerNotification notification = getMyNotification(userEmail, notificationId);
        travelerNotificationRepository.delete(notification);
    }

    private TravelerNotification getMyNotification(String userEmail, Long notificationId) {
        return travelerNotificationRepository.findByIdAndUserEmail(notificationId, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
