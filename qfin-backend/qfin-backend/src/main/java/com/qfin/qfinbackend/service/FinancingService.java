package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.FinancingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FinancingService {

    @Autowired
    private FinancingRepository financingRepository;

    public List<Financing> getAllFinancings() {
        return financingRepository.findAll();
    }

    public List<Financing> getFinancingsByUser(User user) {
        return financingRepository.findAll().stream()
                .filter(f -> f.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());
    }

    public Optional<Financing> getFinancingById(Long id) {
        return financingRepository.findById(id);
    }

    public Optional<Financing> getFinancingByIdAndUser(Long id, User user) {
        return financingRepository.findById(id)
                .filter(f -> f.getUser().getId().equals(user.getId()));
    }

    public Financing createFinancing(Financing financing) {
        return financingRepository.save(financing);
    }

    public Financing updateFinancing(Long id, Financing financingDetails, User user) {
        return financingRepository.findById(id)
                .filter(f -> f.getUser().getId().equals(user.getId()))
                .map(financing -> {
                    financing.setName(financingDetails.getName());
                    financing.setTotalAmount(financingDetails.getTotalAmount());
                    financing.setRemainingAmount(financingDetails.getRemainingAmount());
                    financing.setMonthlyPayment(financingDetails.getMonthlyPayment());
                    financing.setType(financingDetails.getType());
                    financing.setEndDate(financingDetails.getEndDate());
                    return financingRepository.save(financing);
                }).orElse(null);
    }

    public void deleteFinancing(Long id, User user) {
        financingRepository.findById(id)
                .filter(f -> f.getUser().getId().equals(user.getId()))
                .ifPresent(financingRepository::delete);
    }
}
