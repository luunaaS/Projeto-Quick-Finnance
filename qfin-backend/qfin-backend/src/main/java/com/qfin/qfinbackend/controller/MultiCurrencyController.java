package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.ExchangeRate;
import com.qfin.qfinbackend.model.MultiCurrencyTransaction;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.UserRepository;
import com.qfin.qfinbackend.service.MultiCurrencyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/multi-currency")
public class MultiCurrencyController {

    @Autowired
    private MultiCurrencyService multiCurrencyService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<MultiCurrencyTransaction>> getAllTransactions() {
        User user = getCurrentUser();
        return ResponseEntity.ok(multiCurrencyService.getTransactionsByUser(user));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<MultiCurrencyTransaction> getTransactionById(@PathVariable Long id) {
        User user = getCurrentUser();
        return multiCurrencyService.getTransactionByIdAndUser(id, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/transactions")
    public ResponseEntity<MultiCurrencyTransaction> createTransaction(@Valid @RequestBody MultiCurrencyTransaction transaction) {
        User user = getCurrentUser();
        transaction.setUser(user);
        MultiCurrencyTransaction created = multiCurrencyService.createTransaction(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<MultiCurrencyTransaction> updateTransaction(@PathVariable Long id, @Valid @RequestBody MultiCurrencyTransaction details) {
        User user = getCurrentUser();
        MultiCurrencyTransaction updated = multiCurrencyService.updateTransaction(id, details, user);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        User user = getCurrentUser();
        multiCurrencyService.deleteTransaction(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exchange-rates")
    public ResponseEntity<List<ExchangeRate>> getExchangeRates() {
        return ResponseEntity.ok(multiCurrencyService.getAllExchangeRates());
    }

    @PostMapping("/exchange-rates")
    public ResponseEntity<ExchangeRate> updateExchangeRate(@RequestBody Map<String, Object> body) {
        String currency = (String) body.get("currency");
        Double rate = ((Number) body.get("rate")).doubleValue();
        return ResponseEntity.ok(multiCurrencyService.updateExchangeRate(currency, rate));
    }

    @GetMapping("/convert")
    public ResponseEntity<Map<String, Double>> convertCurrency(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam Double amount) {
        Double rate = multiCurrencyService.getExchangeRateValue(from, to);
        Double convertedAmount = amount * rate;
        return ResponseEntity.ok(Map.of(
                "rate", rate,
                "convertedAmount", convertedAmount
        ));
    }
}
