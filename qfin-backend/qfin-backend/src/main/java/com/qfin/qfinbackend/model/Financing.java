package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
    
    @NotBlank(message = "Type cannot be empty")
    private String type;
    
    @NotNull(message = "End date cannot be null")
    private LocalDate endDate;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    

}
