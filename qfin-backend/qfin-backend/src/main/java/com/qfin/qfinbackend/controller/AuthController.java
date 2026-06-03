package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.service.CategoryService;
import com.qfin.qfinbackend.service.JwtUtil;
import com.qfin.qfinbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());

            User savedUser = userService.register(user);
            
            // Initialize default categories for the new user
            categoryService.initializeDefaultCategories(savedUser.getId());
            
            String token = jwtUtil.generateToken(savedUser.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of("id", savedUser.getId(), "name", savedUser.getName(), "email", savedUser.getEmail()));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.authenticate(request.getEmail(), request.getPassword());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = jwtUtil.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail()));

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            return ResponseEntity.ok(buildUserProfileResponse(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer "
            String email = jwtUtil.extractUsername(token);

            User updatedUser = userService.updateProfile(email, request.getName(), request.getEmail());

            if (request.getPhone() != null) {
                updatedUser.setPhone(request.getPhone());
            }
            if (request.getBio() != null) {
                updatedUser.setBio(request.getBio());
            }
            if (request.getBirthDate() != null && !request.getBirthDate().isBlank()) {
                updatedUser.setBirthDate(LocalDate.parse(request.getBirthDate()));
            }

            updatedUser = userService.save(updatedUser);

            // Se o email mudou, gerar novo token
            String newToken = token;
            if (!email.equals(request.getEmail())) {
                newToken = jwtUtil.generateToken(updatedUser.getEmail());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("token", newToken);
            response.put("user", buildUserProfileResponse(updatedUser));

            return ResponseEntity.ok(response);
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
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (request.getName() != null) user.setName(request.getName());
            if (request.getEmail() != null) user.setEmail(request.getEmail());
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getBio() != null) user.setBio(request.getBio());

            if (request.getBirthDate() != null) {
                if (request.getBirthDate().isBlank()) {
                    user.setBirthDate(null);
                } else {
                    user.setBirthDate(LocalDate.parse(request.getBirthDate()));
                }
            }

            User updated = userService.save(user);

            String newToken = token;
            if (request.getEmail() != null && !email.equals(request.getEmail())) {
                newToken = jwtUtil.generateToken(updated.getEmail());
            }

            return ResponseEntity.ok(Map.of(
                    "token", newToken,
                    "user", buildUserProfileResponse(updated)
            ));
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
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            user.setProfileImageBase64(request.getProfileImageBase64());
            User updated = userService.save(user);

            return ResponseEntity.ok(Map.of("user", buildUserProfileResponse(updated)));
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
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            user.setProfileImageBase64(null);
            User updated = userService.save(user);

            return ResponseEntity.ok(Map.of("user", buildUserProfileResponse(updated)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer "
            String email = jwtUtil.extractUsername(token);
            
            userService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
            
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;

        // getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        // getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class UpdateProfileRequest {
        private String name;
        private String email;
        private String phone;
        private String bio;
        private String birthDate;

        // getters and setters
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

    private Map<String, Object> buildUserProfileResponse(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("phone", user.getPhone());
        userMap.put("bio", user.getBio());
        userMap.put("birthDate", user.getBirthDate() != null ? user.getBirthDate().toString() : null);
        userMap.put("profileImageBase64", user.getProfileImageBase64());
        return userMap;
    }

    public static class UpdateProfileDetailsRequest {
        private String name;
        private String email;
        private String phone;
        private String bio;
        private String birthDate;

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
        private String currentPassword;
        private String newPassword;

        // getters and setters
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
