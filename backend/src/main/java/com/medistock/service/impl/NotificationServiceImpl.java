package com.medistock.service.impl;

import com.medistock.entity.Notification;
import com.medistock.entity.NotificationType;
import com.medistock.entity.User;
import com.medistock.repository.NotificationRepository;
import com.medistock.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public Notification createNotification(
            String title,
            String message,
            NotificationType type
    ) {
        boolean exists = notificationRepository.existsByTitleAndMessage(title, message);

        if (exists) {
            return null;
        }

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);

        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    @Override
    public List<Notification> getNotificationsForUser(User user) {
        if (user == null || user.getRole() == null) {
            return notificationRepository.findAll();
        }

        switch (user.getRole()) {
            case ADMIN:
                // Admin sees: Stock alerts, Expiry alerts, Purchase alerts
                return notificationRepository.findByTypeIn(List.of(
                        NotificationType.LOW_STOCK,
                        NotificationType.EXPIRY_ALERT,
                        NotificationType.PURCHASE_ALERT,
                        NotificationType.STOCK_UPDATE,
                        NotificationType.SYSTEM_ALERT
                ));
            case PHARMACIST:
                // Pharmacist sees: Medicine expiry, Low stock
                return notificationRepository.findByTypeIn(List.of(
                        NotificationType.EXPIRY_ALERT,
                        NotificationType.LOW_STOCK
                ));
            case STAFF:
                // Staff sees: Assigned inventory updates
                return notificationRepository.findByTypeInOrUser(
                        List.of(NotificationType.STOCK_UPDATE, NotificationType.INVENTORY_UPDATE),
                        user
                );
            default:
                return notificationRepository.findAll();
        }
    }

    @Override
    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Notification not found with id: " + id));
    }

    @Override
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Notification not found with id: " + id));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new EntityNotFoundException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
    }
}