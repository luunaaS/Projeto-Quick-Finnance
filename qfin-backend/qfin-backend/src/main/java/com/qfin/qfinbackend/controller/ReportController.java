package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.service.ReportService;
import com.qfin.qfinbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserService userService;

    @GetMapping("/transactions/pdf")
    public ResponseEntity<byte[]> downloadTransactionReport(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {

        String username = authentication.getName();
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        byte[] pdfContent = reportService.generateTransactionReport(username, start, end);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "relatorio-transacoes.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }

    @GetMapping("/financings/pdf")
    public ResponseEntity<byte[]> downloadFinancingReport(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {

        String username = authentication.getName();
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        byte[] pdfContent = reportService.generateFinancingReport(username, start, end);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "relatorio-financiamentos.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }

    @GetMapping("/goals/pdf")
    public ResponseEntity<byte[]> downloadGoalReport(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {

        String username = authentication.getName();
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        byte[] pdfContent = reportService.generateGoalReport(username, start, end);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "relatorio-metas.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }

    @GetMapping("/summary/pdf")
    public ResponseEntity<byte[]> downloadSummaryReport(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {

        String username = authentication.getName();
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        byte[] pdfContent = reportService.generateSummaryReport(username, start, end);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "resumo-financeiro.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }
}
