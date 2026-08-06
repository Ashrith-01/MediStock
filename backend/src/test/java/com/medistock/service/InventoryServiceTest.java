package com.medistock.service;

import com.medistock.dto.MedicineRequest;
import com.medistock.dto.StockAdjustmentRequest;
import com.medistock.entity.Category;
import com.medistock.entity.Medicine;
import com.medistock.entity.Supplier;
import com.medistock.exception.DuplicateResourceException;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
class InventoryServiceTest {

    @Autowired
    private MedicineService medicineService;

    @Autowired
    private SupplierService supplierService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @BeforeEach
    void setUp() {
        medicineRepository.deleteAll();
        supplierRepository.deleteAll();
        categoryRepository.deleteAll();
    }

    @Test
    void adjustStockShouldChangeQuantityAndReturnUpdatedResponse() {
        Category category = new Category();
        category.setName("Pain Relief");
        categoryRepository.save(category);

        Supplier supplier = new Supplier("Medi Supply", "1234567890", "sales@medisupply.com", "Street 1");
        supplierRepository.save(supplier);

        MedicineRequest request = new MedicineRequest();
        request.setName("Paracetamol");
        request.setBatchNumber("BATCH-001");
        request.setQuantity(10);
        request.setLowStockThreshold(5);
        request.setManufacturingDate(java.time.LocalDate.now().minusDays(10));
        request.setExpiryDate(java.time.LocalDate.now().plusDays(180));
        request.setPrice(new java.math.BigDecimal("12.50"));
        request.setCategoryId(category.getId());
        request.setSupplierId(supplier.getId());

        var created = medicineService.create(request);

        StockAdjustmentRequest adjustment = new StockAdjustmentRequest();
        adjustment.setDelta(25);
        adjustment.setNote("Restock from supplier");

        var updated = medicineService.adjustStock(created.getId(), adjustment);

        assertEquals(35, updated.getQuantity());
        assertEquals("Restock from supplier", updated.getLastStockNote());
    }

    @Test
    void createSupplierShouldRejectDuplicateName() {
        supplierService.create(new com.medistock.dto.SupplierRequest("Medi Supply", "1234567890", "sales@medisupply.com", "Street 1"));

        assertThrows(DuplicateResourceException.class, () ->
                supplierService.create(new com.medistock.dto.SupplierRequest("Medi Supply", "9999999999", "other@medisupply.com", "Street 2"))
        );
    }
}
