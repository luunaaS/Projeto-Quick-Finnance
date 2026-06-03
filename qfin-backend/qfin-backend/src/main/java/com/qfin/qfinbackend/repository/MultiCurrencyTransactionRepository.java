package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.MultiCurrencyTransaction;
import com.qfin.qfinbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MultiCurrencyTransactionRepository extends JpaRepository<MultiCurrencyTransaction, Long> {
    List<MultiCurrencyTransaction> findByUserOrderByDateDesc(User user);
    Optional<MultiCurrencyTransaction> findByIdAndUser(Long id, User user);
    List<MultiCurrencyTransaction> findByUserAndCurrency(User user, String currency);
}
