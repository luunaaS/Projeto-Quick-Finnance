package com.qfin.qfinbackend.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.qfin.qfinbackend.model.Financing;
import com.qfin.qfinbackend.model.Goal;
import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.FinancingRepository;
import com.qfin.qfinbackend.repository.GoalRepository;
import com.qfin.qfinbackend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private FinancingRepository financingRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserService userService;

    public byte[] generateTransactionReport(String username, LocalDate startDate, LocalDate endDate) {
        User user = new User();
        user.setEmail(username); // Assuming username is email

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(user, startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        document.add(new Paragraph("Relatório de Transações")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18));

        document.add(new Paragraph("Período: " + startDate + " a " + endDate));
        document.add(new Paragraph("Usuário: " + username));
        document.add(new Paragraph("\n"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 3, 2, 2, 3}));
        table.addHeaderCell("Data");
        table.addHeaderCell("Descrição");
        table.addHeaderCell("Categoria");
        table.addHeaderCell("Tipo");
        table.addHeaderCell("Valor");

        for (Transaction t : transactions) {
            table.addCell(t.getDate().toString());
            table.addCell(t.getDescription());
            table.addCell(t.getCategory());
            table.addCell(t.getType().toString());
            table.addCell(String.format("R$ %.2f", t.getAmount()));
        }

        document.add(table);
        document.close();

        return baos.toByteArray();
    }

    public byte[] generateFinancingReport(String username, LocalDate startDate, LocalDate endDate) {
        User user = new User();
        user.setEmail(username);

        List<Financing> financings = financingRepository.findByUserAndStartDateBetween(user, startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        document.add(new Paragraph("Relatório de Financiamentos")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18));

        document.add(new Paragraph("Período: " + startDate + " a " + endDate));
        document.add(new Paragraph("Usuário: " + username));
        document.add(new Paragraph("\n"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2, 2, 2, 2}));
        table.addHeaderCell("Nome");
        table.addHeaderCell("Valor Total");
        table.addHeaderCell("Valor Restante");
        table.addHeaderCell("Pagamento Mensal");
        table.addHeaderCell("Tipo");

        for (Financing f : financings) {
            table.addCell(f.getName());
            table.addCell(String.format("R$ %.2f", f.getTotalAmount()));
            table.addCell(String.format("R$ %.2f", f.getRemainingAmount()));
            table.addCell(String.format("R$ %.2f", f.getMonthlyPayment()));
            table.addCell(f.getType().toString());
        }

        document.add(table);
        document.close();

        return baos.toByteArray();
    }

    public byte[] generateGoalReport(String username, LocalDate startDate, LocalDate endDate) {
        User user = new User();
        user.setEmail(username);

        List<Goal> goals = goalRepository.findByUserAndTargetDateBetween(user, startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        document.add(new Paragraph("Relatório de Metas")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18));

        document.add(new Paragraph("Período: " + startDate + " a " + endDate));
        document.add(new Paragraph("Usuário: " + username));
        document.add(new Paragraph("\n"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2, 2, 2, 2}));
        table.addHeaderCell("Nome");
        table.addHeaderCell("Valor Alvo");
        table.addHeaderCell("Valor Atual");
        table.addHeaderCell("Progresso (%)");
        table.addHeaderCell("Data Alvo");

        for (Goal g : goals) {
            double progress = g.getTargetAmount() > 0 ? (g.getCurrentAmount() / g.getTargetAmount()) * 100 : 0;
            table.addCell(g.getName());
            table.addCell(String.format("R$ %.2f", g.getTargetAmount()));
            table.addCell(String.format("R$ %.2f", g.getCurrentAmount()));
            table.addCell(String.format("%.1f%%", progress));
            table.addCell(g.getTargetDate().toString());
        }

        document.add(table);
        document.close();

        return baos.toByteArray();
    }

    public byte[] generateSummaryReport(String username, LocalDate startDate, LocalDate endDate) {
        User user = new User();
        user.setEmail(username);

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(user, startDate, endDate);
        List<Financing> financings = financingRepository.findByUserAndStartDateBetween(user, startDate, endDate);
        List<Goal> goals = goalRepository.findByUserAndTargetDateBetween(user, startDate, endDate);

        double totalIncome = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalExpense = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalFinancing = financings.stream()
                .mapToDouble(Financing::getTotalAmount)
                .sum();

        double totalGoals = goals.stream()
                .mapToDouble(Goal::getTargetAmount)
                .sum();

        double currentGoals = goals.stream()
                .mapToDouble(Goal::getCurrentAmount)
                .sum();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        document.add(new Paragraph("Resumo Financeiro")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18));

        document.add(new Paragraph("Período: " + startDate + " a " + endDate));
        document.add(new Paragraph("Usuário: " + username));
        document.add(new Paragraph("\n"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2}));
        table.addHeaderCell("Descrição");
        table.addHeaderCell("Valor");

        table.addCell("Total de Receitas");
        table.addCell(String.format("R$ %.2f", totalIncome));

        table.addCell("Total de Despesas");
        table.addCell(String.format("R$ %.2f", totalExpense));

        table.addCell("Saldo");
        table.addCell(String.format("R$ %.2f", totalIncome - totalExpense));

        table.addCell("Total de Financiamentos");
        table.addCell(String.format("R$ %.2f", totalFinancing));

        table.addCell("Total de Metas");
        table.addCell(String.format("R$ %.2f", totalGoals));

        table.addCell("Progresso Atual das Metas");
        table.addCell(String.format("R$ %.2f", currentGoals));

        document.add(table);
        document.close();

        return baos.toByteArray();
    }
}
