package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.UserRepository;
import com.qfin.qfinbackend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard() {
        User user = getCurrentUser();
        Map<String, Object> dashboardData = dashboardService.getDashboardData(user);
        return ResponseEntity.ok(dashboardData);
    }
}
