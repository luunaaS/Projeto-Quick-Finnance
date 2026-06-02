package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.dto.CategorySummaryDTO;
import com.qfin.qfinbackend.dto.ReportRequestDTO;
import com.qfin.qfinbackend.dto.ReportSummaryDTO;
import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.Transaction.TransactionType;
import com.qfin.qfinbackend.repository.FinancingRepository;
import com.qfin.qfinbackend.repository.TransactionRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private FinancingRepository financingRepository;

    public List<Transaction> getTransactionsByFilters(Long userId, ReportRequestDTO request) {
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now().minusMonths(1);
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : LocalDate.now();
        
        TransactionType type = null;
        if (request.getType() != null && !request.getType().equalsIgnoreCase("ALL")) {
            type = TransactionType.valueOf(request.getType().toUpperCase());
        }
        
        return transactionRepository.findByFilters(userId, startDate, endDate, type, request.getCategory());
    }

    public ReportSummaryDTO getReportSummary(Long userId, ReportRequestDTO request) {
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now().minusMonths(1);
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : LocalDate.now();

        Double totalIncome = transactionRepository.sumByUserIdAndTypeAndDateBetween(
            userId, TransactionType.INCOME, startDate, endDate);
        Double totalExpense = transactionRepository.sumByUserIdAndTypeAndDateBetween(
            userId, TransactionType.EXPENSE, startDate, endDate);

        totalIncome = totalIncome != null ? totalIncome : 0.0;
        totalExpense = totalExpense != null ? totalExpense : 0.0;

        List<Transaction> transactions = getTransactionsByFilters(userId, request);
        
        List<CategorySummaryDTO> categoryBreakdown = new ArrayList<>();
        
        // Income categories
        List<Object[]> incomeCategories = transactionRepository.sumByCategoryAndType(
            userId, TransactionType.INCOME, startDate, endDate);
        for (Object[] row : incomeCategories) {
            categoryBreakdown.add(new CategorySummaryDTO(
                (String) row[0],
                (Double) row[1],
                ((Number) row[2]).longValue(),
                "INCOME"
            ));
        }
        
        // Expense categories
        List<Object[]> expenseCategories = transactionRepository.sumByCategoryAndType(
            userId, TransactionType.EXPENSE, startDate, endDate);
        for (Object[] row : expenseCategories) {
            categoryBreakdown.add(new CategorySummaryDTO(
                (String) row[0],
                (Double) row[1],
                ((Number) row[2]).longValue(),
                "EXPENSE"
            ));
        }

        return new ReportSummaryDTO(
            totalIncome,
            totalExpense,
            totalIncome - totalExpense,
            (long) transactions.size(),
            categoryBreakdown
        );
    }

    public byte[] exportTransactionsToCSV(Long userId, ReportRequestDTO request) throws IOException {
        List<Transaction> transactions = getTransactionsByFilters(userId, request);
        
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        OutputStreamWriter writer = new OutputStreamWriter(out);
        
        CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
            .setHeader("Data", "Tipo", "Categoria", "Descrição", "Valor")
            .build();
        
        try (CSVPrinter printer = new CSVPrinter(writer, csvFormat)) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            
            for (Transaction transaction : transactions) {
                printer.printRecord(
                    transaction.getDate().format(formatter),
                    transaction.getType().toString(),
                    transaction.getCategory(),
                    transaction.getDescription(),
                    String.format("%.2f", transaction.getAmount())
                );
            }
            
            printer.flush();
        }
        
        return out.toByteArray();
    }

    public byte[] exportFinancingsToCSV(Long userId) throws IOException {
        List<Financing> financings = financingRepository.findAll().stream()
            .filter(f -> f.getUser().getId().equals(userId))
            .collect(Collectors.toList());
        
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        OutputStreamWriter writer = new OutputStreamWriter(out);
        
        CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
            .setHeader("Nome", "Tipo", "Valor Total", "Valor Restante", "Parcela Mensal", "Data Final")
            .build();
        
        try (CSVPrinter printer = new CSVPrinter(writer, csvFormat)) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            
            for (Financing financing : financings) {
                printer.printRecord(
                    financing.getName(),
                    financing.getType().toString(),
                    String.format("%.2f", financing.getTotalAmount()),
                    String.format("%.2f", financing.getRemainingAmount()),
                    String.format("%.2f", financing.getMonthlyPayment()),
                    financing.getEndDate().format(formatter)
                );
            }
            
            printer.flush();
        }
        
        return out.toByteArray();
    }

    public byte[] exportReportToPDF(Long userId, ReportRequestDTO request) throws IOException {
        ReportSummaryDTO summary = getReportSummary(userId, request);
        List<Transaction> transactions = getTransactionsByFilters(userId, request);

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(out);
        com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(writer);
        com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdf);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        document.add(new com.itextpdf.layout.element.Paragraph("RELATÓRIO FINANCEIRO").setBold().setFontSize(16));
        document.add(new com.itextpdf.layout.element.Paragraph(" "));
        document.add(new com.itextpdf.layout.element.Paragraph(
                "Período: " + request.getStartDate() + " a " + request.getEndDate()));
        document.add(new com.itextpdf.layout.element.Paragraph(" "));

        document.add(new com.itextpdf.layout.element.Paragraph("RESUMO").setBold());
        document.add(new com.itextpdf.layout.element.Paragraph("Total de Receitas: R$ " + String.format("%.2f", summary.getTotalIncome())));
        document.add(new com.itextpdf.layout.element.Paragraph("Total de Despesas: R$ " + String.format("%.2f", summary.getTotalExpense())));
        document.add(new com.itextpdf.layout.element.Paragraph("Saldo: R$ " + String.format("%.2f", summary.getBalance())));
        document.add(new com.itextpdf.layout.element.Paragraph("Total de Transações: " + summary.getTotalTransactions()));
        document.add(new com.itextpdf.layout.element.Paragraph(" "));

        document.add(new com.itextpdf.layout.element.Paragraph("DETALHAMENTO POR CATEGORIA").setBold());
        for (CategorySummaryDTO category : summary.getCategoryBreakdown()) {
            document.add(new com.itextpdf.layout.element.Paragraph(
                    category.getCategory() + " (" + category.getType() + "): R$ "
                            + String.format("%.2f", category.getTotalAmount())
                            + " (" + category.getTransactionCount() + " transações)"
            ));
        }

        document.add(new com.itextpdf.layout.element.Paragraph(" "));
        document.add(new com.itextpdf.layout.element.Paragraph("TRANSAÇÕES DETALHADAS").setBold());
        for (Transaction transaction : transactions) {
            document.add(new com.itextpdf.layout.element.Paragraph(
                    transaction.getDate().format(formatter) + " - "
                            + transaction.getType() + " - "
                            + transaction.getCategory() + " - "
                            + transaction.getDescription() + " - R$ "
                            + String.format("%.2f", transaction.getAmount())
            ));
        }

        document.close();
        return out.toByteArray();
    }
}
