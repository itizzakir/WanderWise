package com.wanderwise.wanderwise_backend.hotel.booking;

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
        name = "hotel_booking_requests",
        indexes = {
                @Index(name = "idx_hotel_booking_user_requested_at", columnList = "user_email,requested_at"),
                @Index(name = "idx_hotel_booking_status", columnList = "status"),
                @Index(name = "idx_hotel_booking_hotel", columnList = "hotel_id")
        }
)
public class HotelBookingRequest {

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

    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @Column(nullable = false, length = 180)
    private String hotelName;

    @Column(nullable = false, length = 120)
    private String destination;

    @Column(nullable = false, length = 120)
    private String country;

    @Column(nullable = false)
    private LocalDate checkInDate;

    @Column(nullable = false)
    private LocalDate checkOutDate;

    @Column(nullable = false)
    private Integer nights;

    @Column(nullable = false)
    private Integer guestsCount;

    @Column(nullable = false)
    private Integer roomCount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPerNight;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HotelBookingStatus status;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    @Column(length = 1000)
    private String specialRequest;

    @Column(length = 1000)
    private String adminNote;

    @PrePersist
    public void applyDefaults() {
        if (status == null) {
            status = HotelBookingStatus.PENDING;
        }

        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }

        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }
    }
}
