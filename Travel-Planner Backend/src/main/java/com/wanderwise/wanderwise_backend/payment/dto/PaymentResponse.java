package com.wanderwise.wanderwise_backend.payment.dto;

import com.wanderwise.wanderwise_backend.payment.PaymentRecord;
import java.math.BigDecimal;

public record PaymentResponse(
        Long paymentRecordId,
        String id,
        Long bookingRecordId,
        String bookingId,
        String travelerName,
        String travelerEmail,
        String method,
        BigDecimal amount,
        String currency,
        String status,
        String paidAt,
        String upiId,
        String cardLast4
) {
    public static PaymentResponse fromEntity(PaymentRecord payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getPaymentCode(),
                payment.getBookingRecordId(),
                payment.getBookingCode(),
                payment.getTravelerName(),
                payment.getTravelerEmail(),
                payment.getMethod().name(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus().name(),
                payment.getPaidAt().toString(),
                payment.getUpiId(),
                payment.getCardLast4()
        );
    }
}
