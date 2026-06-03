package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @NotBlank(message = "Title cannot be empty")
    private String title;

    @NotBlank(message = "Description cannot be empty")
    @Column(length = 1000)
    private String description;

    @NotNull(message = "Date cannot be null")
    private LocalDateTime date;

    @NotNull
    private Boolean isRead = false;

    @NotNull(message = "Priority cannot be null")
    @Enumerated(EnumType.STRING)
    private NotificationPriority priority;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public enum NotificationType {
        BILL,
        BUDGET,
        GOAL,
        SUSPICIOUS
    }

    public enum NotificationPriority {
        HIGH,
        MEDIUM,
        LOW
    }
}
