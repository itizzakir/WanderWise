package com.wanderwise.wanderwise_backend.booking;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wanderwise.wanderwise_backend.booking.dto.BookingResponse;
import com.wanderwise.wanderwise_backend.booking.dto.CreateBookingRequest;
import com.wanderwise.wanderwise_backend.booking.dto.UpdateBookingStatusRequest;
import com.wanderwise.wanderwise_backend.notification.TravelerNotificationService;
import com.wanderwise.wanderwise_backend.notification.TravelerNotificationType;
import com.wanderwise.wanderwise_backend.user.User;
import com.wanderwise.wanderwise_backend.user.UserRepository;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final TypeReference<List<CreateBookingRequest.TravelerInput>> TRAVELERS_TYPE = new TypeReference<>() {
    };

    private final BookingRequestRepository bookingRequestRepository;
    private final UserRepository userRepository;
    private final TravelerNotificationService travelerNotificationService;

    @Transactional
    public BookingResponse createBooking(String userEmail, CreateBookingRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        int travelersCount = request.travelers().size();
        BigDecimal totalAmount = request.amountPerTraveler()
                .multiply(BigDecimal.valueOf(travelersCount));

        BookingRequest booking = BookingRequest.builder()
                .bookingCode(generateBookingCode())
                .userEmail(userEmail)
                .travelerName(user.getName())
                .travelerEmail(user.getEmail())
                .destination(request.destination().trim())
                .country(request.country().trim())
                .travelDate(request.travelDate())
                .transportation(request.transportation().trim())
                .travelersCount(travelersCount)
                .travelersJson(writeTravelersJson(request.travelers()))
                .amountPerTraveler(request.amountPerTraveler())
                .totalAmount(totalAmount)
                .currency(normalizeCurrency(request.currency()))
                .status(BookingStatus.PENDING_PAYMENT)
                .build();

        BookingRequest saved = bookingRequestRepository.save(booking);
        travelerNotificationService.createNotification(
                saved.getUserEmail(),
                TravelerNotificationType.BOOKING,
                "Booking Request Submitted",
                "Your " + saved.getDestination() + " booking request (" + saved.getBookingCode()
                        + ") was sent for admin approval."
        );
        return toBookingResponse(saved);
    }

    public List<BookingResponse> getAdminBookings() {
        return bookingRequestRepository.findAllByOrderByRequestedAtDesc()
                .stream()
                .map(this::toBookingResponse)
                .toList();
    }

    public List<BookingResponse> getUserBookings(String userEmail) {
        return bookingRequestRepository.findAllByUserEmailOrderByRequestedAtDesc(userEmail)
                .stream()
                .map(this::toBookingResponse)
                .toList();
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingRecordId, UpdateBookingStatusRequest request) {
        BookingRequest booking = bookingRequestRepository.findById(bookingRecordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        BookingStatus previousStatus = booking.getStatus();

        if (request.status() == BookingStatus.PENDING_PAYMENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot set admin booking status to PENDING_PAYMENT");
        }

        booking.setStatus(request.status());
        booking.setAdminNote(request.adminNote());
        BookingRequest saved = bookingRequestRepository.save(booking);

        if (previousStatus != request.status()) {
            travelerNotificationService.createNotification(
                    saved.getUserEmail(),
                    TravelerNotificationType.BOOKING,
                    getStatusTitle(saved.getStatus()),
                    getStatusMessage(saved)
            );
        }

        return toBookingResponse(saved);
    }

    @Transactional
    public void deleteBooking(Long bookingRecordId) {
        BookingRequest booking = bookingRequestRepository.findById(bookingRecordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        bookingRequestRepository.delete(booking);
    }

    public BookingRequest getBookingById(Long bookingRecordId) {
        return bookingRequestRepository.findById(bookingRecordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    @Transactional
    public BookingRequest saveBooking(BookingRequest bookingRequest) {
        return bookingRequestRepository.save(bookingRequest);
    }

    private String generateBookingCode() {
        String code;
        do {
            int randomPart = ThreadLocalRandom.current().nextInt(100000, 999999);
            code = "BK-" + randomPart;
        } while (bookingRequestRepository.existsByBookingCode(code));
        return code;
    }

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return "INR";
        }
        return currency.trim().toUpperCase();
    }

    private String writeTravelersJson(List<CreateBookingRequest.TravelerInput> travelers) {
        try {
            return OBJECT_MAPPER.writeValueAsString(travelers);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to process traveler details");
        }
    }

    private List<BookingResponse.TravelerPayload> readTravelers(String travelersJson) {
        try {
            List<CreateBookingRequest.TravelerInput> travelers = OBJECT_MAPPER.readValue(travelersJson, TRAVELERS_TYPE);
            return travelers.stream()
                    .map(entry -> new BookingResponse.TravelerPayload(entry.name(), entry.age(), entry.gender()))
                    .toList();
        } catch (IOException ex) {
            return List.of();
        }
    }

    private BookingResponse toBookingResponse(BookingRequest booking) {
        return BookingResponse.fromEntity(booking, readTravelers(booking.getTravelersJson()));
    }

    private String getStatusTitle(BookingStatus status) {
        if (status == BookingStatus.APPROVED) {
            return "Booking Approved";
        }

        if (status == BookingStatus.REJECTED) {
            return "Booking Rejected";
        }

        return "Booking Status Updated";
    }

    private String getStatusMessage(BookingRequest booking) {
        if (booking.getStatus() == BookingStatus.APPROVED) {
            return "Your booking " + booking.getBookingCode() + " for " + booking.getDestination()
                    + " has been approved by admin.";
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            String note = booking.getAdminNote() == null || booking.getAdminNote().isBlank()
                    ? ""
                    : " Note: " + booking.getAdminNote().trim();
            return "Your booking " + booking.getBookingCode() + " for " + booking.getDestination()
                    + " was rejected." + note;
        }

        return "Booking " + booking.getBookingCode() + " for " + booking.getDestination()
                + " is now in " + booking.getStatus().name() + " status.";
    }
}
