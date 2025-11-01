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
        // Simplified PDF generation - returns a basic text representation
        // For full PDF support, you would use iText library
        ReportSummaryDTO summary = getReportSummary(userId, request);
        List<Transaction> transactions = getTransactionsByFilters(userId, request);
        
        StringBuilder pdfContent = new StringBuilder();
        pdfContent.append("RELATÓRIO FINANCEIRO\n\n");
        pdfContent.append("Período: ").append(request.getStartDate()).append(" a ").append(request.getEndDate()).append("\n\n");
        pdfContent.append("RESUMO\n");
        pdfContent.append("Total de Receitas: R$ ").append(String.format("%.2f", summary.getTotalIncome())).append("\n");
        pdfContent.append("Total de Despesas: R$ ").append(String.format("%.2f", summary.getTotalExpense())).append("\n");
        pdfContent.append("Saldo: R$ ").append(String.format("%.2f", summary.getBalance())).append("\n");
        pdfContent.append("Total de Transações: ").append(summary.getTotalTransactions()).append("\n\n");
        
        pdfContent.append("DETALHAMENTO POR CATEGORIA\n");
        for (CategorySummaryDTO category : summary.getCategoryBreakdown()) {
            pdfContent.append(category.getCategory()).append(" (").append(category.getType()).append("): R$ ")
                .append(String.format("%.2f", category.getTotalAmount()))
                .append(" (").append(category.getTransactionCount()).append(" transações)\n");
        }
        
        pdfContent.append("\n\nTRANSAÇÕES DETALHADAS\n");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        for (Transaction transaction : transactions) {
            pdfContent.append(transaction.getDate().format(formatter)).append(" - ")
                .append(transaction.getType()).append(" - ")
                .append(transaction.getCategory()).append(" - ")
                .append(transaction.getDescription()).append(" - R$ ")
                .append(String.format("%.2f", transaction.getAmount())).append("\n");
        }
        
        return pdfContent.toString().getBytes();
    }
}
