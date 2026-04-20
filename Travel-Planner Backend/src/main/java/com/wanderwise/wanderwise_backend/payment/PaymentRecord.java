package com.wanderwise.wanderwise_backend.payment;

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
        name = "payments",
        indexes = {
                @Index(name = "idx_payment_user_paid_at", columnList = "user_email,paid_at"),
                @Index(name = "idx_payment_status", columnList = "status")
        }
)
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 24)
    private String paymentCode;

    @Column(nullable = false)
    private Long bookingRecordId;

    @Column(nullable = false, length = 24)
    private String bookingCode;

    @Column(nullable = false, length = 150)
    private String userEmail;

    @Column(nullable = false, length = 120)
    private String travelerName;

    @Column(nullable = false, length = 150)
    private String travelerEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMethod method;

    @Column(length = 120)
    private String cardHolderName;

    @Column(length = 4)
    private String cardLast4;

    @Column(length = 120)
    private String upiId;

    @Column(length = 120)
    private String bankReference;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status;

    @Column(nullable = false)
    private LocalDateTime paidAt;

    @PrePersist
    public void applyDefaults() {
        if (status == null) {
            status = PaymentStatus.SUCCESS;
        }

        if (paidAt == null) {
            paidAt = LocalDateTime.now();
        }

        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }
    }
}
