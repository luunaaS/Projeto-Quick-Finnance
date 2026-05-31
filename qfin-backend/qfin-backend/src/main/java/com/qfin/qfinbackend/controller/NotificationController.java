package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.Notification;
import com.qfin.qfinbackend.model.NotificationSettings;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.UserRepository;
import com.qfin.qfinbackend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationService.getNotificationsByUser(user));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationService.getUnreadNotifications(user));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = getCurrentUser();
        Map<String, Long> count = new HashMap<>();
        count.put("unreadCount", notificationService.getUnreadCount(user));
        return ResponseEntity.ok(count);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@Valid @RequestBody Notification notification) {
        User user = getCurrentUser();
        notification.setUser(user);
        Notification created = notificationService.createNotification(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        User user = getCurrentUser();
        Notification updated = notificationService.markAsRead(id, user);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User user = getCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        User user = getCurrentUser();
        notificationService.deleteNotification(id, user);
        return ResponseEntity.noContent().build();
    }

    // Settings endpoints
    @GetMapping("/settings")
    public ResponseEntity<NotificationSettings> getSettings() {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationService.getSettings(user));
    }

    @PutMapping("/settings")
    public ResponseEntity<NotificationSettings> updateSettings(@RequestBody NotificationSettings settings) {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationService.updateSettings(user, settings));
    }
}
