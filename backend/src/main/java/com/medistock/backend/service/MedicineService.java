package com.medistock.backend.service;

import com.medistock.backend.dto.request.MedicineRequest;
import com.medistock.backend.dto.response.DashboardResponse;
import com.medistock.backend.dto.response.MedicineResponse;
import com.medistock.backend.dto.response.SupplierResponse;
import com.medistock.backend.entity.Medicine;
import com.medistock.backend.entity.StockLog;
import com.medistock.backend.entity.Supplier;
import com.medistock.backend.repository.MedicineRepository;
import com.medistock.backend.repository.StockLogRepository;
import com.medistock.backend.repository.SupplierRepository;
import com.medistock.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final StockLogRepository stockLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public MedicineResponse create(MedicineRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));

        Medicine medicine = Medicine.builder()
                .medicineName(request.getMedicineName())
                .batchNumber(request.getBatchNumber())
                .category(request.getCategory())
                .supplier(supplier)
                .quantity(request.getQuantity())
                .manufacturingDate(request.getManufacturingDate())
                .expiryDate(request.getExpiryDate())
                .price(request.getPrice())
                .build();

        Medicine saved = medicineRepository.save(medicine);
        createStockLog(saved.getId(), saved.getQuantity(), saved.getQuantity(), "CREATED");
        return toResponse(saved);
    }

    @Transactional
    public MedicineResponse update(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found"));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));

        Integer oldQuantity = medicine.getQuantity();
        medicine.setMedicineName(request.getMedicineName());
        medicine.setBatchNumber(request.getBatchNumber());
        medicine.setCategory(request.getCategory());
        medicine.setSupplier(supplier);
        medicine.setQuantity(request.getQuantity());
        medicine.setManufacturingDate(request.getManufacturingDate());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setPrice(request.getPrice());

        Medicine saved = medicineRepository.save(medicine);
        if (!oldQuantity.equals(saved.getQuantity())) {
            createStockLog(saved.getId(), oldQuantity, saved.getQuantity(), "UPDATED");
        }
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found"));
        medicineRepository.delete(medicine);
    }

    @Transactional(readOnly = true)
    public MedicineResponse getById(Long id) {
        return medicineRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found"));
    }

    @Transactional(readOnly = true)
    public Page<MedicineResponse> getAll(String search, String category, String supplier, String batch, String expiry, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Medicine> medicines = medicineRepository.findAll(pageable);
        List<Medicine> filtered = medicines.getContent().stream()
                .filter(m -> search == null || search.isBlank() || m.getMedicineName().toLowerCase().contains(search.toLowerCase()))
                .filter(m -> category == null || category.isBlank() || category.equalsIgnoreCase(m.getCategory()))
                .filter(m -> supplier == null || supplier.isBlank() || (m.getSupplier() != null && m.getSupplier().getSupplierName().equalsIgnoreCase(supplier)))
                .filter(m -> batch == null || batch.isBlank() || m.getBatchNumber().equalsIgnoreCase(batch))
                .filter(m -> expiry == null || expiry.isBlank() || !m.getExpiryDate().isBefore(LocalDate.now()))
                .filter(m -> status == null || status.isBlank() || matchesStatus(m, status))
                .toList();

        return new org.springframework.data.domain.PageImpl<>(filtered.stream().map(this::toResponse).toList(), pageable, filtered.size());
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        List<Medicine> medicines = medicineRepository.findAll();
        List<Supplier> suppliers = supplierRepository.findAll();

        long lowStockCount = medicines.stream().filter(m -> m.getQuantity() <= 5).count();
        long outOfStockCount = medicines.stream().filter(m -> m.getQuantity() == 0).count();
        long expiredMedicinesCount = medicines.stream().filter(m -> m.getExpiryDate().isBefore(LocalDate.now())).count();

        List<MedicineResponse> lowStockMedicines = medicines.stream().filter(m -> m.getQuantity() <= 5).map(this::toResponse).toList();
        List<MedicineResponse> expiringSoonMedicines = medicines.stream().filter(m -> !m.getExpiryDate().isBefore(LocalDate.now().plusDays(30))).map(this::toResponse).toList();

        List<Map<String, Object>> recentInventoryActivities = stockLogRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp")).stream().limit(10).map(this::toActivityMap).toList();
        List<Map<String, Object>> todaysStockUpdates = stockLogRepository.findAll().stream().filter(log -> log.getTimestamp().toLocalDate().equals(LocalDate.now())).map(this::toActivityMap).toList();
        List<Map<String, Object>> recentInventoryChanges = recentInventoryActivities;
        List<SupplierResponse> supplierOverview = suppliers.stream().map(this::toSupplierResponse).toList();
        List<MedicineResponse> availableMedicines = medicines.stream().filter(m -> m.getQuantity() > 0).map(this::toResponse).toList();

        Map<String, Object> inventoryStatistics = new LinkedHashMap<>();
        inventoryStatistics.put("totalMedicines", medicines.size());
        inventoryStatistics.put("totalSuppliers", suppliers.size());
        inventoryStatistics.put("totalUsers", userRepository.count());
        inventoryStatistics.put("lowStockCount", lowStockCount);
        inventoryStatistics.put("outOfStockCount", outOfStockCount);
        inventoryStatistics.put("expiredMedicinesCount", expiredMedicinesCount);

        return DashboardResponse.builder()
                .totalMedicines(medicines.size())
                .totalSuppliers(suppliers.size())
                .totalUsers(userRepository.count())
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .expiredMedicinesCount(expiredMedicinesCount)
                .recentInventoryActivities(recentInventoryActivities)
                .inventoryStatistics(inventoryStatistics)
                .lowStockMedicines(lowStockMedicines)
                .expiringSoonMedicines(expiringSoonMedicines)
                .todaysStockUpdates(todaysStockUpdates)
                .supplierOverview(supplierOverview)
                .recentInventoryChanges(recentInventoryChanges)
                .availableMedicines(availableMedicines)
                .build();
    }

    private void createStockLog(Long medicineId, Integer oldQuantity, Integer newQuantity, String actionType) {
        stockLogRepository.save(StockLog.builder()
                .medicineId(medicineId)
                .oldQuantity(oldQuantity)
                .newQuantity(newQuantity)
                .actionType(actionType)
                .build());
    }

    private boolean matchesStatus(Medicine medicine, String status) {
        return switch (status.toLowerCase()) {
            case "low" -> medicine.getQuantity() <= 5;
            case "out_of_stock" -> medicine.getQuantity() == 0;
            case "expired" -> medicine.getExpiryDate().isBefore(LocalDate.now());
            case "available" -> medicine.getQuantity() > 0;
            default -> true;
        };
    }

    private Map<String, Object> toActivityMap(StockLog log) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", log.getId());
        map.put("actionType", log.getActionType());
        map.put("oldQuantity", log.getOldQuantity());
        map.put("newQuantity", log.getNewQuantity());
        map.put("timestamp", log.getTimestamp());
        return map;
    }

    private MedicineResponse toResponse(Medicine medicine) {
        return MedicineResponse.builder()
                .id(medicine.getId())
                .medicineName(medicine.getMedicineName())
                .batchNumber(medicine.getBatchNumber())
                .category(medicine.getCategory())
                .supplierId(medicine.getSupplier() != null ? medicine.getSupplier().getId() : null)
                .supplierName(medicine.getSupplier() != null ? medicine.getSupplier().getSupplierName() : null)
                .quantity(medicine.getQuantity())
                .manufacturingDate(medicine.getManufacturingDate())
                .expiryDate(medicine.getExpiryDate())
                .price(medicine.getPrice())
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }

    private SupplierResponse toSupplierResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .supplierName(supplier.getSupplierName())
                .contactNumber(supplier.getContactNumber())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .build();
    }
}
