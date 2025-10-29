package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Goal;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserService userService;

    public List<Goal> getAllGoalsForUser(String email) {
        User user = userService.findByEmail(email);
        return goalRepository.findByUser(user);
    }

    public Optional<Goal> getGoalById(Long id) {
        return goalRepository.findById(id);
    }

    public Goal saveGoal(Goal goal) {
        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        goalRepository.deleteById(id);
    }

    public List<Goal> getGoalsByDateRange(String email, LocalDate startDate, LocalDate endDate) {
        User user = userService.findByEmail(email);
        return goalRepository.findByUserAndTargetDateBetween(user, startDate, endDate);
    }
}
