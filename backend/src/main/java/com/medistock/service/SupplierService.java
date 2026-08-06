package com.medistock.service;

import com.medistock.dto.SupplierRequest;
import com.medistock.dto.SupplierResponse;
import com.medistock.entity.Supplier;
import com.medistock.exception.DuplicateResourceException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.SupplierRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> search(String name) {
        Specification<Supplier> spec = (root, query, cb) -> name == null || name.isBlank() ? null :
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");

        return supplierRepository.findAll(spec).stream()
                .map(SupplierResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        return SupplierResponse.fromEntity(findEntity(id));
    }

    public Supplier findEntity(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }

    public SupplierResponse create(SupplierRequest request) {
        ensureUniqueName(request.getName(), null);
        Supplier supplier = new Supplier(request.getName(), request.getContactNumber(),
                request.getEmail(), request.getAddress());
        return SupplierResponse.fromEntity(supplierRepository.save(supplier));
    }

    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = findEntity(id);
        ensureUniqueName(request.getName(), id);
        supplier.setName(request.getName());
        supplier.setContactNumber(request.getContactNumber());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        return SupplierResponse.fromEntity(supplierRepository.save(supplier));
    }

    public void delete(Long id) {
        Supplier supplier = findEntity(id);
        supplierRepository.delete(supplier);
    }

    private void ensureUniqueName(String name, Long excludeId) {
        if (name == null || name.isBlank()) {
            return;
        }
        boolean exists = excludeId == null
                ? supplierRepository.existsByNameIgnoreCase(name)
                : supplierRepository.existsByNameIgnoreCaseAndIdNot(name, excludeId);
        if (exists) {
            throw new DuplicateResourceException("A supplier with the name '" + name + "' already exists");
        }
    }
}
