package com.wanderwise.wanderwise_backend.admin.dashboard;

import com.wanderwise.wanderwise_backend.admin.dashboard.dto.AdminDashboardOverviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/overview")
    public ResponseEntity<AdminDashboardOverviewResponse> getOverview() {
        return ResponseEntity.ok(adminDashboardService.getOverview());
    }
}
