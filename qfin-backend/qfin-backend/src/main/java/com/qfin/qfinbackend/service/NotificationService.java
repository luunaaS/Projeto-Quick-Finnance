package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Notification;
import com.qfin.qfinbackend.model.NotificationSettings;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.NotificationRepository;
import com.qfin.qfinbackend.repository.NotificationSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationSettingsRepository settingsRepository;

    public List<Notification> getNotificationsByUser(User user) {
        return notificationRepository.findByUserOrderByDateDesc(user);
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByDateDesc(user);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long id, User user) {
        return notificationRepository.findByIdAndUser(id, user)
                .map(notification -> {
                    notification.setIsRead(true);
                    return notificationRepository.save(notification);
                }).orElse(null);
    }

    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalseOrderByDateDesc(user);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(Long id, User user) {
        notificationRepository.findByIdAndUser(id, user)
                .ifPresent(notificationRepository::delete);
    }

    // Settings
    public NotificationSettings getSettings(User user) {
        return settingsRepository.findByUser(user)
                .orElseGet(() -> {
                    NotificationSettings settings = new NotificationSettings();
                    settings.setUser(user);
                    return settingsRepository.save(settings);
                });
    }

    public NotificationSettings updateSettings(User user, NotificationSettings newSettings) {
        NotificationSettings settings = getSettings(user);
        settings.setBillReminders(newSettings.getBillReminders());
        settings.setBudgetAlerts(newSettings.getBudgetAlerts());
        settings.setGoalUpdates(newSettings.getGoalUpdates());
        settings.setSuspiciousActivity(newSettings.getSuspiciousActivity());
        settings.setEmailNotifications(newSettings.getEmailNotifications());
        settings.setPushNotifications(newSettings.getPushNotifications());
        settings.setInAppNotifications(newSettings.getInAppNotifications());
        settings.setReminderDays(newSettings.getReminderDays());
        return settingsRepository.save(settings);
    }
}
