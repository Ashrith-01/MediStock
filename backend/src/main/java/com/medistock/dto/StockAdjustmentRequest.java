package com.medistock.dto;

import jakarta.validation.constraints.NotNull;

public class StockAdjustmentRequest {

    @NotNull(message = "Stock adjustment value is required")
    private Integer delta;

    private String note;

    public Integer getDelta() { return delta; }
    public void setDelta(Integer delta) { this.delta = delta; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
