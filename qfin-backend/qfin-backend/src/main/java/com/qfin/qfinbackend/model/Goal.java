package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "goals")
public class Goal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private Double targetAmount;
    
    @Column(nullable = false)
    private Double currentAmount;
    
    @Column(nullable = false)
    private LocalDate deadline;
    
    @Column(nullable = false)
    private String category;
    
    @Column(length = 500)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalStatus status = GoalStatus.IN_PROGRESS;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    public enum GoalStatus {
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
    
    // Constructors
    public Goal() {
    }
    
    public Goal(String name, Double targetAmount, Double currentAmount, LocalDate deadline, String category, String description, User user) {
        this.name = name;
        this.targetAmount = targetAmount;
        this.currentAmount = currentAmount;
        this.deadline = deadline;
        this.category = category;
        this.description = description;
        this.user = user;
        this.status = GoalStatus.IN_PROGRESS;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Double getTargetAmount() {
        return targetAmount;
    }
    
    public void setTargetAmount(Double targetAmount) {
        this.targetAmount = targetAmount;
    }
    
    public Double getCurrentAmount() {
        return currentAmount;
    }
    
    public void setCurrentAmount(Double currentAmount) {
        this.currentAmount = currentAmount;
    }
    
    public LocalDate getDeadline() {
        return deadline;
    }
    
    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public GoalStatus getStatus() {
        return status;
    }
    
    public void setStatus(GoalStatus status) {
        this.status = status;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    // Business methods
    public void addAmount(Double amount) {
        if (this.status != GoalStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot add amount to a goal that is not in progress");
        }
        this.currentAmount += amount;
        if (this.currentAmount >= this.targetAmount) {
            this.status = GoalStatus.COMPLETED;
        }
    }
    
    public void complete() {
        this.status = GoalStatus.COMPLETED;
    }
    
    public void cancel() {
        this.status = GoalStatus.CANCELLED;
    }
    
    public Double getProgressPercentage() {
        if (targetAmount == 0) return 0.0;
        return Math.min((currentAmount / targetAmount) * 100, 100.0);
    }
}
