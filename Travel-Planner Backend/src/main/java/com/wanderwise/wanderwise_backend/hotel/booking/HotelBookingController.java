package com.wanderwise.wanderwise_backend.hotel.booking;

import com.wanderwise.wanderwise_backend.hotel.booking.dto.CreateHotelBookingRequest;
import com.wanderwise.wanderwise_backend.hotel.booking.dto.HotelBookingResponse;
import com.wanderwise.wanderwise_backend.hotel.booking.dto.UpdateHotelBookingStatusRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hotel-bookings")
@RequiredArgsConstructor
public class HotelBookingController {

    private final HotelBookingService hotelBookingService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<HotelBookingResponse> createBooking(
            @Valid @RequestBody CreateHotelBookingRequest request,
            Authentication authentication
    ) {
        HotelBookingResponse response = hotelBookingService.createBooking(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<HotelBookingResponse>> getMyHotelBookings(Authentication authentication) {
        return ResponseEntity.ok(hotelBookingService.getUserBookings(authentication.getName()));
    }

    @DeleteMapping("/me/{hotelBookingRecordId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<HotelBookingResponse> cancelMyHotelBooking(
            @PathVariable Long hotelBookingRecordId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(hotelBookingService.cancelMyBooking(hotelBookingRecordId, authentication.getName()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HotelBookingResponse>> getAdminHotelBookings() {
        return ResponseEntity.ok(hotelBookingService.getAdminBookings());
    }

    @PatchMapping("/admin/{hotelBookingRecordId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HotelBookingResponse> updateHotelBookingStatus(
            @PathVariable Long hotelBookingRecordId,
            @Valid @RequestBody UpdateHotelBookingStatusRequest request
    ) {
        return ResponseEntity.ok(hotelBookingService.updateBookingStatus(hotelBookingRecordId, request));
    }
}
