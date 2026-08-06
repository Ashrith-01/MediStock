package com.medistock.service;

import com.medistock.entity.Notification;
import com.medistock.entity.NotificationType;
import com.medistock.entity.User;

import java.util.List;

public interface NotificationService {

    Notification createNotification(
            String title,
            String message,
            NotificationType type
    );

    List<Notification> getAllNotifications();

    List<Notification> getNotificationsForUser(User user);

    Notification getNotificationById(Long id);

    Notification markAsRead(Long id);

    void deleteNotification(Long id);
}