package com.wanderwise.wanderwise_backend.notification;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TravelerNotificationRepository extends JpaRepository<TravelerNotification, Long> {
    List<TravelerNotification> findAllByUserEmailOrderByCreatedAtDesc(String userEmail);

    Optional<TravelerNotification> findByIdAndUserEmail(Long id, String userEmail);
}
