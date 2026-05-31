package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "multi_currency_transactions")
public class MultiCurrencyTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private Double amount;

    @NotBlank(message = "Currency cannot be empty")
    private String currency;

    @NotBlank(message = "Category cannot be empty")
    private String category;

    @NotBlank(message = "Description cannot be empty")
    private String description;

    @NotNull(message = "Date cannot be null")
    private LocalDate date;

    private Double amountInBaseCurrency;

    private Double exchangeRate;

    @JsonProperty("convertedAmount")
    public Double getConvertedAmount() {
        return amountInBaseCurrency;
    }

    @JsonProperty("convertedAmount")
    public void setConvertedAmount(Double convertedAmount) {
        this.amountInBaseCurrency = convertedAmount;
    }

    @JsonProperty("baseCurrency")
    public String getBaseCurrency() {
        return "BRL";
    }

    @JsonProperty("baseCurrency")
    public void setBaseCurrency(String baseCurrency) {
        // always BRL
    }

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public enum TransactionType {
        INCOME,
        EXPENSE
    }
}
