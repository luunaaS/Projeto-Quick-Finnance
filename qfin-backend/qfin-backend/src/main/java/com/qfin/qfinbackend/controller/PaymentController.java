package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.Payment;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.UserRepository;
import com.qfin.qfinbackend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financings/{financingId}/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<Payment> getPaymentsByFinancing(@PathVariable Long financingId) {
        User user = getCurrentUser();
        return paymentService.getPaymentsByFinancing(financingId, user);
    }

    @PostMapping
    public ResponseEntity<Payment> addPayment(
            @PathVariable Long financingId,
            @Valid @RequestBody Payment payment) {
        User user = getCurrentUser();
        Payment createdPayment = paymentService.addPayment(financingId, payment, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
    }

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(
            @PathVariable Long financingId,
            @PathVariable Long paymentId) {
        User user = getCurrentUser();
        paymentService.deletePayment(paymentId, user);
        return ResponseEntity.noContent().build();
    }
}
