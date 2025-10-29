package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.Goal;
import com.qfin.qfinbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUser(User user);

    List<Goal> findByUserAndTargetDateBetween(User user, LocalDate startDate, LocalDate endDate);
}
