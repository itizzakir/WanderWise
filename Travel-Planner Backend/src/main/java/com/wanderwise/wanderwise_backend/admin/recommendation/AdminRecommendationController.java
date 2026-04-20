package com.wanderwise.wanderwise_backend.admin.recommendation;

import com.wanderwise.wanderwise_backend.admin.recommendation.dto.AdminRecommendationsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/recommendations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRecommendationController {

    private final AdminRecommendationService adminRecommendationService;

    @GetMapping
    public ResponseEntity<AdminRecommendationsResponse> getRecommendations() {
        return ResponseEntity.ok(adminRecommendationService.getRecommendations());
    }
}
