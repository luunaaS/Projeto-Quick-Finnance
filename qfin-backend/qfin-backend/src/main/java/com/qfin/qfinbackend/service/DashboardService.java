package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.model.MultiCurrencyTransaction;
import com.qfin.qfinbackend.model.RecurringTransaction;
import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.FinancingRepository;
import com.qfin.qfinbackend.repository.MultiCurrencyTransactionRepository;
import com.qfin.qfinbackend.repository.RecurringTransactionRepository;
import com.qfin.qfinbackend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private FinancingRepository financingRepository;

    @Autowired
    private MultiCurrencyTransactionRepository multiCurrencyTransactionRepository;

    @Autowired
    private RecurringTransactionRepository recurringTransactionRepository;

    public Map<String, Object> getDashboardData(User user) {
        List<Transaction> transactions = transactionRepository.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getId() != null && t.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());

        List<Financing> financings = financingRepository.findAll().stream()
                .filter(f -> f.getUser() != null && f.getUser().getId() != null && f.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());

        List<MultiCurrencyTransaction> multiCurrencyTransactions = multiCurrencyTransactionRepository.findByUserOrderByDateDesc(user);
        List<RecurringTransaction> recurringTransactions = recurringTransactionRepository.findByUserAndIsActiveTrue(user);

        double totalIncome = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        double totalExpenses = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        // Multi-moeda já é espelhada em Transaction ([MC:id]); evitar dupla contagem no consolidado
        // recorrentes ativos entram como visão planejada de receita/compromisso
        double recurringIncome = recurringTransactions.stream()
                .filter(t -> t.getType() == RecurringTransaction.TransactionType.INCOME)
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        double recurringExpense = recurringTransactions.stream()
                .filter(t -> t.getType() == RecurringTransaction.TransactionType.EXPENSE)
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        totalIncome += recurringIncome;
        totalExpenses += recurringExpense;

        double totalBalance = totalIncome - totalExpenses;

        List<Transaction> recentTransactions = transactions.stream()
                .sorted(Comparator.comparing(Transaction::getDate).reversed())
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalIncome", totalIncome);
        dashboard.put("totalExpenses", totalExpenses);
        dashboard.put("totalBalance", totalBalance);
        dashboard.put("financingsCount", financings.size());
        dashboard.put("recentTransactions", recentTransactions);
        dashboard.put("financings", financings);
        dashboard.put("transactionsCount", transactions.size());
        dashboard.put("multiCurrencyTransactionsCount", multiCurrencyTransactions.size());
        dashboard.put("recurringTransactionsCount", recurringTransactions.size());

        return dashboard;
    }
}
