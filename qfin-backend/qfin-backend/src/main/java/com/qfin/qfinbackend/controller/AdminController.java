package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.ActionLog;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.model.UserRole;
import com.qfin.qfinbackend.service.ActionLogService;
import com.qfin.qfinbackend.service.JwtUtil;
import com.qfin.qfinbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ActionLogService actionLogService;

    @Autowired
    private JwtUtil jwtUtil;

    private User getRequestingUser(String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    private void requireRole(User user, UserRole... roles) {
        for (UserRole role : roles) {
            if (user.getRole() == role) return;
        }
        throw new RuntimeException("Acesso negado. Permissão insuficiente.");
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            User requester = getRequestingUser(authHeader);
            requireRole(requester, UserRole.ADMIN, UserRole.OPERATOR);
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users.stream().map(u -> Map.of(
                    "id", u.getId(),
                    "name", u.getName(),
                    "email", u.getEmail(),
                    "cpf", u.getCpf() != null ? u.getCpf() : "",
                    "role", u.getRole().name(),
                    "phone", u.getPhone() != null ? u.getPhone() : ""
            )).toList());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User requester = getRequestingUser(authHeader);
            requireRole(requester, UserRole.ADMIN);

            String roleStr = body.get("role");
            UserRole newRole;
            try {
                newRole = UserRole.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Papel inválido. Use: ADMIN, OPERATOR ou USER"));
            }

            userService.changeUserRole(id, newRole, requester.getId(), requester.getEmail());
            return ResponseEntity.ok(Map.of("message", "Papel do usuário atualizado com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User requester = getRequestingUser(authHeader);
            requireRole(requester, UserRole.ADMIN, UserRole.OPERATOR);
            List<ActionLog> logs = actionLogService.getAllLogs(page, size);
            return ResponseEntity.ok(logs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<?> getUserLogs(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User requester = getRequestingUser(authHeader);
            requireRole(requester, UserRole.ADMIN, UserRole.OPERATOR);
            List<ActionLog> logs = actionLogService.getLogsByUser(userId);
            return ResponseEntity.ok(logs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
