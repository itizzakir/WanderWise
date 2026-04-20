package com.wanderwise.wanderwise_backend.booking;

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
import java.math.BigDecimal;
import java.time.LocalDate;
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
        name = "booking_requests",
        indexes = {
                @Index(name = "idx_booking_user_requested_at", columnList = "user_email,requested_at"),
                @Index(name = "idx_booking_status", columnList = "status"),
                @Index(name = "idx_booking_destination_country", columnList = "destination,country")
        }
)
public class BookingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 24)
    private String bookingCode;

    @Column(nullable = false, length = 150)
    private String userEmail;

    @Column(nullable = false, length = 120)
    private String travelerName;

    @Column(nullable = false, length = 150)
    private String travelerEmail;

    @Column(nullable = false, length = 120)
    private String destination;

    @Column(nullable = false, length = 120)
    private String country;

    @Column(nullable = false)
    private LocalDate travelDate;

    @Column(nullable = false, length = 30)
    private String transportation;

    @Column(nullable = false)
    private Integer travelersCount;

    @Column(nullable = false, length = 4000)
    private String travelersJson;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPerTraveler;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BookingStatus status;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    @Column(length = 1000)
    private String adminNote;

    @PrePersist
    public void applyDefaults() {
        if (status == null) {
            status = BookingStatus.PENDING_PAYMENT;
        }

        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }

        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }
    }
}
