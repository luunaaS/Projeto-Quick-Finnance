package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.Goal;
import com.qfin.qfinbackend.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @GetMapping
    public ResponseEntity<List<Goal>> getAllGoals(Authentication authentication) {
        String username = authentication.getName();
        List<Goal> goals = goalService.getAllGoalsForUser(username);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(@PathVariable Long id) {
        return goalService.getGoalById(id)
                .map(goal -> ResponseEntity.ok(goal))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal, Authentication authentication) {
        String email = authentication.getName();
        // Set the user for the goal
        goal.setUser(goalService.getAllGoalsForUser(email).isEmpty() ?
            null : goalService.getAllGoalsForUser(email).get(0).getUser());
        Goal savedGoal = goalService.saveGoal(goal);
        return ResponseEntity.ok(savedGoal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goalDetails) {
        return goalService.getGoalById(id)
                .map(goal -> {
                    goal.setName(goalDetails.getName());
                    goal.setDescription(goalDetails.getDescription());
                    goal.setTargetAmount(goalDetails.getTargetAmount());
                    goal.setCurrentAmount(goalDetails.getCurrentAmount());
                    goal.setTargetDate(goalDetails.getTargetDate());
                    goal.setType(goalDetails.getType());
                    Goal updatedGoal = goalService.saveGoal(goal);
                    return ResponseEntity.ok(updatedGoal);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        if (goalService.getGoalById(id).isPresent()) {
            goalService.deleteGoal(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Goal>> getGoalsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        String username = authentication.getName();
        List<Goal> goals = goalService.getGoalsByDateRange(username, startDate, endDate);
        return ResponseEntity.ok(goals);
    }
}
