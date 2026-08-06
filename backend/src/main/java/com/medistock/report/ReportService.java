package com.medistock.report;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public interface ReportService {

    void generateExpiryReport(
        HttpServletResponse response
    ) throws IOException;

    void generateInventoryReport(
            HttpServletResponse response
    ) throws IOException;

    void generateStockReport(
        HttpServletResponse response
    ) throws IOException;
}