package com.wanderwise.wanderwise_backend.hotel;

import com.wanderwise.wanderwise_backend.hotel.dto.HotelResponse;
import com.wanderwise.wanderwise_backend.hotel.dto.UpsertHotelRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/hotels")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminHotelController {

    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @PostMapping
    public ResponseEntity<HotelResponse> createHotel(@Valid @RequestBody UpsertHotelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hotelService.createHotel(request));
    }

    @PutMapping("/{hotelId}")
    public ResponseEntity<HotelResponse> updateHotel(
            @PathVariable Long hotelId,
            @Valid @RequestBody UpsertHotelRequest request
    ) {
        return ResponseEntity.ok(hotelService.updateHotel(hotelId, request));
    }

    @DeleteMapping("/{hotelId}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long hotelId) {
        hotelService.deleteHotel(hotelId);
        return ResponseEntity.noContent().build();
    }
}
