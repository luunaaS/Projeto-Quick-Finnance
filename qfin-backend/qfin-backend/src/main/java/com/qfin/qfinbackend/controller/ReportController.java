package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.dto.ReportRequestDTO;
import com.qfin.qfinbackend.dto.ReportSummaryDTO;
import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.qfin.qfinbackend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://3000-i1482b2on3ttpkl64sz68-5db5ba67.manusvm.computer"})
public class ReportController {

    @Autowired
    private ReportService reportService;
    
    @Autowired
    private UserRepository userRepository;
    
    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(
            Authentication authentication,
            @RequestBody ReportRequestDTO request) {
        
        User user = getCurrentUser(authentication);
        List<Transaction> transactions = reportService.getTransactionsByFilters(user.getId(), request);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/summary")
    public ResponseEntity<ReportSummaryDTO> getSummary(
            Authentication authentication,
            @RequestBody ReportRequestDTO request) {
        
        User user = getCurrentUser(authentication);
        ReportSummaryDTO summary = reportService.getReportSummary(user.getId(), request);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/export/transactions/csv")
    public ResponseEntity<byte[]> exportTransactionsCSV(
            Authentication authentication,
            @RequestBody ReportRequestDTO request) {
        
        try {
            User user = getCurrentUser(authentication);
            byte[] csvData = reportService.exportTransactionsToCSV(user.getId(), request);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "transacoes.csv");
            
            return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/financings/csv")
    public ResponseEntity<byte[]> exportFinancingsCSV(
            Authentication authentication) {
        
        try {
            User user = getCurrentUser(authentication);
            byte[] csvData = reportService.exportFinancingsToCSV(user.getId());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "financiamentos.csv");
            
            return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/export/pdf")
    public ResponseEntity<byte[]> exportReportPDF(
            Authentication authentication,
            @RequestBody ReportRequestDTO request) {
        
        try {
            User user = getCurrentUser(authentication);
            byte[] pdfData = reportService.exportReportToPDF(user.getId(), request);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "relatorio.pdf");
            
            return new ResponseEntity<>(pdfData, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
