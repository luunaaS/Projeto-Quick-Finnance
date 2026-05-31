package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.RecurringTransaction;
import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.RecurringTransactionRepository;
import com.qfin.qfinbackend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class RecurringTransactionService {

    @Autowired
    private RecurringTransactionRepository recurringRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public List<RecurringTransaction> getRecurringTransactionsByUser(User user) {
        return recurringRepository.findByUserOrderByNextProcessingAsc(user);
    }

    public Optional<RecurringTransaction> getByIdAndUser(Long id, User user) {
        return recurringRepository.findByIdAndUser(id, user);
    }

    public RecurringTransaction createRecurringTransaction(RecurringTransaction recurring) {
        // Calculate next processing date if not set
        if (recurring.getNextProcessing() == null) {
            recurring.setNextProcessing(calculateNextProcessing(recurring));
        }
        return recurringRepository.save(recurring);
    }

    public RecurringTransaction updateRecurringTransaction(Long id, RecurringTransaction details, User user) {
        return recurringRepository.findByIdAndUser(id, user)
                .map(recurring -> {
                    recurring.setName(details.getName());
                    recurring.setType(details.getType());
                    recurring.setAmount(details.getAmount());
                    recurring.setCategory(details.getCategory());
                    recurring.setFrequency(details.getFrequency());
                    recurring.setDayOfMonth(details.getDayOfMonth());
                    recurring.setDayOfWeek(details.getDayOfWeek());
                    recurring.setStartDate(details.getStartDate());
                    recurring.setEndDate(details.getEndDate());
                    recurring.setAutoLaunch(details.getAutoLaunch());
                    recurring.setNextProcessing(calculateNextProcessing(recurring));
                    return recurringRepository.save(recurring);
                }).orElse(null);
    }

    public RecurringTransaction toggleActive(Long id, User user) {
        return recurringRepository.findByIdAndUser(id, user)
                .map(recurring -> {
                    recurring.setIsActive(!recurring.getIsActive());
                    return recurringRepository.save(recurring);
                }).orElse(null);
    }

    public void deleteRecurringTransaction(Long id, User user) {
        recurringRepository.findByIdAndUser(id, user)
                .ifPresent(recurringRepository::delete);
    }

    // Process auto-launch recurring transactions daily
    @Scheduled(cron = "0 0 6 * * *") // Run at 6 AM every day
    public void processRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTransactions =
                recurringRepository.findByIsActiveTrueAndNextProcessingLessThanEqual(today);

        for (RecurringTransaction recurring : dueTransactions) {
            if (recurring.getAutoLaunch()) {
                // Create actual transaction
                Transaction transaction = new Transaction();
                transaction.setType(recurring.getType() == RecurringTransaction.TransactionType.INCOME
                        ? Transaction.TransactionType.INCOME
                        : Transaction.TransactionType.EXPENSE);
                transaction.setAmount(recurring.getAmount());
                transaction.setCategory(recurring.getCategory());
                transaction.setDescription(recurring.getName() + " (Recorrente)");
                transaction.setDate(today);
                transaction.setUser(recurring.getUser());
                transactionRepository.save(transaction);
            }

            // Update last processed and next processing
            recurring.setLastProcessed(today);
            recurring.setNextProcessing(calculateNextProcessing(recurring));

            // Check if end date has passed
            if (recurring.getEndDate() != null && recurring.getEndDate().isBefore(today)) {
                recurring.setIsActive(false);
            }

            recurringRepository.save(recurring);
        }
    }

    private LocalDate calculateNextProcessing(RecurringTransaction recurring) {
        LocalDate baseDate = recurring.getLastProcessed() != null
                ? recurring.getLastProcessed()
                : recurring.getStartDate();

        switch (recurring.getFrequency()) {
            case DAILY:
                return baseDate.plusDays(1);
            case WEEKLY:
                return baseDate.plusWeeks(1);
            case MONTHLY:
                LocalDate nextMonth = baseDate.plusMonths(1);
                if (recurring.getDayOfMonth() != null) {
                    int day = Math.min(recurring.getDayOfMonth(), nextMonth.lengthOfMonth());
                    return nextMonth.withDayOfMonth(day);
                }
                return nextMonth;
            case YEARLY:
                return baseDate.plusYears(1);
            default:
                return baseDate.plusMonths(1);
        }
    }
}
