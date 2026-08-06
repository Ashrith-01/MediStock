package com.medistock.controller;

import com.medistock.backend.repository.StockLogRepository;
import com.medistock.dto.StockLogResponse;
import com.medistock.entity.StockLog;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StockLogController {

    private final StockLogRepository stockLogRepository;

    @GetMapping("/stock-logs/recent")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<List<StockLogResponse>> getRecentStockLogs(
            @RequestParam(defaultValue = "5") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 20));
        List<StockLog> logs = stockLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, safeLimit));
        List<StockLogResponse> response = logs.stream()
                .map(StockLogResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stock-logs/{medicineId}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<List<StockLogResponse>> getStockLogs(@PathVariable Long medicineId) {
        List<StockLog> logs = stockLogRepository.findByMedicineId(medicineId);
        List<StockLogResponse> response = logs.stream()
                .map(StockLogResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
