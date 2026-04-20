package com.wanderwise.wanderwise_backend.trip;

import com.wanderwise.wanderwise_backend.trip.dto.TripDetailResponse;
import com.wanderwise.wanderwise_backend.trip.dto.TripSummaryResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<TripSummaryResponse>> getMyTrips(Authentication authentication) {
        return ResponseEntity.ok(tripService.getMyTrips(authentication.getName()));
    }

    @GetMapping("/me/{bookingRecordId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<TripDetailResponse> getMyTripDetails(
            @PathVariable Long bookingRecordId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(tripService.getMyTripDetails(authentication.getName(), bookingRecordId));
    }
}
