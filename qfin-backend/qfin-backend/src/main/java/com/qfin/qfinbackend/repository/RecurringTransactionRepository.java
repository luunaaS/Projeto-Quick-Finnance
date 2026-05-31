package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.RecurringTransaction;
import com.qfin.qfinbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByUserOrderByNextProcessingAsc(User user);
    Optional<RecurringTransaction> findByIdAndUser(Long id, User user);
    List<RecurringTransaction> findByUserAndIsActiveTrue(User user);
    List<RecurringTransaction> findByIsActiveTrueAndNextProcessingLessThanEqual(LocalDate date);
}
