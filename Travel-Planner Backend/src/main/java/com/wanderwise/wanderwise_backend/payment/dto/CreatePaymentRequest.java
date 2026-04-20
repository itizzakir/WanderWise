package com.wanderwise.wanderwise_backend.payment.dto;

import com.wanderwise.wanderwise_backend.payment.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record CreatePaymentRequest(
        @NotNull(message = "Booking record ID is required")
        Long bookingRecordId,
        @NotNull(message = "Payment method is required")
        PaymentMethod method,
        String cardHolderName,
        String cardNumber,
        String upiId,
        String bankReference
) {
}
