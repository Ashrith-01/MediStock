package com.medistock.service;

import com.medistock.dto.MedicineRequest;
import com.medistock.dto.MedicineResponse;
import com.medistock.dto.StockAdjustmentRequest;
import com.medistock.entity.Category;
import com.medistock.entity.Medicine;
import com.medistock.entity.StockAction;
import com.medistock.entity.StockLog;
import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.exception.DuplicateResourceException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockLogRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.security.UserPrincipal;
import com.medistock.specification.MedicineSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUser();
        }
        return null;
    }

    private String getPerformedByStr(User user) {
        if (user != null) {
            return user.getFullName() != null ? user.getFullName() + " (" + user.getEmail() + ")" : user.getEmail();
        }
        return "System Administrator";
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

    @Transactional
    public MedicineResponse create(MedicineRequest request) {
        if (medicineRepository.existsByBatchNumberIgnoreCase(request.getBatchNumber())) {
            throw new DuplicateResourceException("A medicine with batch number '" + request.getBatchNumber() + "' already exists");
        }

        Medicine medicine = new Medicine();
        applyRequest(medicine, request);
        Medicine saved = medicineRepository.save(medicine);

        User currentUser = getCurrentUser();
        StockLog log = StockLog.builder()
                .medicine(saved)
                .medicineName(saved.getName())
                .oldQuantity(0)
                .newQuantity(saved.getQuantity() != null ? saved.getQuantity() : 0)
                .note("New medicine registered in catalog")
                .actionType(StockAction.ADD)
                .user(currentUser)
                .performedBy(getPerformedByStr(currentUser))
                .build();
        stockLogRepository.save(log);

        return MedicineResponse.fromEntity(saved);
    }

    @Transactional
    public MedicineResponse update(Long id, MedicineRequest request) {
        Medicine medicine = findEntity(id);
        int oldQuantity = medicine.getQuantity() != null ? medicine.getQuantity() : 0;

        applyRequest(medicine, request);
        Medicine saved = medicineRepository.save(medicine);

        User currentUser = getCurrentUser();
        int newQuantity = saved.getQuantity() != null ? saved.getQuantity() : 0;
        StockAction action = newQuantity > oldQuantity ? StockAction.ADD : (newQuantity < oldQuantity ? StockAction.SALE : StockAction.UPDATE);

        StockLog log = StockLog.builder()
                .medicine(saved)
                .medicineName(saved.getName())
                .oldQuantity(oldQuantity)
                .newQuantity(newQuantity)
                .note("Medicine record updated")
                .actionType(action)
                .user(currentUser)
                .performedBy(getPerformedByStr(currentUser))
                .build();
        stockLogRepository.save(log);

        return MedicineResponse.fromEntity(saved);
    }

    @Transactional
    public MedicineResponse adjustStock(Long id, StockAdjustmentRequest request) {
        Medicine medicine = findEntity(id);
        int oldQuantity = medicine.getQuantity() == null ? 0 : medicine.getQuantity();
        int delta = request.getDelta() != null ? request.getDelta() : 0;
        int updatedQuantity = oldQuantity + delta;
        
        medicine.setQuantity(Math.max(0, updatedQuantity));
        medicine.setLastStockNote(request.getNote() == null || request.getNote().isBlank()
                ? "Stock adjusted" : request.getNote());
        Medicine saved = medicineRepository.save(medicine);

        StockAction actionType = delta == 0
                ? StockAction.UPDATE
                : delta > 0 ? StockAction.ADD : StockAction.SALE;

        User currentUser = getCurrentUser();
        StockLog log = StockLog.builder()
                .medicine(saved)
                .medicineName(saved.getName())
                .oldQuantity(oldQuantity)
                .newQuantity(saved.getQuantity())
                .note(saved.getLastStockNote())
                .actionType(actionType)
                .user(currentUser)
                .performedBy(getPerformedByStr(currentUser))
                .build();
        stockLogRepository.save(log);

        return MedicineResponse.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id) {
        Medicine medicine = findEntity(id);
        int oldQuantity = medicine.getQuantity() != null ? medicine.getQuantity() : 0;
        String medName = medicine.getName();

        User currentUser = getCurrentUser();
        StockLog log = StockLog.builder()
                .medicine(null)
                .medicineName(medName)
                .oldQuantity(oldQuantity)
                .newQuantity(0)
                .note("Medicine removed from catalog")
                .actionType(StockAction.DELETE)
                .user(currentUser)
                .performedBy(getPerformedByStr(currentUser))
                .build();
        stockLogRepository.save(log);

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
