package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Goal;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class GoalService {
    
    @Autowired
    private GoalRepository goalRepository;
    
    public List<Goal> getAllGoalsByUser(User user) {
        return goalRepository.findByUser(user);
    }
    
    public List<Goal> getGoalsByUserAndStatus(User user, Goal.GoalStatus status) {
        return goalRepository.findByUserAndStatus(user, status);
    }
    
    public Optional<Goal> getGoalById(Long id, User user) {
        return goalRepository.findById(id)
                .filter(g -> g.getUser().equals(user));
    }
    
    @Transactional
    public Goal createGoal(Goal goal, User user) {
        goal.setUser(user);
        goal.setStatus(Goal.GoalStatus.IN_PROGRESS);
        return goalRepository.save(goal);
    }
    
    @Transactional
    public Goal updateGoal(Long id, Goal goalDetails, User user) {
        Optional<Goal> optionalGoal = getGoalById(id, user);
        if (optionalGoal.isPresent()) {
            Goal goal = optionalGoal.get();
            goal.setName(goalDetails.getName());
            goal.setTargetAmount(goalDetails.getTargetAmount());
            goal.setCurrentAmount(goalDetails.getCurrentAmount());
            goal.setDeadline(goalDetails.getDeadline());
            goal.setCategory(goalDetails.getCategory());
            goal.setDescription(goalDetails.getDescription());
            
            // Auto-complete if current amount reaches target
            if (goal.getCurrentAmount() >= goal.getTargetAmount()) {
                goal.setStatus(Goal.GoalStatus.COMPLETED);
            }
            
            return goalRepository.save(goal);
        }
        throw new RuntimeException("Goal not found or unauthorized");
    }
    
    @Transactional
    public Goal addToGoal(Long id, Double amount, User user) {
        Optional<Goal> optionalGoal = getGoalById(id, user);
        if (optionalGoal.isPresent()) {
            Goal goal = optionalGoal.get();
            try {
                goal.addAmount(amount);
                return goalRepository.save(goal);
            } catch (IllegalStateException e) {
                throw new RuntimeException("Cannot add amount: " + e.getMessage());
            }
        }
        throw new RuntimeException("Goal not found or unauthorized");
    }
    
    @Transactional
    public Goal completeGoal(Long id, User user) {
        Optional<Goal> optionalGoal = getGoalById(id, user);
        if (optionalGoal.isPresent()) {
            Goal goal = optionalGoal.get();
            goal.complete();
            return goalRepository.save(goal);
        }
        throw new RuntimeException("Goal not found or unauthorized");
    }
    
    @Transactional
    public Goal cancelGoal(Long id, User user) {
        Optional<Goal> optionalGoal = getGoalById(id, user);
        if (optionalGoal.isPresent()) {
            Goal goal = optionalGoal.get();
            goal.cancel();
            return goalRepository.save(goal);
        }
        throw new RuntimeException("Goal not found or unauthorized");
    }
    
    @Transactional
    public void deleteGoal(Long id, User user) {
        Optional<Goal> optionalGoal = getGoalById(id, user);
        if (optionalGoal.isPresent()) {
            goalRepository.delete(optionalGoal.get());
        } else {
            throw new RuntimeException("Goal not found or unauthorized");
        }
    }
}
