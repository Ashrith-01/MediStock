package com.medistock.controller;

import com.medistock.dto.StockLogResponse;
import com.medistock.entity.StockLog;
import com.medistock.repository.StockLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StockLogController {

    private final StockLogRepository stockLogRepository;

    @GetMapping("/stock-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StockLogResponse>> getAllStockLogs() {
        List<StockLog> logs = stockLogRepository.findAllLogs();
        List<StockLogResponse> response = logs.stream()
                .map(StockLogResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stock-logs/recent")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<List<StockLogResponse>> getRecentStockLogs(
            @RequestParam(defaultValue = "10") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        List<StockLog> logs = stockLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, safeLimit));
        List<StockLogResponse> response = logs.stream()
                .map(StockLogResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stock-logs/{medicineId}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<List<StockLogResponse>> getStockLogsByMedicine(@PathVariable Long medicineId) {
        List<StockLog> logs = stockLogRepository.findByMedicineId(medicineId);
        List<StockLogResponse> response = logs.stream()
                .map(StockLogResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
