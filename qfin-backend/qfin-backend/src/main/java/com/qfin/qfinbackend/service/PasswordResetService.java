package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.PasswordResetToken;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.PasswordResetTokenRepository;
import com.qfin.qfinbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ActionLogService actionLogService;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.mail.dev-mode:true}")
    private boolean devMode;

    /**
     * Gera um token de recuperação, envia o link por email e retorna o token
     * apenas quando o email não pôde ser enviado e o modo dev está ativo
     * (para facilitar testes locais). Em produção retorna null.
     */
    @Transactional
    public String generateResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Mensagem genérica para evitar enumeração de emails
            throw new RuntimeException("Se o email estiver cadastrado, você receberá as instruções de recuperação.");
        }
        // Remove tokens antigos para este email
        tokenRepository.deleteByEmail(email);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, email);
        tokenRepository.save(resetToken);

        User user = userOpt.get();
        actionLogService.log(user.getId(), user.getEmail(), "FORGOT_PASSWORD", "Token de recuperação gerado");

        // Monta o link de recuperação que aponta para o frontend
        String resetLink = frontendUrl + "/?resetToken=" +
                URLEncoder.encode(token, StandardCharsets.UTF_8);

        boolean sent = emailService.sendPasswordResetEmail(email, resetLink);

        // Em modo dev (sem SMTP), devolve o token para facilitar testes locais
        if (!sent && devMode) {
            return token;
        }
        return null;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido ou expirado"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Este token já foi utilizado");
        }
        if (resetToken.isExpired()) {
            throw new RuntimeException("Token expirado. Solicite um novo link de recuperação");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("A senha deve ter pelo menos 6 caracteres");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        actionLogService.log(user.getId(), user.getEmail(), "RESET_PASSWORD", "Senha redefinida via token");
    }
}
