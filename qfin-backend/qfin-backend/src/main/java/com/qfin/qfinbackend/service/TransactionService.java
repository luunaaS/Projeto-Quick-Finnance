package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<Transaction> getTransactionsByUser(User user) {
        return transactionRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    public Optional<Transaction> getTransactionByIdAndUser(Long id, User user) {
        return transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()));
    }

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, Transaction transactionDetails, User user) {
        return transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .map(transaction -> {
                    transaction.setType(transactionDetails.getType());
                    transaction.setAmount(transactionDetails.getAmount());
                    transaction.setCategory(transactionDetails.getCategory());
                    transaction.setDescription(transactionDetails.getDescription());
                    transaction.setDate(transactionDetails.getDate());
                    return transactionRepository.save(transaction);
                }).orElse(null);
    }

    public void deleteTransaction(Long id, User user) {
        transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .ifPresent(transactionRepository::delete);
    }
}
