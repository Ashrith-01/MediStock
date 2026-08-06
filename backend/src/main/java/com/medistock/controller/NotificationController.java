package com.medistock.controller;

import com.medistock.entity.Notification;
import com.medistock.entity.NotificationType;
import com.medistock.security.UserPrincipal;
import com.medistock.service.EmailService;
import com.medistock.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam NotificationType type) {

        Notification notification = notificationService.createNotification(
                title,
                message,
                type
        );

        return new ResponseEntity<>(notification, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            List<Notification> notifications = notificationService.getNotificationsForUser(principal.getUser());
            return ResponseEntity.ok(notifications);
        }
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(notification);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok("Notification deleted successfully.");
    }

    @PostMapping("/send")
    public String sendNotification() {
        emailService.sendEmail(
                "ashrithreddyannam@gmail.com",
                "Test Mail",
                "Email working"
        );
        return "Email sent";
    }
}