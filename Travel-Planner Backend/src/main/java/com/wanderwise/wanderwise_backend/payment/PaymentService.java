package com.wanderwise.wanderwise_backend.payment;

import com.wanderwise.wanderwise_backend.booking.BookingRequest;
import com.wanderwise.wanderwise_backend.booking.BookingService;
import com.wanderwise.wanderwise_backend.booking.BookingStatus;
import com.wanderwise.wanderwise_backend.notification.TravelerNotificationService;
import com.wanderwise.wanderwise_backend.notification.TravelerNotificationType;
import com.wanderwise.wanderwise_backend.payment.dto.CreatePaymentRequest;
import com.wanderwise.wanderwise_backend.payment.dto.PaymentResponse;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRecordRepository paymentRecordRepository;
    private final BookingService bookingService;
    private final TravelerNotificationService travelerNotificationService;

    @Transactional
    public PaymentResponse createPayment(String userEmail, CreatePaymentRequest request) {
        BookingRequest booking = bookingService.getBookingById(request.bookingRecordId());

        if (!booking.getUserEmail().equalsIgnoreCase(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only pay for your own booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This booking is not awaiting payment");
        }

        validatePaymentDetails(request);

        PaymentRecord payment = PaymentRecord.builder()
                .paymentCode(generatePaymentCode())
                .bookingRecordId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userEmail(userEmail)
                .travelerName(booking.getTravelerName())
                .travelerEmail(booking.getTravelerEmail())
                .method(request.method())
                .cardHolderName(normalizeOrNull(request.cardHolderName()))
                .cardLast4(extractCardLast4(request.cardNumber()))
                .upiId(normalizeOrNull(request.upiId()))
                .bankReference(normalizeOrNull(request.bankReference()))
                .amount(booking.getTotalAmount())
                .currency(booking.getCurrency())
                .status(PaymentStatus.SUCCESS)
                .build();

        PaymentRecord savedPayment = paymentRecordRepository.save(payment);

        booking.setStatus(BookingStatus.PENDING);
        bookingService.saveBooking(booking);

        travelerNotificationService.createNotification(
                userEmail,
                TravelerNotificationType.PAYMENT,
                "Payment Successful",
                "Payment " + savedPayment.getPaymentCode() + " for booking "
                        + savedPayment.getBookingCode() + " was successful."
        );

        travelerNotificationService.createNotification(
                userEmail,
                TravelerNotificationType.BOOKING,
                "Booking Submitted for Approval",
                "Your booking " + savedPayment.getBookingCode()
                        + " is now pending admin approval."
        );

        return PaymentResponse.fromEntity(savedPayment);
    }

    public List<PaymentResponse> getAdminPayments() {
        return paymentRecordRepository.findAllByOrderByPaidAtDesc()
                .stream()
                .map(PaymentResponse::fromEntity)
                .toList();
    }

    public List<PaymentResponse> getUserPayments(String userEmail) {
        return paymentRecordRepository.findAllByUserEmailOrderByPaidAtDesc(userEmail)
                .stream()
                .map(PaymentResponse::fromEntity)
                .toList();
    }

    private void validatePaymentDetails(CreatePaymentRequest request) {
        if (request.method() == PaymentMethod.CARD) {
            if (isBlank(request.cardHolderName()) || isBlank(request.cardNumber())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Card holder name and card number are required");
            }

            String digitsOnly = request.cardNumber().replaceAll("\\D", "");
            if (digitsOnly.length() < 12 || digitsOnly.length() > 19) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Card number must be between 12 and 19 digits");
            }
        }

        if (request.method() == PaymentMethod.UPI) {
            if (isBlank(request.upiId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "UPI ID is required");
            }

            String upiId = request.upiId().trim();
            if (!upiId.contains("@") || upiId.startsWith("@") || upiId.endsWith("@")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please provide a valid UPI ID");
            }
        }
    }

    private String generatePaymentCode() {
        String code;
        do {
            int randomPart = ThreadLocalRandom.current().nextInt(100000, 999999);
            code = "PMT-" + randomPart;
        } while (paymentRecordRepository.existsByPaymentCode(code));
        return code;
    }

    private String extractCardLast4(String cardNumber) {
        if (isBlank(cardNumber)) {
            return null;
        }

        String digitsOnly = cardNumber.replaceAll("\\D", "");
        if (digitsOnly.length() < 4) {
            return null;
        }

        return digitsOnly.substring(digitsOnly.length() - 4);
    }

    private String normalizeOrNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
