package com.medistock.controller;

import com.medistock.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/test")
    public String sendTestEmail(@RequestParam String to) {

        emailService.sendEmail(
                to,
                "MediStock Test Email",
                "Congratulations! Email notifications are working."
        );

        return "Email sent successfully.";
    }
}