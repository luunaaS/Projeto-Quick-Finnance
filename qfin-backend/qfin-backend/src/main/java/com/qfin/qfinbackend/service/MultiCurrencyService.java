package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.ExchangeRate;
import com.qfin.qfinbackend.model.MultiCurrencyTransaction;
import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.ExchangeRateRepository;
import com.qfin.qfinbackend.repository.MultiCurrencyTransactionRepository;
import com.qfin.qfinbackend.repository.TransactionRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MultiCurrencyService {

    @Autowired
    private MultiCurrencyTransactionRepository multiCurrencyTransactionRepository;

    @Autowired
    private ExchangeRateRepository exchangeRateRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private RestTemplate restTemplate;

    @PostConstruct
    public void initDefaultRates() {
        createRateIfNotExists("USD", 5.20);
        createRateIfNotExists("EUR", 5.60);
        createRateIfNotExists("GBP", 6.50);
        createRateIfNotExists("JPY", 0.035);
        createRateIfNotExists("CAD", 3.80);
        createRateIfNotExists("AUD", 3.40);
        createRateIfNotExists("CHF", 5.80);
        createRateIfNotExists("BRL", 1.00);

        refreshRatesFromLiveApi();
    }

    private void createRateIfNotExists(String currency, Double rate) {
        if (exchangeRateRepository.findByCurrency(currency).isEmpty()) {
            ExchangeRate exchangeRate = new ExchangeRate();
            exchangeRate.setCurrency(currency);
            exchangeRate.setRate(rate);
            exchangeRate.setLastUpdated(LocalDateTime.now());
            exchangeRateRepository.save(exchangeRate);
        }
    }

    public List<MultiCurrencyTransaction> getTransactionsByUser(User user) {
        return multiCurrencyTransactionRepository.findByUserOrderByDateDesc(user);
    }

    public Optional<MultiCurrencyTransaction> getTransactionByIdAndUser(Long id, User user) {
        return multiCurrencyTransactionRepository.findByIdAndUser(id, user);
    }

    public MultiCurrencyTransaction createTransaction(MultiCurrencyTransaction transaction) {
        if (transaction.getAmountInBaseCurrency() == null || transaction.getExchangeRate() == null) {
            Double rate = getExchangeRateValue(transaction.getCurrency(), "BRL");
            transaction.setExchangeRate(rate);
            transaction.setAmountInBaseCurrency(transaction.getAmount() * rate);
        }
        MultiCurrencyTransaction saved = multiCurrencyTransactionRepository.save(transaction);
        upsertMirrorTransaction(saved);
        return saved;
    }

    public MultiCurrencyTransaction updateTransaction(Long id, MultiCurrencyTransaction details, User user) {
        return multiCurrencyTransactionRepository.findByIdAndUser(id, user)
                .map(transaction -> {
                    transaction.setType(details.getType());
                    transaction.setAmount(details.getAmount());
                    transaction.setCurrency(details.getCurrency());
                    transaction.setCategory(details.getCategory());
                    transaction.setDescription(details.getDescription());
                    transaction.setDate(details.getDate());
                    Double rate = getExchangeRateValue(details.getCurrency(), "BRL");
                    transaction.setExchangeRate(rate);
                    transaction.setAmountInBaseCurrency(details.getAmount() * rate);
                    MultiCurrencyTransaction saved = multiCurrencyTransactionRepository.save(transaction);
                    upsertMirrorTransaction(saved);
                    return saved;
                }).orElse(null);
    }

    public void deleteTransaction(Long id, User user) {
        multiCurrencyTransactionRepository.findByIdAndUser(id, user)
                .ifPresent(transaction -> {
                    deleteMirrorTransaction(transaction);
                    multiCurrencyTransactionRepository.delete(transaction);
                });
    }

    public List<ExchangeRate> getAllExchangeRates() {
        return exchangeRateRepository.findAll();
    }

    public void refreshRatesFromLiveApi() {
        try {
            String url = "https://api.exchangerate.host/latest?base=BRL&symbols=USD,EUR,GBP,JPY,CAD,AUD,CHF,BRL";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getBody() == null) return;
            Object ratesObj = response.getBody().get("rates");
            if (!(ratesObj instanceof Map<?, ?> ratesMap)) return;

            updateRateFromLive("USD", ratesMap);
            updateRateFromLive("EUR", ratesMap);
            updateRateFromLive("GBP", ratesMap);
            updateRateFromLive("JPY", ratesMap);
            updateRateFromLive("CAD", ratesMap);
            updateRateFromLive("AUD", ratesMap);
            updateRateFromLive("CHF", ratesMap);
            updateExchangeRate("BRL", 1.0);
        } catch (Exception ignored) {
        }
    }

    private void updateRateFromLive(String currency, Map<?, ?> ratesMap) {
        Object value = ratesMap.get(currency);
        if (value instanceof Number n && n.doubleValue() > 0) {
            double brlPerCurrency = 1.0 / n.doubleValue();
            updateExchangeRate(currency, brlPerCurrency);
        }
    }

    public Double getExchangeRateValue(String from, String to) {
        if (from.equals(to)) return 1.0;

        Optional<ExchangeRate> fromRateOpt = exchangeRateRepository.findByCurrency(from);
        Optional<ExchangeRate> toRateOpt = exchangeRateRepository.findByCurrency(to);

        double fromRate = normalizeRate(from, fromRateOpt.map(ExchangeRate::getRate).orElse(1.0));
        double toRate = normalizeRate(to, toRateOpt.map(ExchangeRate::getRate).orElse(1.0));

        if (from.equals("BRL")) {
            return 1.0 / toRate;
        }
        if (to.equals("BRL")) {
            return fromRate;
        }

        return fromRate * (1.0 / toRate);
    }

    private double normalizeRate(String currency, double rate) {
        if (rate <= 0) return 1.0;
        if ("BRL".equals(currency)) return 1.0;
        if (!"JPY".equals(currency) && rate < 1.0) {
            return 1.0 / rate;
        }
        return rate;
    }

    public ExchangeRate updateExchangeRate(String currency, Double rate) {
        ExchangeRate exchangeRate = exchangeRateRepository.findByCurrency(currency)
                .orElse(new ExchangeRate());
        exchangeRate.setCurrency(currency);
        exchangeRate.setRate(rate);
        exchangeRate.setLastUpdated(LocalDateTime.now());
        return exchangeRateRepository.save(exchangeRate);
    }

    private String mirrorDescription(MultiCurrencyTransaction tx) {
        return "[MC:" + tx.getId() + "] " + (tx.getDescription() == null ? "" : tx.getDescription());
    }

    private void upsertMirrorTransaction(MultiCurrencyTransaction tx) {
        if (tx.getId() == null || tx.getUser() == null) return;
        String marker = "[MC:" + tx.getId() + "]";
        List<Transaction> existing = transactionRepository.findAll().stream()
                .filter(t -> t.getUser() != null
                        && t.getUser().getId() != null
                        && tx.getUser().getId().equals(t.getUser().getId())
                        && t.getDescription() != null
                        && t.getDescription().startsWith(marker))
                .toList();

        Transaction mirror = existing.isEmpty() ? new Transaction() : existing.get(0);
        mirror.setUser(tx.getUser());
        mirror.setType(tx.getType() == MultiCurrencyTransaction.TransactionType.INCOME
                ? Transaction.TransactionType.INCOME
                : Transaction.TransactionType.EXPENSE);
        mirror.setAmount(tx.getAmountInBaseCurrency() != null ? tx.getAmountInBaseCurrency() : 0.0);
        mirror.setCategory(tx.getCategory() != null ? tx.getCategory() : "MULTI_CURRENCY");
        mirror.setDescription(mirrorDescription(tx));
        mirror.setDate(tx.getDate());
        transactionRepository.save(mirror);
    }

    private void deleteMirrorTransaction(MultiCurrencyTransaction tx) {
        if (tx.getId() == null || tx.getUser() == null) return;
        String marker = "[MC:" + tx.getId() + "]";
        transactionRepository.findAll().stream()
                .filter(t -> t.getUser() != null
                        && t.getUser().getId() != null
                        && tx.getUser().getId().equals(t.getUser().getId())
                        && t.getDescription() != null
                        && t.getDescription().startsWith(marker))
                .forEach(transactionRepository::delete);
    }
}
