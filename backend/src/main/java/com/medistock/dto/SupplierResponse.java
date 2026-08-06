package com.medistock.dto;

import com.medistock.entity.Supplier;
import java.time.LocalDateTime;

public class SupplierResponse {
    private Long id;
    private String name;
    private String contactNumber;
    private String email;
    private String address;
    private int suppliedMedicineCount;
    private LocalDateTime createdAt;

    public static SupplierResponse fromEntity(Supplier s) {
        SupplierResponse r = new SupplierResponse();
        r.id = s.getId();
        r.name = s.getName();
        r.contactNumber = s.getContactNumber();
        r.email = s.getEmail();
        r.address = s.getAddress();
        r.suppliedMedicineCount = s.getMedicines() != null ? s.getMedicines().size() : 0;
        r.createdAt = s.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getContactNumber() { return contactNumber; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public int getSuppliedMedicineCount() { return suppliedMedicineCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
