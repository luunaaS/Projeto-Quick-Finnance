package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "action_logs")
public class ActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String userEmail;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(length = 500)
    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private String ipAddress;

    public ActionLog(Long userId, String userEmail, String action, String details) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.action = action;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
}
