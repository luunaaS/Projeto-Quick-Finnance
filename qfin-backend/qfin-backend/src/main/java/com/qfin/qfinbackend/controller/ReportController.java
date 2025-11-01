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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ReportRequestDTO request) {
        
        User user = (User) userDetails;
        List<Transaction> transactions = reportService.getTransactionsByFilters(user.getId(), request);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/summary")
    public ResponseEntity<ReportSummaryDTO> getSummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ReportRequestDTO request) {
        
        User user = (User) userDetails;
        ReportSummaryDTO summary = reportService.getReportSummary(user.getId(), request);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/export/transactions/csv")
    public ResponseEntity<byte[]> exportTransactionsCSV(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ReportRequestDTO request) {
        
        try {
            User user = (User) userDetails;
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
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            User user = (User) userDetails;
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
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ReportRequestDTO request) {
        
        try {
            User user = (User) userDetails;
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
