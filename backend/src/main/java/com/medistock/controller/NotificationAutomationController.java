package com.medistock.controller;


import com.medistock.service.InventoryNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/notification-check")
@RequiredArgsConstructor
public class NotificationAutomationController {


private final InventoryNotificationService service;



@GetMapping("/low-stock")
public String checkStock(){

    service.checkLowStock();

    return "Low stock check completed";
}



@GetMapping("/expiry")
public String checkExpiry(){

    service.checkExpiry();

    return "Expiry check completed";
}


}