package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.Notification;
import com.qfin.qfinbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByDateDesc(User user);
    List<Notification> findByUserAndIsReadFalseOrderByDateDesc(User user);
    Optional<Notification> findByIdAndUser(Long id, User user);
    long countByUserAndIsReadFalse(User user);
}
