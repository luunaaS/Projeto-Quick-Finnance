package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.dto.CategorySummaryDTO;
import com.qfin.qfinbackend.dto.ReportRequestDTO;
import com.qfin.qfinbackend.dto.ReportSummaryDTO;
import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.model.RecurringTransaction;
import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.Transaction.TransactionType;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.FinancingRepository;
import com.qfin.qfinbackend.repository.RecurringTransactionRepository;
import com.qfin.qfinbackend.repository.TransactionRepository;
import com.qfin.qfinbackend.repository.UserRepository;
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
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private FinancingRepository financingRepository;

    @Autowired
    private RecurringTransactionRepository recurringTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Transaction> getTransactionsByFilters(Long userId, ReportRequestDTO request) {
        return getMergedTransactions(userId, request);
    }

    public ReportSummaryDTO getReportSummary(Long userId, ReportRequestDTO request) {
        List<Transaction> transactions = getMergedTransactions(userId, request);

        double totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        double totalExpense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        List<CategorySummaryDTO> categoryBreakdown = buildCategoryBreakdown(transactions);

        return new ReportSummaryDTO(
            totalIncome,
            totalExpense,
            totalIncome - totalExpense,
            (long) transactions.size(),
            categoryBreakdown
        );
    }

    private List<Transaction> getMergedTransactions(Long userId, ReportRequestDTO request) {
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now().minusMonths(1);
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : LocalDate.now();

        TransactionType type = null;
        if (request.getType() != null && !request.getType().equalsIgnoreCase("ALL")) {
            type = TransactionType.valueOf(request.getType().toUpperCase());
        }

        List<Transaction> baseTransactions = transactionRepository.findByFilters(userId, startDate, endDate, type, request.getCategory());

        List<Transaction> recurringProjectedTransactions = buildRecurringProjectedTransactions(
                userId, startDate, endDate, type, request.getCategory());

        List<Transaction> merged = new ArrayList<>(baseTransactions);
        merged.addAll(recurringProjectedTransactions);
        merged.sort(Comparator.comparing(Transaction::getDate).reversed());
        return merged;
    }

    private List<CategorySummaryDTO> buildCategoryBreakdown(List<Transaction> transactions) {
        List<CategorySummaryDTO> categoryBreakdown = new ArrayList<>();

        List<String> categories = transactions.stream()
                .map(t -> t.getCategory() != null ? t.getCategory() : "SEM_CATEGORIA")
                .distinct()
                .toList();

        for (String category : categories) {
            double incomeAmount = transactions.stream()
                    .filter(t -> (t.getCategory() != null ? t.getCategory() : "SEM_CATEGORIA").equals(category))
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                    .sum();
            long incomeCount = transactions.stream()
                    .filter(t -> (t.getCategory() != null ? t.getCategory() : "SEM_CATEGORIA").equals(category))
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .count();

            if (incomeCount > 0) {
                categoryBreakdown.add(new CategorySummaryDTO(category, incomeAmount, incomeCount, "INCOME"));
            }

            double expenseAmount = transactions.stream()
                    .filter(t -> (t.getCategory() != null ? t.getCategory() : "SEM_CATEGORIA").equals(category))
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                    .sum();
            long expenseCount = transactions.stream()
                    .filter(t -> (t.getCategory() != null ? t.getCategory() : "SEM_CATEGORIA").equals(category))
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .count();

            if (expenseCount > 0) {
                categoryBreakdown.add(new CategorySummaryDTO(category, expenseAmount, expenseCount, "EXPENSE"));
            }
        }

        return categoryBreakdown;
    }

    private List<Transaction> buildRecurringProjectedTransactions(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            TransactionType typeFilter,
            String categoryFilter
    ) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return List.of();

        List<RecurringTransaction> recurringTransactions = recurringTransactionRepository.findByUserAndIsActiveTrue(user);
        List<Transaction> projected = new ArrayList<>();

        for (RecurringTransaction recurring : recurringTransactions) {
            TransactionType recurringType = recurring.getType() == RecurringTransaction.TransactionType.INCOME
                    ? TransactionType.INCOME
                    : TransactionType.EXPENSE;

            if (typeFilter != null && recurringType != typeFilter) continue;
            if (categoryFilter != null && !categoryFilter.isBlank()
                    && !categoryFilter.equalsIgnoreCase(recurring.getCategory())) continue;

            LocalDate cursor = recurring.getNextProcessing();
            if (cursor == null) continue;

            LocalDate hardEnd = recurring.getEndDate() != null && recurring.getEndDate().isBefore(endDate)
                    ? recurring.getEndDate()
                    : endDate;

            while (!cursor.isAfter(hardEnd)) {
                if (!cursor.isBefore(startDate)) {
                    Transaction synthetic = new Transaction();
                    synthetic.setUser(user);
                    synthetic.setDate(cursor);
                    synthetic.setType(recurringType);
                    synthetic.setAmount(recurring.getAmount());
                    synthetic.setCategory(recurring.getCategory());
                    synthetic.setDescription("[REC-PROJ:" + recurring.getId() + "] " + recurring.getName());
                    projected.add(synthetic);
                }
                cursor = nextDateByFrequency(cursor, recurring);
            }
        }

        return projected;
    }

    private LocalDate nextDateByFrequency(LocalDate current, RecurringTransaction recurring) {
        switch (recurring.getFrequency()) {
            case DAILY:
                return current.plusDays(1);
            case WEEKLY:
                return current.plusWeeks(1);
            case MONTHLY:
                LocalDate nextMonth = current.plusMonths(1);
                if (recurring.getDayOfMonth() != null) {
                    int day = Math.min(recurring.getDayOfMonth(), nextMonth.lengthOfMonth());
                    return nextMonth.withDayOfMonth(day);
                }
                return nextMonth;
            case YEARLY:
                return current.plusYears(1);
            default:
                return current.plusMonths(1);
        }
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
