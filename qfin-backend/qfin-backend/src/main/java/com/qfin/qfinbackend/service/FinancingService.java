package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.repository.FinancingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FinancingService {

    @Autowired
    private FinancingRepository financingRepository;

    public List<Financing> getAllFinancings() {
        return financingRepository.findAll();
    }

    public Optional<Financing> getFinancingById(Long id) {
        return financingRepository.findById(id);
    }

    public Financing createFinancing(Financing financing) {
        return financingRepository.save(financing);
    }

    public Financing updateFinancing(Long id, Financing financingDetails) {
        return financingRepository.findById(id)
                .map(financing -> {
                    financing.setName(financingDetails.getName());
                    financing.setTotalAmount(financingDetails.getTotalAmount());
                    financing.setRemainingAmount(financingDetails.getRemainingAmount());
                    financing.setMonthlyPayment(financingDetails.getMonthlyPayment());
                    financing.setType(financingDetails.getType());
                    financing.setEndDate(financingDetails.getEndDate());
                    return financingRepository.save(financing);
                }).orElse(null); // Or throw an exception
    }

    public void deleteFinancing(Long id) {
        financingRepository.deleteById(id);
    }
}