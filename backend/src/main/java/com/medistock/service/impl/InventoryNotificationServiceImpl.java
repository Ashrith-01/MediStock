package com.medistock.service.impl;

import com.medistock.entity.Medicine;
import com.medistock.entity.Notification;
import com.medistock.entity.NotificationType;
import com.medistock.repository.MedicineRepository;
import com.medistock.service.EmailService;
import com.medistock.service.InventoryNotificationService;
import com.medistock.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryNotificationServiceImpl implements InventoryNotificationService {

    private final MedicineRepository medicineRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${app.notification.recipient-email:${spring.mail.username:admin@medistock.com}}")
    private String recipientEmail;


    @Override
    public void checkLowStock() {

        List<Medicine> medicines = medicineRepository.findAll();

        for (Medicine medicine : medicines) {


            if (medicine.getLowStockThreshold() == null) {
                continue;
            }


            if (medicine.getQuantity() <= medicine.getLowStockThreshold()) {


                String title = "Low Stock Alert";

                String message =
                        medicine.getName()
                        + " stock is below the minimum threshold.";


                Notification notification =
                        notificationService.createNotification(
                                title,
                                message,
                                NotificationType.LOW_STOCK
                        );


                // Send email only for newly created notification
                if (notification != null) {
                    log.info("New low stock notification created for {}. Sending email to {}", medicine.getName(), recipientEmail);

                    emailService.sendEmail(
                            recipientEmail,
                            "MediStock Low Stock Alert",
                            message
                    );
                } else {
                    log.debug("Low stock notification already exists for {}. Skipping duplicate email.", medicine.getName());
                }
            }
        }
    }



    @Override
    public void checkExpiry() {


        LocalDate today = LocalDate.now();

        LocalDate limit = today.plusDays(30);


        List<Medicine> medicines = medicineRepository.findAll();


        for (Medicine medicine : medicines) {


            if (medicine.getExpiryDate() == null) {
                continue;
            }


            if (!medicine.getExpiryDate().isBefore(today)
                    && !medicine.getExpiryDate().isAfter(limit)) {


                String title = "Expiry Alert";


                String message =
                        medicine.getName()
                        + " expires within 30 days.";


                Notification notification =
                        notificationService.createNotification(
                                title,
                                message,
                                NotificationType.EXPIRY_ALERT
                        );


                // Send email only for newly created notification
                if (notification != null) {
                    log.info("New expiry notification created for {}. Sending email to {}", medicine.getName(), recipientEmail);

                    emailService.sendEmail(
                            recipientEmail,
                            "MediStock Expiry Alert",
                            message
                    );
                } else {
                    log.debug("Expiry notification already exists for {}. Skipping duplicate email.", medicine.getName());
                }
            }
        }
    }
}