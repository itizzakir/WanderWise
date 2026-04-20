package com.wanderwise.wanderwise_backend.tour;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/tours")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTourController {

    private final TourService tourService;

    @DeleteMapping("/{tourId}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long tourId) {
        tourService.deleteTourById(tourId);
        return ResponseEntity.noContent().build();
    }
}
