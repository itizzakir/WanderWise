package com.wanderwise.wanderwise_backend.booking;

import com.wanderwise.wanderwise_backend.booking.dto.BookingResponse;
import com.wanderwise.wanderwise_backend.booking.dto.CreateBookingRequest;
import com.wanderwise.wanderwise_backend.booking.dto.UpdateBookingStatusRequest;
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
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication
    ) {
        BookingResponse response = bookingService.createBooking(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getUserBookings(authentication.getName()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAdminBookings() {
        return ResponseEntity.ok(bookingService.getAdminBookings());
    }

    @PatchMapping("/admin/{bookingRecordId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long bookingRecordId,
            @Valid @RequestBody UpdateBookingStatusRequest request
    ) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(bookingRecordId, request));
    }

    @DeleteMapping("/admin/{bookingRecordId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long bookingRecordId) {
        bookingService.deleteBooking(bookingRecordId);
        return ResponseEntity.noContent().build();
    }
}
