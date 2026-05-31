package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "exchange_rates")
public class ExchangeRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Currency cannot be empty")
    @Column(unique = true)
    private String currency;

    @NotNull(message = "Rate cannot be null")
    private Double rate;

    @NotNull
    private LocalDateTime lastUpdated;
}
