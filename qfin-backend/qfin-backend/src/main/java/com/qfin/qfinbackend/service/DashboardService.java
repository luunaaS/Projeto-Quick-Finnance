package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.FinancingRepository;
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

    public Map<String, Object> getDashboardData(User user) {
        List<Transaction> transactions = transactionRepository.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getId() != null && t.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());

        List<Financing> financings = financingRepository.findAll().stream()
                .filter(f -> f.getUser() != null && f.getUser().getId() != null && f.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());

        double totalIncome = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        double totalExpenses = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

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

        return dashboard;
    }
}
