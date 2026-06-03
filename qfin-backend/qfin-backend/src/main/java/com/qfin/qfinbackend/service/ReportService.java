package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.dto.CategorySummaryDTO;
import com.qfin.qfinbackend.dto.ReportRequestDTO;
import com.qfin.qfinbackend.dto.ReportSummaryDTO;
import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.model.Investment;
import com.qfin.qfinbackend.model.MultiCurrencyTransaction;
import com.qfin.qfinbackend.model.RecurringTransaction;
import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.Transaction.TransactionType;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.FinancingRepository;
import com.qfin.qfinbackend.repository.InvestmentRepository;
import com.qfin.qfinbackend.repository.MultiCurrencyTransactionRepository;
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
    private MultiCurrencyTransactionRepository multiCurrencyTransactionRepository;

    @Autowired
    private InvestmentRepository investmentRepository;

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

        List<Transaction> baseTransactions = transactionRepository.findByFilters(
                userId, startDate, endDate, type, request.getCategory());

        List<Transaction> recurringProjectedTransactions = buildRecurringProjectedTransactions(
                userId, startDate, endDate, type, request.getCategory());

        List<Transaction> financingSyntheticTransactions = buildFinancingSyntheticTransactions(
                userId, startDate, endDate, type, request.getCategory());

        List<Transaction> investmentSyntheticTransactions = buildInvestmentSyntheticTransactions(
                userId, startDate, endDate, type, request.getCategory());

        List<Transaction> multiCurrencyFallbackTransactions = buildMissingMultiCurrencyTransactions(
                userId, startDate, endDate, type, request.getCategory(), baseTransactions);

        // Evita duplicidade caso recorrente já tenha sido materializada em Transaction
        List<Transaction> dedupedRecurring = recurringProjectedTransactions.stream()
                .filter(rt -> baseTransactions.stream().noneMatch(bt ->
                        bt.getDate() != null
                                && rt.getDate() != null
                                && bt.getDate().equals(rt.getDate())
                                && bt.getType() == rt.getType()
                                && safe(bt.getCategory()).equalsIgnoreCase(safe(rt.getCategory()))
                                && safe(bt.getDescription()).contains("[REC:")
                                && bt.getAmount() != null
                                && rt.getAmount() != null
                                && Math.abs(bt.getAmount() - rt.getAmount()) < 0.0001
                ))
                .collect(Collectors.toList());

        List<Transaction> merged = new ArrayList<>(baseTransactions);
        merged.addAll(dedupedRecurring);
        merged.addAll(financingSyntheticTransactions);
        merged.addAll(investmentSyntheticTransactions);
        merged.addAll(multiCurrencyFallbackTransactions);
        merged.sort(Comparator.comparing(Transaction::getDate).reversed());
        return merged;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private List<Transaction> buildFinancingSyntheticTransactions(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            TransactionType typeFilter,
            String categoryFilter
    ) {
        if (typeFilter != null && typeFilter != TransactionType.EXPENSE) return List.of();

        return financingRepository.findAll().stream()
                .filter(f -> f.getUser() != null && f.getUser().getId() != null && f.getUser().getId().equals(userId))
                .filter(f -> f.getMonthlyPayment() != null && f.getMonthlyPayment() > 0)
                .flatMap(f -> {
                    List<Transaction> rows = new ArrayList<>();
                    LocalDate cursor = startDate.withDayOfMonth(1);
                    LocalDate limit = endDate.withDayOfMonth(1);

                    while (!cursor.isAfter(limit)) {
                        LocalDate paymentDate = cursor.withDayOfMonth(1);
                        if ((f.getEndDate() == null || !paymentDate.isAfter(f.getEndDate()))
                                && !paymentDate.isBefore(startDate)
                                && !paymentDate.isAfter(endDate)) {
                            Transaction synthetic = new Transaction();
                            synthetic.setUser(f.getUser());
                            synthetic.setDate(paymentDate);
                            synthetic.setType(TransactionType.EXPENSE);
                            synthetic.setAmount(f.getMonthlyPayment());
                            synthetic.setCategory("FINANCING");
                            synthetic.setDescription("[FIN:" + f.getId() + "] " + f.getName());
                            rows.add(synthetic);
                        }
                        cursor = cursor.plusMonths(1);
                    }
                    return rows.stream();
                })
                .filter(t -> categoryFilter == null || categoryFilter.isBlank()
                        || categoryFilter.equalsIgnoreCase(t.getCategory()))
                .collect(Collectors.toList());
    }

    private List<Transaction> buildInvestmentSyntheticTransactions(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            TransactionType typeFilter,
            String categoryFilter
    ) {
        if (typeFilter != null && typeFilter != TransactionType.INCOME) return List.of();

        return investmentRepository.findAll().stream()
                .filter(i -> i.getUser() != null && i.getUser().getId() != null && i.getUser().getId().equals(userId))
                .filter(i -> i.getPurchaseDate() != null && !i.getPurchaseDate().isBefore(startDate) && !i.getPurchaseDate().isAfter(endDate))
                .map(i -> {
                    double gain = (i.getCurrentValue() != null ? i.getCurrentValue() : 0.0)
                            - (i.getAmount() != null ? i.getAmount() : 0.0);
                    if (gain <= 0) return null;

                    Transaction synthetic = new Transaction();
                    synthetic.setUser(i.getUser());
                    synthetic.setDate(i.getPurchaseDate());
                    synthetic.setType(TransactionType.INCOME);
                    synthetic.setAmount(gain);
                    synthetic.setCategory("INVESTMENT");
                    synthetic.setDescription("[INV:" + i.getId() + "] " + i.getName());
                    return synthetic;
                })
                .filter(t -> t != null)
                .filter(t -> categoryFilter == null || categoryFilter.isBlank()
                        || categoryFilter.equalsIgnoreCase(t.getCategory()))
                .collect(Collectors.toList());
    }

    private List<Transaction> buildMissingMultiCurrencyTransactions(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            TransactionType typeFilter,
            String categoryFilter,
            List<Transaction> baseTransactions
    ) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return List.of();

        return multiCurrencyTransactionRepository.findByUserOrderByDateDesc(user).stream()
                .filter(mt -> mt.getDate() != null && !mt.getDate().isBefore(startDate) && !mt.getDate().isAfter(endDate))
                .filter(mt -> {
                    TransactionType mappedType = mt.getType() == MultiCurrencyTransaction.TransactionType.INCOME
                            ? TransactionType.INCOME
                            : TransactionType.EXPENSE;
                    return typeFilter == null || mappedType == typeFilter;
                })
                .filter(mt -> categoryFilter == null || categoryFilter.isBlank()
                        || categoryFilter.equalsIgnoreCase(mt.getCategory()))
                .filter(mt -> {
                    String marker = "[MC:" + mt.getId() + "]";
                    return baseTransactions.stream().noneMatch(t ->
                            t.getDescription() != null && t.getDescription().startsWith(marker));
                })
                .map(mt -> {
                    Transaction synthetic = new Transaction();
                    synthetic.setUser(user);
                    synthetic.setDate(mt.getDate());
                    synthetic.setType(mt.getType() == MultiCurrencyTransaction.TransactionType.INCOME
                            ? TransactionType.INCOME
                            : TransactionType.EXPENSE);
                    synthetic.setAmount(mt.getAmountInBaseCurrency() != null ? mt.getAmountInBaseCurrency() : 0.0);
                    synthetic.setCategory(mt.getCategory());
                    synthetic.setDescription("[MC-FALLBACK:" + mt.getId() + "] " + mt.getDescription());
                    return synthetic;
                })
                .collect(Collectors.toList());
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
