package com.wanderwise.wanderwise_backend.dashboard;

import com.wanderwise.wanderwise_backend.dashboard.dto.TravelerDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class TravelerDashboardController {

    private final TravelerDashboardService travelerDashboardService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<TravelerDashboardResponse> getMyDashboard(Authentication authentication) {
        return ResponseEntity.ok(travelerDashboardService.getDashboard(authentication.getName()));
    }
}
