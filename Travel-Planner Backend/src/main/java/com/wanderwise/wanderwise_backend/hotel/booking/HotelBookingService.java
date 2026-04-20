package com.wanderwise.wanderwise_backend.hotel.booking;

import com.wanderwise.wanderwise_backend.hotel.Hotel;
import com.wanderwise.wanderwise_backend.hotel.HotelRepository;
import com.wanderwise.wanderwise_backend.hotel.booking.dto.CreateHotelBookingRequest;
import com.wanderwise.wanderwise_backend.hotel.booking.dto.HotelBookingResponse;
import com.wanderwise.wanderwise_backend.hotel.booking.dto.UpdateHotelBookingStatusRequest;
import com.wanderwise.wanderwise_backend.notification.TravelerNotificationService;
import com.wanderwise.wanderwise_backend.notification.TravelerNotificationType;
import com.wanderwise.wanderwise_backend.user.Role;
import com.wanderwise.wanderwise_backend.user.User;
import com.wanderwise.wanderwise_backend.user.UserRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class HotelBookingService {

    private final HotelBookingRequestRepository hotelBookingRequestRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final TravelerNotificationService travelerNotificationService;

    @Transactional
    public HotelBookingResponse createBooking(String userEmail, CreateHotelBookingRequest request) {
        if (!request.checkOutDate().isAfter(request.checkInDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out date must be after check-in date");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Hotel hotel = hotelRepository.findById(request.hotelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found"));

        int nights = (int) ChronoUnit.DAYS.between(request.checkInDate(), request.checkOutDate());
        BigDecimal nightsValue = BigDecimal.valueOf(nights);
        BigDecimal roomsValue = BigDecimal.valueOf(request.roomCount());
        BigDecimal totalAmount = hotel.getPricePerNight()
                .multiply(nightsValue)
                .multiply(roomsValue);

        HotelBookingRequest booking = HotelBookingRequest.builder()
                .bookingCode(generateBookingCode())
                .userEmail(userEmail)
                .travelerName(user.getName())
                .travelerEmail(user.getEmail())
                .hotelId(hotel.getId())
                .hotelName(hotel.getName())
                .destination(hotel.getDestination())
                .country(hotel.getCountry())
                .checkInDate(request.checkInDate())
                .checkOutDate(request.checkOutDate())
                .nights(nights)
                .guestsCount(request.guestsCount())
                .roomCount(request.roomCount())
                .amountPerNight(hotel.getPricePerNight())
                .totalAmount(totalAmount)
                .currency(hotel.getCurrency())
                .status(HotelBookingStatus.PENDING)
                .specialRequest(request.specialRequest())
                .build();

        HotelBookingRequest saved = hotelBookingRequestRepository.save(booking);
        travelerNotificationService.createNotification(
                saved.getUserEmail(),
                TravelerNotificationType.BOOKING,
                "Hotel Booking Submitted",
                "Your hotel booking request (" + saved.getBookingCode() + ") for "
                        + saved.getHotelName() + " has been submitted."
        );
        notifyAdmins(
                "New Hotel Booking Request",
                "Booking " + saved.getBookingCode() + " from " + saved.getTravelerName()
                        + " (" + saved.getTravelerEmail() + ") for " + saved.getHotelName()
                        + ", " + saved.getDestination() + " is awaiting review."
        );

        return HotelBookingResponse.fromEntity(saved);
    }

    public List<HotelBookingResponse> getUserBookings(String userEmail) {
        return hotelBookingRequestRepository.findAllByUserEmailOrderByRequestedAtDesc(userEmail)
                .stream()
                .map(HotelBookingResponse::fromEntity)
                .toList();
    }

    public List<HotelBookingResponse> getAdminBookings() {
        return hotelBookingRequestRepository.findAllByOrderByRequestedAtDesc()
                .stream()
                .map(HotelBookingResponse::fromEntity)
                .toList();
    }

    @Transactional
    public HotelBookingResponse updateBookingStatus(Long hotelBookingRecordId, UpdateHotelBookingStatusRequest request) {
        HotelBookingRequest booking = hotelBookingRequestRepository.findById(hotelBookingRecordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel booking not found"));

        HotelBookingStatus previousStatus = booking.getStatus();
        booking.setStatus(request.status());
        booking.setAdminNote(request.adminNote());
        HotelBookingRequest saved = hotelBookingRequestRepository.save(booking);

        if (previousStatus != request.status()) {
            travelerNotificationService.createNotification(
                    saved.getUserEmail(),
                    TravelerNotificationType.BOOKING,
                    getStatusTitle(saved.getStatus()),
                    getStatusMessage(saved)
            );
        }

        return HotelBookingResponse.fromEntity(saved);
    }

    @Transactional
    public HotelBookingResponse cancelMyBooking(Long hotelBookingRecordId, String userEmail) {
        HotelBookingRequest booking = hotelBookingRequestRepository.findByIdAndUserEmail(hotelBookingRecordId, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel booking not found"));

        booking.setStatus(HotelBookingStatus.CANCELLED);
        booking.setAdminNote("Cancelled by traveler");
        HotelBookingRequest saved = hotelBookingRequestRepository.save(booking);
        travelerNotificationService.createNotification(
                saved.getUserEmail(),
                TravelerNotificationType.BOOKING,
                "Hotel Booking Cancelled",
                "Your hotel booking " + saved.getBookingCode() + " was cancelled."
        );
        notifyAdmins(
                "Hotel Booking Cancelled by Traveler",
                saved.getTravelerName() + " cancelled booking " + saved.getBookingCode()
                        + " for " + saved.getHotelName() + "."
        );

        return HotelBookingResponse.fromEntity(saved);
    }

    private String generateBookingCode() {
        String code;
        do {
            int randomPart = ThreadLocalRandom.current().nextInt(100000, 999999);
            code = "HB-" + randomPart;
        } while (hotelBookingRequestRepository.existsByBookingCode(code));
        return code;
    }

    private String getStatusTitle(HotelBookingStatus status) {
        if (status == HotelBookingStatus.CONFIRMED) {
            return "Hotel Booking Confirmed";
        }

        if (status == HotelBookingStatus.REJECTED) {
            return "Hotel Booking Rejected";
        }

        if (status == HotelBookingStatus.CANCELLED) {
            return "Hotel Booking Cancelled";
        }

        return "Hotel Booking Updated";
    }

    private String getStatusMessage(HotelBookingRequest booking) {
        if (booking.getStatus() == HotelBookingStatus.CONFIRMED) {
            return "Your booking " + booking.getBookingCode() + " at " + booking.getHotelName()
                    + " is confirmed.";
        }

        if (booking.getStatus() == HotelBookingStatus.REJECTED) {
            String note = booking.getAdminNote() == null || booking.getAdminNote().isBlank()
                    ? ""
                    : " Note: " + booking.getAdminNote().trim();
            return "Your booking " + booking.getBookingCode() + " at " + booking.getHotelName()
                    + " was rejected." + note;
        }

        if (booking.getStatus() == HotelBookingStatus.CANCELLED) {
            return "Your booking " + booking.getBookingCode() + " at " + booking.getHotelName()
                    + " was cancelled.";
        }

        return "Hotel booking " + booking.getBookingCode() + " is now in "
                + booking.getStatus().name() + " status.";
    }

    private void notifyAdmins(String title, String message) {
        userRepository.findAllByRole(Role.ADMIN)
                .stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .distinct()
                .forEach(adminEmail -> travelerNotificationService.createNotification(
                        adminEmail,
                        TravelerNotificationType.BOOKING,
                        title,
                        message
                ));
    }
}
