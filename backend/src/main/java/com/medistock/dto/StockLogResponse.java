package com.medistock.dto;

import com.medistock.entity.StockLog;

import java.time.LocalDateTime;

public class StockLogResponse {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private Integer oldQuantity;
    private Integer newQuantity;
    private String note;
    private String actionType;
    private LocalDateTime timestamp;

    public static StockLogResponse fromEntity(StockLog log) {
        StockLogResponse r = new StockLogResponse();
        r.id = log.getId();
        r.medicineId = log.getMedicine() != null ? log.getMedicine().getId() : null;
        r.medicineName = log.getMedicine() != null ? log.getMedicine().getName() : null;
        r.oldQuantity = log.getOldQuantity();
        r.newQuantity = log.getNewQuantity();
        r.note = log.getNote();
        r.actionType = log.getActionType() != null ? log.getActionType().name() : null;
        r.timestamp = log.getTimestamp();
        return r;
    }

    public Long getId() { return id; }
    public Long getMedicineId() { return medicineId; }
    public Integer getOldQuantity() { return oldQuantity; }
    public Integer getNewQuantity() { return newQuantity; }
    public String getNote() { return note; }
    public String getActionType() { return actionType; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
