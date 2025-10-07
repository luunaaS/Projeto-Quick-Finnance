package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Financing {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Name cannot be empty")
    private String name;
    
    @NotNull(message = "Total amount cannot be null")
    @DecimalMin(value = "0.01", message = "Total amount must be greater than 0")
    private Double totalAmount;
    
    @NotNull(message = "Remaining amount cannot be null")
    @DecimalMin(value = "0.0", message = "Remaining amount must be greater than or equal to 0")
    private Double remainingAmount;
    
    @NotNull(message = "Monthly payment cannot be null")
    @DecimalMin(value = "0.01", message = "Monthly payment must be greater than 0")
    private Double monthlyPayment;
    
    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    private FinancingType type; // LOAN, MORTGAGE, CAR_FINANCING, etc.
    
    @NotNull(message = "End date cannot be null")
    private LocalDate endDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    public enum FinancingType {
        LOAN,
        MORTGAGE,
        CAR_FINANCING,
        PERSONAL_LOAN,
        STUDENT_LOAN,
        OTHER
    }
}
