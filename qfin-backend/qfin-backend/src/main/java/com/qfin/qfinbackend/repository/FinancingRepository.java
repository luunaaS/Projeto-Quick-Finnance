package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinancingRepository extends JpaRepository<Financing, Long> {
    List<Financing> findByUserAndStartDateBetween(User user, LocalDate startDate, LocalDate endDate);
}
