package com.medistock.specification;

import com.medistock.entity.Medicine;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class MedicineSpecification {

    public static Specification<Medicine> hasName(String name) {
        return (root, query, cb) -> name == null || name.isBlank() ? null :
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Medicine> hasBatchNumber(String batchNumber) {
        return (root, query, cb) -> batchNumber == null || batchNumber.isBlank() ? null :
                cb.like(cb.lower(root.get("batchNumber")), "%" + batchNumber.toLowerCase() + "%");
    }

    public static Specification<Medicine> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> categoryId == null ? null :
                cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Medicine> hasSupplierId(Long supplierId) {
        return (root, query, cb) -> supplierId == null ? null :
                cb.equal(root.get("supplier").get("id"), supplierId);
    }

    public static Specification<Medicine> expiryBefore(LocalDate date) {
        return (root, query, cb) -> date == null ? null :
                cb.lessThanOrEqualTo(root.get("expiryDate"), date);
    }

    public static Specification<Medicine> expiryAfter(LocalDate date) {
        return (root, query, cb) -> date == null ? null :
                cb.greaterThanOrEqualTo(root.get("expiryDate"), date);
    }

    public static Specification<Medicine> hasStockStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            return switch (status.toUpperCase()) {
                case "OUT_OF_STOCK" -> cb.lessThanOrEqualTo(root.get("quantity"), 0);
                case "LOW_STOCK" -> cb.and(
                        cb.greaterThan(root.get("quantity"), 0),
                        cb.lessThanOrEqualTo(root.get("quantity"), root.get("lowStockThreshold")));
                case "IN_STOCK" -> cb.greaterThan(root.get("quantity"), root.get("lowStockThreshold"));
                default -> null;
            };
        };
    }
}
