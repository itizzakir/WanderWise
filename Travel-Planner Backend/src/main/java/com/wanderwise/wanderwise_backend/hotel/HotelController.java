package com.wanderwise.wanderwise_backend.hotel;

import com.wanderwise.wanderwise_backend.hotel.dto.HotelResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<HotelResponse>> getHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @GetMapping("/suggestions")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<HotelResponse>> getSuggestedHotels(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String country,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(hotelService.getSuggestedHotels(destination, country, limit));
    }

    @GetMapping("/suggestions/by-tour/{tourSlug}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<HotelResponse>> getSuggestedHotelsByTourSlug(
            @PathVariable String tourSlug,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(hotelService.getSuggestedHotelsByTourSlug(tourSlug, limit));
    }
}
