package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.model.UserRole;
import com.qfin.qfinbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CpfValidator cpfValidator;

    @Autowired
    private ActionLogService actionLogService;

    public User register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }
        if (user.getCpf() != null && !user.getCpf().isBlank()) {
            if (!cpfValidator.isValid(user.getCpf())) {
                throw new RuntimeException("CPF inválido");
            }
            String formattedCpf = cpfValidator.format(user.getCpf());
            if (userRepository.findByCpf(formattedCpf).isPresent()) {
                throw new RuntimeException("CPF já cadastrado");
            }
            user.setCpf(formattedCpf);
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new RuntimeException("A senha deve ter pelo menos 6 caracteres");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(UserRole.USER);
        User saved = userRepository.save(user);
        actionLogService.log(saved.getId(), saved.getEmail(), "REGISTER", "Novo usuário cadastrado");
        return saved;
    }

    public Optional<User> authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                actionLogService.log(user.getId(), user.getEmail(), "LOGIN", "Login realizado com sucesso");
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public User updateProfile(String currentEmail, String newName, String newEmail) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!currentEmail.equals(newEmail)) {
            if (userRepository.findByEmail(newEmail).isPresent()) {
                throw new RuntimeException("Email já cadastrado por outro usuário");
            }
            user.setEmail(newEmail);
        }
        user.setName(newName);
        User saved = userRepository.save(user);
        actionLogService.log(saved.getId(), saved.getEmail(), "UPDATE_PROFILE", "Perfil atualizado");
        return saved;
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Senha atual incorreta");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("A nova senha deve ter pelo menos 6 caracteres");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        actionLogService.log(user.getId(), user.getEmail(), "CHANGE_PASSWORD", "Senha alterada");
    }

    public void changeUserRole(Long targetUserId, UserRole newRole, Long adminId, String adminEmail) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        UserRole oldRole = target.getRole();
        target.setRole(newRole);
        userRepository.save(target);
        actionLogService.log(adminId, adminEmail, "CHANGE_ROLE",
                String.format("Papel do usuário %s alterado de %s para %s", target.getEmail(), oldRole, newRole));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
