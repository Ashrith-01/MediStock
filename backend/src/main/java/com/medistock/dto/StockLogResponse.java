package com.medistock.dto;

import com.medistock.entity.StockLog;
import java.time.LocalDateTime;

public class StockLogResponse {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private Integer oldQuantity;
    private Integer newQuantity;
    private Integer quantityChange;
    private String note;
    private String actionType;
    private String performedBy;
    private String userEmail;
    private Long userId;
    private LocalDateTime timestamp;

    public static StockLogResponse fromEntity(StockLog log) {
        if (log == null) return null;
        StockLogResponse r = new StockLogResponse();
        r.id = log.getId();
        r.medicineId = log.getMedicine() != null ? log.getMedicine().getId() : null;
        r.medicineName = log.getMedicineName() != null ? log.getMedicineName() : (log.getMedicine() != null ? log.getMedicine().getName() : "Unknown Item");
        r.oldQuantity = log.getOldQuantity();
        r.newQuantity = log.getNewQuantity();
        r.quantityChange = (log.getNewQuantity() != null ? log.getNewQuantity() : 0) - (log.getOldQuantity() != null ? log.getOldQuantity() : 0);
        r.note = log.getNote();
        r.actionType = log.getActionType() != null ? log.getActionType().name() : null;
        
        if (log.getUser() != null) {
            r.userId = log.getUser().getId();
            r.userEmail = log.getUser().getEmail();
            r.performedBy = log.getUser().getFullName() != null ? log.getUser().getFullName() + " (" + log.getUser().getEmail() + ")" : log.getUser().getEmail();
        } else if (log.getPerformedBy() != null && !log.getPerformedBy().isBlank()) {
            r.performedBy = log.getPerformedBy();
        } else {
            r.performedBy = "System Administrator";
        }
        
        r.timestamp = log.getTimestamp();
        return r;
    }

    public Long getId() { return id; }
    public Long getMedicineId() { return medicineId; }
    public String getMedicineName() { return medicineName; }
    public Integer getOldQuantity() { return oldQuantity; }
    public Integer getNewQuantity() { return newQuantity; }
    public Integer getQuantityChange() { return quantityChange; }
    public String getNote() { return note; }
    public String getActionType() { return actionType; }
    public String getPerformedBy() { return performedBy; }
    public String getUserEmail() { return userEmail; }
    public Long getUserId() { return userId; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
