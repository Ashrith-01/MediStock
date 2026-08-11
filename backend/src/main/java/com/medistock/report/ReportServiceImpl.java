package com.medistock.report;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.medistock.entity.Medicine;
import com.medistock.entity.StockLog;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final MedicineRepository medicineRepository;
    private final StockLogRepository stockLogRepository;

    @Override
    public void generateInventoryReport(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=inventory-report.pdf");

        List<Medicine> medicines = medicineRepository.findAll();

        Document document = new Document();
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setSize(18);

        Paragraph title = new Paragraph("MediStock Inventory Report", font);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(5);
        table.addCell("Name");
        table.addCell("Category");
        table.addCell("Quantity");
        table.addCell("Price");
        table.addCell("Expiry Date");

        for (Medicine medicine : medicines) {
            table.addCell(medicine.getName() != null ? medicine.getName() : "N/A");
            table.addCell(medicine.getCategory() != null && medicine.getCategory().getName() != null
                    ? medicine.getCategory().getName()
                    : "N/A");
            table.addCell(medicine.getQuantity() != null ? String.valueOf(medicine.getQuantity()) : "0");
            table.addCell(medicine.getPrice() != null ? String.valueOf(medicine.getPrice()) : "0.00");
            table.addCell(medicine.getExpiryDate() != null ? medicine.getExpiryDate().toString() : "N/A");
        }

        document.add(table);
        document.close();
    }

    @Override
    public void generateExpiryReport(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=expiry-report.pdf");

        List<Medicine> medicines = medicineRepository.findAll();

        Document document = new Document();
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setSize(18);

        Paragraph title = new Paragraph("MediStock Expiry Report", font);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(3);
        table.addCell("Medicine Name");
        table.addCell("Expiry Date");
        table.addCell("Status");

        LocalDate today = LocalDate.now();

        for (Medicine medicine : medicines) {
            if (medicine.getExpiryDate() == null) {
                continue;
            }

            String status = "";
            if (medicine.getExpiryDate().isBefore(today)) {
                status = "EXPIRED";
            } else if (!medicine.getExpiryDate().isAfter(today.plusDays(30))) {
                status = "EXPIRING SOON";
            } else {
                continue;
            }

            table.addCell(medicine.getName() != null ? medicine.getName() : "N/A");
            table.addCell(medicine.getExpiryDate().toString());
            table.addCell(status);
        }

        document.add(table);
        document.close();
    }

    @Override
    public void generateStockReport(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=stock-report.pdf");

        List<StockLog> logs = stockLogRepository.findAllLogs();

        Document document = new Document();
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setSize(18);

        Paragraph title = new Paragraph("MediStock Stock Movement Report", font);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(5);
        table.addCell("Medicine");
        table.addCell("Old Quantity");
        table.addCell("New Quantity");
        table.addCell("Action");
        table.addCell("Date");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (StockLog log : logs) {
            String medicineName = "N/A";
            if (log.getMedicine() != null && log.getMedicine().getName() != null) {
                medicineName = log.getMedicine().getName();
            } else if (log.getMedicineName() != null) {
                medicineName = log.getMedicineName();
            }

            table.addCell(medicineName);
            table.addCell(log.getOldQuantity() != null ? log.getOldQuantity().toString() : "0");
            table.addCell(log.getNewQuantity() != null ? log.getNewQuantity().toString() : "0");
            table.addCell(log.getActionType() != null ? log.getActionType().name() : "N/A");
            table.addCell(log.getTimestamp() != null ? log.getTimestamp().format(formatter) : "N/A");
        }

        document.add(table);
        document.close();
    }
}