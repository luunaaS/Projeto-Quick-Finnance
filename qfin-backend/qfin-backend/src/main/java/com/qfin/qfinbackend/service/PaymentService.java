package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.model.Payment;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.FinancingRepository;
import com.qfin.qfinbackend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private FinancingRepository financingRepository;

    public List<Payment> getPaymentsByFinancing(Long financingId, User user) {
        Optional<Financing> financing = financingRepository.findById(financingId);
        if (financing.isPresent() && financing.get().getUser().getId().equals(user.getId())) {
            return paymentRepository.findByFinancingId(financingId);
        }
        return List.of();
    }

    @Transactional
    public Payment addPayment(Long financingId, Payment payment, User user) {
        Optional<Financing> financingOpt = financingRepository.findById(financingId);
        
        if (financingOpt.isEmpty()) {
            throw new RuntimeException("Financing not found");
        }
        
        Financing financing = financingOpt.get();
        
        if (!financing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        // Atualizar o valor restante do financiamento
        double newRemainingAmount = financing.getRemainingAmount() - payment.getAmount();
        if (newRemainingAmount < 0) {
            newRemainingAmount = 0;
        }
        financing.setRemainingAmount(newRemainingAmount);
        financingRepository.save(financing);
        
        // Salvar o pagamento
        payment.setFinancing(financing);
        return paymentRepository.save(payment);
    }

    public void deletePayment(Long paymentId, User user) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            Financing financing = payment.getFinancing();
            
            if (financing.getUser().getId().equals(user.getId())) {
                // Reverter o valor do pagamento no financiamento
                double newRemainingAmount = financing.getRemainingAmount() + payment.getAmount();
                if (newRemainingAmount > financing.getTotalAmount()) {
                    newRemainingAmount = financing.getTotalAmount();
                }
                financing.setRemainingAmount(newRemainingAmount);
                financingRepository.save(financing);
                
                // Deletar o pagamento
                paymentRepository.delete(payment);
            }
        }
    }
}
