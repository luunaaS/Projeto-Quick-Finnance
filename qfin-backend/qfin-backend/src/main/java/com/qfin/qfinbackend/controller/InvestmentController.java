package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.Investment;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.UserRepository;
import com.qfin.qfinbackend.service.InvestmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    @Autowired
    private InvestmentService investmentService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Investment>> getAllInvestments() {
        User user = getCurrentUser();
        return ResponseEntity.ok(investmentService.getInvestmentsByUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Investment> getInvestmentById(@PathVariable Long id) {
        User user = getCurrentUser();
        return investmentService.getInvestmentByIdAndUser(id, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Investment> createInvestment(@Valid @RequestBody Investment investment) {
        User user = getCurrentUser();
        investment.setUser(user);
        Investment created = investmentService.createInvestment(investment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Investment> updateInvestment(@PathVariable Long id, @Valid @RequestBody Investment investmentDetails) {
        User user = getCurrentUser();
        Investment updated = investmentService.updateInvestment(id, investmentDetails, user);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvestment(@PathVariable Long id) {
        User user = getCurrentUser();
        investmentService.deleteInvestment(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Investment>> getByType(@PathVariable String type) {
        User user = getCurrentUser();
        Investment.InvestmentType investmentType = Investment.InvestmentType.valueOf(type.toUpperCase());
        return ResponseEntity.ok(investmentService.getInvestmentsByType(user, investmentType));
    }
}
