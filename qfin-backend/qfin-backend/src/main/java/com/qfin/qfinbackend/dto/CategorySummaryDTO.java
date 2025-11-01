package com.qfin.qfinbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorySummaryDTO {
    private String category;
    private Double totalAmount;
    private Long transactionCount;
    private String type; // INCOME or EXPENSE
}
