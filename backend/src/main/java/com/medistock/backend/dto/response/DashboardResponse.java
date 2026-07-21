package com.medistock.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalMedicines;
    private long totalSuppliers;
    private long totalUsers;
    private long lowStockCount;
    private long outOfStockCount;
    private long expiredMedicinesCount;
    private List<Map<String, Object>> recentInventoryActivities;
    private Map<String, Object> inventoryStatistics;
    private List<MedicineResponse> lowStockMedicines;
    private List<MedicineResponse> expiringSoonMedicines;
    private List<Map<String, Object>> todaysStockUpdates;
    private List<SupplierResponse> supplierOverview;
    private List<Map<String, Object>> recentInventoryChanges;
    private List<MedicineResponse> availableMedicines;
}
