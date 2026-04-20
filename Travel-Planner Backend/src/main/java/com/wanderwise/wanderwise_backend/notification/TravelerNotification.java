package com.wanderwise.wanderwise_backend.notification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "traveler_notifications",
        indexes = {
                @Index(name = "idx_notification_user_created_at", columnList = "user_email,created_at"),
                @Index(name = "idx_notification_user_read", columnList = "user_email,is_read")
        }
)
public class TravelerNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TravelerNotificationType type;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean read;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void applyDefaults() {
        if (read == null) {
            read = false;
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
