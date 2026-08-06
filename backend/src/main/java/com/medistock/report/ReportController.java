package com.medistock.report;


import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;


@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/inventory/pdf")
    public void inventoryReport(
            HttpServletResponse response
    ) throws IOException {
        reportService.generateInventoryReport(response);
    }

    @GetMapping("/expiry/pdf")
    public void expiryReport(
            HttpServletResponse response
    ) throws IOException {
        reportService.generateExpiryReport(response);
    }

    @GetMapping("/stock/pdf")
    public void stockReport(
            HttpServletResponse response
    ) throws IOException {
        reportService.generateStockReport(response);
    }
}