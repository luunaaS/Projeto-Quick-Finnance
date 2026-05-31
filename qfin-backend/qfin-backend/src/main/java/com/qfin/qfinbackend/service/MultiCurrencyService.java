package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.ExchangeRate;
import com.qfin.qfinbackend.model.MultiCurrencyTransaction;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.ExchangeRateRepository;
import com.qfin.qfinbackend.repository.MultiCurrencyTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MultiCurrencyService {

    @Autowired
    private MultiCurrencyTransactionRepository transactionRepository;

    @Autowired
    private ExchangeRateRepository exchangeRateRepository;

    @Autowired
    private RestTemplate restTemplate;

    @PostConstruct
    public void initDefaultRates() {
        // Initialize default exchange rates as BRL per 1 unit of each currency
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
        return transactionRepository.findByUserOrderByDateDesc(user);
    }

    public Optional<MultiCurrencyTransaction> getTransactionByIdAndUser(Long id, User user) {
        return transactionRepository.findByIdAndUser(id, user);
    }

    public MultiCurrencyTransaction createTransaction(MultiCurrencyTransaction transaction) {
        // Calculate amount in base currency if not provided
        if (transaction.getAmountInBaseCurrency() == null || transaction.getExchangeRate() == null) {
            Double rate = getExchangeRateValue(transaction.getCurrency(), "BRL");
            transaction.setExchangeRate(rate);
            transaction.setAmountInBaseCurrency(transaction.getAmount() * rate);
        }
        return transactionRepository.save(transaction);
    }

    public MultiCurrencyTransaction updateTransaction(Long id, MultiCurrencyTransaction details, User user) {
        return transactionRepository.findByIdAndUser(id, user)
                .map(transaction -> {
                    transaction.setType(details.getType());
                    transaction.setAmount(details.getAmount());
                    transaction.setCurrency(details.getCurrency());
                    transaction.setCategory(details.getCategory());
                    transaction.setDescription(details.getDescription());
                    transaction.setDate(details.getDate());
                    // Recalculate conversion
                    Double rate = getExchangeRateValue(details.getCurrency(), "BRL");
                    transaction.setExchangeRate(rate);
                    transaction.setAmountInBaseCurrency(details.getAmount() * rate);
                    return transactionRepository.save(transaction);
                }).orElse(null);
    }

    public void deleteTransaction(Long id, User user) {
        transactionRepository.findByIdAndUser(id, user)
                .ifPresent(transactionRepository::delete);
    }

    public List<ExchangeRate> getAllExchangeRates() {
        return exchangeRateRepository.findAll();
    }

    public void refreshRatesFromLiveApi() {
        try {
            // BRL as base, quotes for supported currencies
            String url = "https://api.exchangerate.host/latest?base=BRL&symbols=USD,EUR,GBP,JPY,CAD,AUD,CHF,BRL";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getBody() == null) return;
            Object ratesObj = response.getBody().get("rates");
            if (!(ratesObj instanceof Map<?, ?> ratesMap)) return;

            // API gives: 1 BRL = X currency. We store BRL per 1 currency => 1 / X
            updateRateFromLive("USD", ratesMap);
            updateRateFromLive("EUR", ratesMap);
            updateRateFromLive("GBP", ratesMap);
            updateRateFromLive("JPY", ratesMap);
            updateRateFromLive("CAD", ratesMap);
            updateRateFromLive("AUD", ratesMap);
            updateRateFromLive("CHF", ratesMap);
            updateExchangeRate("BRL", 1.0);
        } catch (Exception ignored) {
            // Keep local/default rates as fallback
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

        Optional<ExchangeRate> fromRate = exchangeRateRepository.findByCurrency(from);
        Optional<ExchangeRate> toRate = exchangeRateRepository.findByCurrency(to);

        // Stored rates are BRL per 1 unit of currency
        if (from.equals("BRL")) {
            // BRL -> target
            return toRate.map(r -> 1.0 / r.getRate()).orElse(1.0);
        }
        if (to.equals("BRL")) {
            // source -> BRL
            return fromRate.map(ExchangeRate::getRate).orElse(1.0);
        }

        // Cross conversion: (from -> BRL) then (BRL -> to)
        double fromToBrl = fromRate.map(ExchangeRate::getRate).orElse(1.0);
        double brlToTo = toRate.map(r -> 1.0 / r.getRate()).orElse(1.0);
        return fromToBrl * brlToTo;
    }

    public ExchangeRate updateExchangeRate(String currency, Double rate) {
        ExchangeRate exchangeRate = exchangeRateRepository.findByCurrency(currency)
                .orElse(new ExchangeRate());
        exchangeRate.setCurrency(currency);
        exchangeRate.setRate(rate);
        exchangeRate.setLastUpdated(LocalDateTime.now());
        return exchangeRateRepository.save(exchangeRate);
    }
}
