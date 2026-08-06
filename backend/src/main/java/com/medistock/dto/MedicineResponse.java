package com.medistock.dto;

import com.medistock.entity.Medicine;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MedicineResponse {
    private Long id;
    private String name;
    private String batchNumber;
    private Long categoryId;
    private String categoryName;
    private Long supplierId;
    private String supplierName;
    private Integer quantity;
    private Integer lowStockThreshold;
    private String lastStockNote;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private BigDecimal price;
    private String stockStatus; // OUT_OF_STOCK, LOW_STOCK, IN_STOCK
    private boolean expired;
    private boolean nearExpiry;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MedicineResponse fromEntity(Medicine m) {
        MedicineResponse r = new MedicineResponse();
        r.id = m.getId();
        r.name = m.getName();
        r.batchNumber = m.getBatchNumber();
        if (m.getCategory() != null) {
            var category = m.getCategory();
            r.categoryId = category.getId();
            r.categoryName = category.getName();
        }
        if (m.getSupplier() != null) {
            var supplier = m.getSupplier();
            r.supplierId = supplier.getId();
            r.supplierName = supplier.getName();
        }
        r.quantity = m.getQuantity();
        r.lowStockThreshold = m.getLowStockThreshold();
        r.lastStockNote = m.getLastStockNote();
        r.manufacturingDate = m.getManufacturingDate();
        r.expiryDate = m.getExpiryDate();
        r.price = m.getPrice();
        r.createdAt = m.getCreatedAt();
        r.updatedAt = m.getUpdatedAt();

        if (m.getQuantity() == null || m.getQuantity() == 0) {
            r.stockStatus = "OUT_OF_STOCK";
        } else if (m.getLowStockThreshold() != null && m.getQuantity() <= m.getLowStockThreshold()) {
            r.stockStatus = "LOW_STOCK";
        } else {
            r.stockStatus = "IN_STOCK";
        }

        LocalDate today = LocalDate.now();
        r.expired = m.getExpiryDate() != null && m.getExpiryDate().isBefore(today);
        r.nearExpiry = m.getExpiryDate() != null && !r.expired
                && !m.getExpiryDate().isAfter(today.plusDays(30));

        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getBatchNumber() { return batchNumber; }
    public Long getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public Long getSupplierId() { return supplierId; }
    public String getSupplierName() { return supplierName; }
    public Integer getQuantity() { return quantity; }
    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public String getLastStockNote() { return lastStockNote; }
    public LocalDate getManufacturingDate() { return manufacturingDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public BigDecimal getPrice() { return price; }
    public String getStockStatus() { return stockStatus; }
    public boolean isExpired() { return expired; }
    public boolean isNearExpiry() { return nearExpiry; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
