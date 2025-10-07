package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.service.FinancingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financings")
@CrossOrigin(origins = "http://localhost:3000") // Permitir requisições do frontend React
public class FinancingController {

    @Autowired
    private FinancingService financingService;

    @GetMapping
    public List<Financing> getAllFinancings() {
        return financingService.getAllFinancings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Financing> getFinancingById(@PathVariable Long id) {
        return financingService.getFinancingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Financing> createFinancing(@Valid @RequestBody Financing financing) {
        Financing createdFinancing = financingService.createFinancing(financing);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFinancing);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Financing> updateFinancing(@PathVariable Long id, @Valid @RequestBody Financing financingDetails) {
        Financing updatedFinancing = financingService.updateFinancing(id, financingDetails);
        if (updatedFinancing != null) {
            return ResponseEntity.ok(updatedFinancing);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFinancing(@PathVariable Long id) {
        financingService.deleteFinancing(id);
        return ResponseEntity.noContent().build();
    }
}