package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.RecurringTransaction;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.UserRepository;
import com.qfin.qfinbackend.service.RecurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-transactions")
public class RecurringTransactionController {

    @Autowired
    private RecurringTransactionService recurringService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<RecurringTransaction>> getAllRecurringTransactions() {
        User user = getCurrentUser();
        return ResponseEntity.ok(recurringService.getRecurringTransactionsByUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecurringTransaction> getById(@PathVariable Long id) {
        User user = getCurrentUser();
        return recurringService.getByIdAndUser(id, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RecurringTransaction> createRecurringTransaction(@Valid @RequestBody RecurringTransaction recurring) {
        User user = getCurrentUser();
        recurring.setUser(user);
        RecurringTransaction created = recurringService.createRecurringTransaction(recurring);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransaction> updateRecurringTransaction(@PathVariable Long id, @Valid @RequestBody RecurringTransaction details) {
        User user = getCurrentUser();
        RecurringTransaction updated = recurringService.updateRecurringTransaction(id, details, user);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<RecurringTransaction> toggleActive(@PathVariable Long id) {
        User user = getCurrentUser();
        RecurringTransaction updated = recurringService.toggleActive(id, user);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurringTransaction(@PathVariable Long id) {
        User user = getCurrentUser();
        recurringService.deleteRecurringTransaction(id, user);
        return ResponseEntity.noContent().build();
    }
}
