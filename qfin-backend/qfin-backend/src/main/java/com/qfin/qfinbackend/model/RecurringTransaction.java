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
@Table(name = "recurring_transactions")
public class RecurringTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private Double amount;

    @NotBlank(message = "Category cannot be empty")
    private String category;

    @NotNull(message = "Frequency cannot be null")
    @Enumerated(EnumType.STRING)
    private Frequency frequency;

    private Integer dayOfMonth;

    private Integer dayOfWeek;

    @NotNull(message = "Start date cannot be null")
    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull
    private Boolean autoLaunch = false;

    @NotNull
    private Boolean isActive = true;

    private LocalDate lastProcessed;

    @NotNull
    private LocalDate nextProcessing;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public enum TransactionType {
        INCOME,
        EXPENSE
    }

    public enum Frequency {
        DAILY,
        WEEKLY,
        MONTHLY,
        YEARLY
    }
}
