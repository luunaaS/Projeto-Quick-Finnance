package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Investment;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.InvestmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InvestmentService {

    @Autowired
    private InvestmentRepository investmentRepository;

    public List<Investment> getInvestmentsByUser(User user) {
        return investmentRepository.findByUserOrderByPurchaseDateDesc(user);
    }

    public Optional<Investment> getInvestmentByIdAndUser(Long id, User user) {
        return investmentRepository.findByIdAndUser(id, user);
    }

    public Investment createInvestment(Investment investment) {
        return investmentRepository.save(investment);
    }

    public Investment updateInvestment(Long id, Investment investmentDetails, User user) {
        return investmentRepository.findByIdAndUser(id, user)
                .map(investment -> {
                    investment.setName(investmentDetails.getName());
                    investment.setType(investmentDetails.getType());
                    investment.setAmount(investmentDetails.getAmount());
                    investment.setCurrentValue(investmentDetails.getCurrentValue());
                    investment.setPurchaseDate(investmentDetails.getPurchaseDate());
                    investment.setQuantity(investmentDetails.getQuantity());
                    investment.setAveragePrice(investmentDetails.getAveragePrice());
                    return investmentRepository.save(investment);
                }).orElse(null);
    }

    public void deleteInvestment(Long id, User user) {
        investmentRepository.findByIdAndUser(id, user)
                .ifPresent(investmentRepository::delete);
    }

    public List<Investment> getInvestmentsByType(User user, Investment.InvestmentType type) {
        return investmentRepository.findByUserAndType(user, type);
    }
}
