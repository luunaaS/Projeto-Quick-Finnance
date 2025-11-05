package com.qfin.qfinbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryDTO {
    private Double totalIncome;
    private Double totalExpense;
    private Double balance;
    private Long totalTransactions;
    private List<CategorySummaryDTO> categoryBreakdown;
}
