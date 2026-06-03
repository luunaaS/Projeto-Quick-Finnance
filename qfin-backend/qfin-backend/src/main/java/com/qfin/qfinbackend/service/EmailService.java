package com.qfin.qfinbackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@qfin.local}")
    private String from;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    /**
     * Envia o email de recuperação de senha com o link contendo o token.
     * Retorna true se o email foi efetivamente enviado via SMTP, false caso
     * o envio não tenha sido possível (modo desenvolvimento, sem SMTP).
     */
    public boolean sendPasswordResetEmail(String to, String resetLink) {
        String subject = "QFin - Recuperação de senha";
        String body = "Olá,\n\n" +
                "Recebemos uma solicitação para redefinir a senha da sua conta QFin.\n\n" +
                "Clique no link abaixo para criar uma nova senha (válido por 1 hora):\n\n" +
                resetLink + "\n\n" +
                "Se você não solicitou a recuperação de senha, ignore este email com segurança.\n\n" +
                "Atenciosamente,\nEquipe QFin";

        boolean smtpConfigured = mailSender != null && smtpUsername != null && !smtpUsername.isBlank();

        if (!smtpConfigured) {
            // Modo desenvolvimento: registra o link no log em vez de enviar email.
            log.warn("[DEV] SMTP não configurado. Link de recuperação para {}: {}", to, resetLink);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email de recuperação de senha enviado para {}", to);
            return true;
        } catch (Exception e) {
            log.error("Falha ao enviar email de recuperação para {}: {}", to, e.getMessage());
            return false;
        }
    }
}
