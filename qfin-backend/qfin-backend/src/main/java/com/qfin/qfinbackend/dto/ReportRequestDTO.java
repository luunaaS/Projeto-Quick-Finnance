package com.qfin.qfinbackend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ReportRequestDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private String category;
    private String type; // INCOME, EXPENSE, ALL
}
