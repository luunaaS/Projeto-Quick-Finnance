package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotBlank(message = "Description cannot be empty")
    private String description;

    @NotNull(message = "Target amount cannot be null")
    @DecimalMin(value = "0.01", message = "Target amount must be greater than 0")
    private Double targetAmount;

    @NotNull(message = "Current amount cannot be null")
    @DecimalMin(value = "0.0", message = "Current amount must be greater than or equal to 0")
    private Double currentAmount;

    @NotNull(message = "Target date cannot be null")
    private LocalDate targetDate;

    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    private GoalType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public enum GoalType {
        SAVINGS,
        INVESTMENT,
        DEBT_PAYMENT,
        EMERGENCY_FUND,
        VACATION,
        CAR_PURCHASE,
        HOME_DOWN_PAYMENT,
        EDUCATION,
        OTHER
    }
}
