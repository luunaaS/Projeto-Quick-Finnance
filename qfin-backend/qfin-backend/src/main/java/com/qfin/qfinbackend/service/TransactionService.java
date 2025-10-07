package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, Transaction transactionDetails) {
        return transactionRepository.findById(id)
                .map(transaction -> {
                    transaction.setType(transactionDetails.getType());
                    transaction.setAmount(transactionDetails.getAmount());
                    transaction.setCategory(transactionDetails.getCategory());
                    transaction.setDescription(transactionDetails.getDescription());
                    transaction.setDate(transactionDetails.getDate());
                    return transactionRepository.save(transaction);
                }).orElse(null); // Or throw an exception
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }
}