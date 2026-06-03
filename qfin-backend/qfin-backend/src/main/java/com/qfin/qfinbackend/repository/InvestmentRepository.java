package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.Investment;
import com.qfin.qfinbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByUser(User user);
    List<Investment> findByUserOrderByPurchaseDateDesc(User user);
    Optional<Investment> findByIdAndUser(Long id, User user);
    List<Investment> findByUserAndType(User user, Investment.InvestmentType type);
}
