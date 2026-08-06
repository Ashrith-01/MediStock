package com.medistock.service;

import com.medistock.dto.MedicineRequest;
import com.medistock.dto.MedicineResponse;
import com.medistock.dto.StockAdjustmentRequest;
import com.medistock.entity.Category;
import com.medistock.entity.Medicine;
import com.medistock.entity.StockAction;
import com.medistock.entity.StockLog;
import com.medistock.entity.Supplier;
import com.medistock.exception.DuplicateResourceException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockLogRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.specification.MedicineSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockLogRepository stockLogRepository;

    public MedicineService(MedicineRepository medicineRepository, CategoryRepository categoryRepository,
                            SupplierRepository supplierRepository, StockLogRepository stockLogRepository) {
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.stockLogRepository = stockLogRepository;
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> search(String name, String batchNumber, Long categoryId, Long supplierId,
                                          LocalDate expiryBefore, LocalDate expiryAfter, String stockStatus) {
        Specification<Medicine> spec = Specification
                .where(MedicineSpecification.hasName(name))
                .and(MedicineSpecification.hasBatchNumber(batchNumber))
                .and(MedicineSpecification.hasCategoryId(categoryId))
                .and(MedicineSpecification.hasSupplierId(supplierId))
                .and(MedicineSpecification.expiryBefore(expiryBefore))
                .and(MedicineSpecification.expiryAfter(expiryAfter))
                .and(MedicineSpecification.hasStockStatus(stockStatus));

        return medicineRepository.findAll(spec).stream()
                .map(MedicineResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicineResponse getById(Long id) {
        return MedicineResponse.fromEntity(findEntity(id));
    }

    public Medicine findEntity(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getLowStock() {
        return search(null, null, null, null, null, null, "LOW_STOCK");
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getOutOfStock() {
        return search(null, null, null, null, null, null, "OUT_OF_STOCK");
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getExpiringWithinDays(int days) {
        LocalDate today = LocalDate.now();
        return search(null, null, null, null, today.plusDays(days), today, null);
    }

    public MedicineResponse create(MedicineRequest request) {
        if (medicineRepository.existsByBatchNumberIgnoreCase(request.getBatchNumber())) {
            throw new DuplicateResourceException("A medicine with batch number '" + request.getBatchNumber() + "' already exists");
        }

        Medicine medicine = new Medicine();
        applyRequest(medicine, request);
        return MedicineResponse.fromEntity(medicineRepository.save(medicine));
    }

    public MedicineResponse update(Long id, MedicineRequest request) {
        Medicine medicine = findEntity(id);
        applyRequest(medicine, request);
        return MedicineResponse.fromEntity(medicineRepository.save(medicine));
    }

    @Transactional
    public MedicineResponse adjustStock(Long id, StockAdjustmentRequest request) {
        Medicine medicine = findEntity(id);
        int oldQuantity = medicine.getQuantity() == null ? 0 : medicine.getQuantity();
        int updatedQuantity = oldQuantity + request.getDelta();
        medicine.setQuantity(Math.max(0, updatedQuantity));
        medicine.setLastStockNote(request.getNote() == null || request.getNote().isBlank()
                ? "Stock adjusted" : request.getNote());
        Medicine saved = medicineRepository.save(medicine);

        StockAction actionType = request.getDelta() == null || request.getDelta() == 0
                ? StockAction.UPDATE
                : request.getDelta() > 0 ? StockAction.ADD : StockAction.SALE;

        StockLog log = StockLog.builder()
                .medicine(saved)
                .oldQuantity(oldQuantity)
                .newQuantity(saved.getQuantity())
                .note(saved.getLastStockNote())
                .actionType(actionType)
                .build();
        stockLogRepository.save(log);

        if (saved.getCategory() != null) {
            saved.getCategory().getName();
        }
        if (saved.getSupplier() != null) {
            saved.getSupplier().getName();
        }
        return MedicineResponse.fromEntity(saved);
    }

    public void delete(Long id) {
        Medicine medicine = findEntity(id);
        medicineRepository.delete(medicine);
    }

    private void applyRequest(Medicine medicine, MedicineRequest request) {
        medicine.setName(request.getName());
        medicine.setBatchNumber(request.getBatchNumber());
        medicine.setQuantity(request.getQuantity());
        if (request.getLowStockThreshold() != null) {
            medicine.setLowStockThreshold(request.getLowStockThreshold());
        }
        medicine.setManufacturingDate(request.getManufacturingDate());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setPrice(request.getPrice());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            medicine.setCategory(category);
        } else {
            medicine.setCategory(null);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
            medicine.setSupplier(supplier);
        } else {
            medicine.setSupplier(null);
        }
    }
}
