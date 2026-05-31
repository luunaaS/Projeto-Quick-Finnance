package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Entity
@Data
@Table(name = "notification_settings")
public class NotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean billReminders = true;
    private Boolean budgetAlerts = true;
    private Boolean goalUpdates = true;
    private Boolean suspiciousActivity = true;
    private Boolean emailNotifications = true;
    private Boolean pushNotifications = false;
    private Boolean inAppNotifications = true;
    private Integer reminderDays = 3;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
}
