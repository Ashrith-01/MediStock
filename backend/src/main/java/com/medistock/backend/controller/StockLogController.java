package com.medistock.backend.controller;

import com.medistock.backend.entity.StockLog;
import com.medistock.backend.repository.StockLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StockLogController {

    private final StockLogRepository stockLogRepository;

    @GetMapping("/stock-logs/{medicineId}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<List<StockLog>> getStockLogs(@PathVariable Long medicineId) {
        return ResponseEntity.ok(stockLogRepository.findByMedicineId(medicineId));
    }
}
