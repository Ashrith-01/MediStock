package com.medistock.repository;

import com.medistock.entity.Notification;
import com.medistock.entity.NotificationType;
import com.medistock.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser(User user);

    List<Notification> findByUserAndIsReadFalse(User user);

    List<Notification> findByType(NotificationType type);

    List<Notification> findByTypeIn(Collection<NotificationType> types);

    List<Notification> findByTypeInOrUser(Collection<NotificationType> types, User user);

    List<Notification> findTop10ByUserOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);
    
    boolean existsByUserIdAndMessage(Long userId, String message);
    boolean existsByTitleAndMessage(String title, String message);
}