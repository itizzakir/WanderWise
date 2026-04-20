package com.wanderwise.wanderwise_backend.user;

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
        name = "users",
        indexes = {
                @Index(name = "idx_user_status", columnList = "status")
        }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    private String mobileNumber;

    @Column(length = 50)
    private String preferredLanguage;

    @Column(length = 10)
    private String preferredCurrency;

    @Column(length = 20)
    private String timeFormat;

    @Column(length = 50)
    private String timeZone;

    @Column
    private Boolean emailNotificationsEnabled;

    @Column
    private Boolean smsNotificationsEnabled;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserStatus status;

    @Column
    private Integer tripsBooked;

    @Column
    private LocalDateTime lastLogin;

    @PrePersist
    public void applyDefaults() {
        if (role == null) {
            role = Role.USER;
        }

        if (status == null) {
            status = UserStatus.ACTIVE;
        }

        if (tripsBooked == null) {
            tripsBooked = 0;
        }

        if (preferredLanguage == null || preferredLanguage.isBlank()) {
            preferredLanguage = "English";
        }

        if (preferredCurrency == null || preferredCurrency.isBlank()) {
            preferredCurrency = "INR";
        }

        if (timeFormat == null || timeFormat.isBlank()) {
            timeFormat = "12_HOUR";
        }

        if (timeZone == null || timeZone.isBlank()) {
            timeZone = "Asia/Kolkata";
        }

        if (emailNotificationsEnabled == null) {
            emailNotificationsEnabled = true;
        }

        if (smsNotificationsEnabled == null) {
            smsNotificationsEnabled = true;
        }
    }
}
