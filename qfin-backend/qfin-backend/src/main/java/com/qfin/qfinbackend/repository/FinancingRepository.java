package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.Financing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinancingRepository extends JpaRepository<Financing, Long> {
}
