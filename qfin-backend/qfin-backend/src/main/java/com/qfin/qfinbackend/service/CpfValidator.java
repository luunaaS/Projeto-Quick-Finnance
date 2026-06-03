package com.qfin.qfinbackend.service;

import org.springframework.stereotype.Component;

@Component
public class CpfValidator {

    public boolean isValid(String cpf) {
        if (cpf == null) return true; // CPF is optional
        String digits = cpf.replaceAll("[^0-9]", "");
        if (digits.length() != 11) return false;
        if (digits.matches("(\\d)\\1{10}")) return false; // all same digits

        int sum = 0;
        for (int i = 0; i < 9; i++) sum += (digits.charAt(i) - '0') * (10 - i);
        int first = 11 - (sum % 11);
        if (first >= 10) first = 0;
        if (first != (digits.charAt(9) - '0')) return false;

        sum = 0;
        for (int i = 0; i < 10; i++) sum += (digits.charAt(i) - '0') * (11 - i);
        int second = 11 - (sum % 11);
        if (second >= 10) second = 0;
        return second == (digits.charAt(10) - '0');
    }

    public String format(String cpf) {
        String digits = cpf.replaceAll("[^0-9]", "");
        return digits.replaceAll("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
    }
}
