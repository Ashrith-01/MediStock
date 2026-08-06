package com.medistock.scheduler;

import com.medistock.service.InventoryNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final InventoryNotificationService inventoryNotificationService;

    // @Scheduled(cron = "0 0 9 * * *")
    @Scheduled(fixedRate = 30000)
    public void runDailyChecks() {

        log.info("Running scheduled inventory notification check...");

        inventoryNotificationService.checkLowStock();
        inventoryNotificationService.checkExpiry();

        log.info("Inventory notification check completed.");
    }
}