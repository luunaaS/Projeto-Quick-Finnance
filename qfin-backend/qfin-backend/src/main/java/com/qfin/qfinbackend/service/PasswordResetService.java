package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.PasswordResetToken;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.PasswordResetTokenRepository;
import com.qfin.qfinbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public String generateResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Return generic message to avoid email enumeration
            throw new RuntimeException("Se o email estiver cadastrado, você receberá as instruções de recuperação.");
        }
        // Remove old tokens for this email
        tokenRepository.deleteByEmail(email);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, email);
        tokenRepository.save(resetToken);

        User user = userOpt.get();
        actionLogService.log(user.getId(), user.getEmail(), "FORGOT_PASSWORD", "Token de recuperação gerado");

        // In production, send token via email. Here we return it directly.
        return token;
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
