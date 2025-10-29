package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.Goal;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.UserRepository;
import com.qfin.qfinbackend.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {
    
    @Autowired
    private GoalService goalService;
    
    @Autowired
    private UserRepository userRepository;
    
    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @GetMapping
    public ResponseEntity<List<Goal>> getAllGoals(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            List<Goal> goals = goalService.getAllGoalsByUser(user);
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(@PathVariable Long id, Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Optional<Goal> goal = goalService.getGoalById(id, user);
            return goal.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal, Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Goal createdGoal = goalService.createGoal(goal, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdGoal);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(
            @PathVariable Long id,
            @RequestBody Goal goalDetails,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Goal updatedGoal = goalService.updateGoal(id, goalDetails, user);
            return ResponseEntity.ok(updatedGoal);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PatchMapping("/{id}/add")
    public ResponseEntity<Goal> addToGoal(
            @PathVariable Long id,
            @RequestBody Map<String, Double> request,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Double amount = request.get("amount");
            if (amount == null || amount <= 0) {
                return ResponseEntity.badRequest().build();
            }
            Goal updatedGoal = goalService.addToGoal(id, amount, user);
            return ResponseEntity.ok(updatedGoal);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Goal> completeGoal(@PathVariable Long id, Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Goal completedGoal = goalService.completeGoal(id, user);
            return ResponseEntity.ok(completedGoal);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Goal> cancelGoal(@PathVariable Long id, Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Goal cancelledGoal = goalService.cancelGoal(id, user);
            return ResponseEntity.ok(cancelledGoal);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id, Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            goalService.deleteGoal(id, user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
