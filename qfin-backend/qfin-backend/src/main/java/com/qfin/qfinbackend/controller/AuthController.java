package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.service.ActionLogService;
import com.qfin.qfinbackend.service.CategoryService;
import com.qfin.qfinbackend.service.JwtUtil;
import com.qfin.qfinbackend.service.PasswordResetService;
import com.qfin.qfinbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private ActionLogService actionLogService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (request.getName() == null || request.getName().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nome é obrigatório"));
            }
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email é obrigatório"));
            }
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Senha é obrigatória"));
            }

            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setCpf(request.getCpf());

            User savedUser = userService.register(user);
            categoryService.initializeDefaultCategories(savedUser.getId());

            String token = jwtUtil.generateToken(savedUser.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", buildUserProfileResponse(savedUser));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            if (request.getEmail() == null || request.getPassword() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email e senha são obrigatórios"));
            }
            Optional<User> userOpt = userService.authenticate(request.getEmail(), request.getPassword());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String token = jwtUtil.generateToken(user.getEmail());
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", buildUserProfileResponse(user));
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Email ou senha inválidos"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email é obrigatório"));
            }
            String token = passwordResetService.generateResetToken(request.getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Se o email estiver cadastrado, você receberá um link de recuperação no seu email.");
            // Em modo de desenvolvimento (sem SMTP), o token é devolvido para testes locais.
            if (token != null) {
                response.put("resetToken", token);
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Mensagem genérica para evitar enumeração de emails
            return ResponseEntity.ok(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            if (request.getToken() == null || request.getToken().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token é obrigatório"));
            }
            if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nova senha é obrigatória"));
            }
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso. Faça login com a nova senha."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuário não encontrado"));
            }
            return ResponseEntity.ok(buildUserProfileResponse(userOpt.get()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-logs")
    public ResponseEntity<?> getMyLogs(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            return ResponseEntity.ok(actionLogService.getLogsByUser(user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            User updatedUser = userService.updateProfile(email, request.getName(), request.getEmail());

            if (request.getPhone() != null) updatedUser.setPhone(request.getPhone());
            if (request.getBio() != null) updatedUser.setBio(request.getBio());
            if (request.getBirthDate() != null && !request.getBirthDate().isBlank()) {
                updatedUser.setBirthDate(LocalDate.parse(request.getBirthDate()));
            }
            updatedUser = userService.save(updatedUser);

            String newToken = token;
            if (!email.equals(request.getEmail())) {
                newToken = jwtUtil.generateToken(updatedUser.getEmail());
            }

            return ResponseEntity.ok(Map.of("token", newToken, "user", buildUserProfileResponse(updatedUser)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile/details")
    public ResponseEntity<?> updateProfileDetails(@RequestBody UpdateProfileDetailsRequest request, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuário não encontrado"));
            }

            User user = userOpt.get();
            if (request.getName() != null) user.setName(request.getName());
            if (request.getEmail() != null) user.setEmail(request.getEmail());
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getBio() != null) user.setBio(request.getBio());
            if (request.getBirthDate() != null) {
                user.setBirthDate(request.getBirthDate().isBlank() ? null : LocalDate.parse(request.getBirthDate()));
            }

            User updated = userService.save(user);
            String newToken = token;
            if (request.getEmail() != null && !email.equals(request.getEmail())) {
                newToken = jwtUtil.generateToken(updated.getEmail());
            }

            return ResponseEntity.ok(Map.of("token", newToken, "user", buildUserProfileResponse(updated)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile/photo")
    public ResponseEntity<?> updateProfilePhoto(@RequestBody UpdateProfilePhotoRequest request, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuário não encontrado"));
            }
            User user = userOpt.get();
            user.setProfileImageBase64(request.getProfileImageBase64());
            return ResponseEntity.ok(Map.of("user", buildUserProfileResponse(userService.save(user))));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/profile/photo")
    public ResponseEntity<?> deleteProfilePhoto(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuário não encontrado"));
            }
            User user = userOpt.get();
            user.setProfileImageBase64(null);
            return ResponseEntity.ok(Map.of("user", buildUserProfileResponse(userService.save(user))));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            userService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> buildUserProfileResponse(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("cpf", user.getCpf());
        userMap.put("phone", user.getPhone());
        userMap.put("bio", user.getBio());
        userMap.put("role", user.getRole() != null ? user.getRole().name() : "USER");
        userMap.put("birthDate", user.getBirthDate() != null ? user.getBirthDate().toString() : null);
        userMap.put("profileImageBase64", user.getProfileImageBase64());
        return userMap;
    }

    // DTO inner classes
    public static class RegisterRequest {
        private String name, email, password, cpf;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getCpf() { return cpf; }
        public void setCpf(String cpf) { this.cpf = cpf; }
    }

    public static class LoginRequest {
        private String email, password;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ForgotPasswordRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ResetPasswordRequest {
        private String token, newPassword;
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class UpdateProfileRequest {
        private String name, email, phone, bio, birthDate;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public String getBirthDate() { return birthDate; }
        public void setBirthDate(String birthDate) { this.birthDate = birthDate; }
    }

    public static class UpdateProfileDetailsRequest {
        private String name, email, phone, bio, birthDate;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public String getBirthDate() { return birthDate; }
        public void setBirthDate(String birthDate) { this.birthDate = birthDate; }
    }

    public static class UpdateProfilePhotoRequest {
        private String profileImageBase64;
        public String getProfileImageBase64() { return profileImageBase64; }
        public void setProfileImageBase64(String profileImageBase64) { this.profileImageBase64 = profileImageBase64; }
    }

    public static class ChangePasswordRequest {
        private String currentPassword, newPassword;
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
