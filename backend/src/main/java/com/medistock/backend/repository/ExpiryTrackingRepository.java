package com.medistock.backend.repository;

import com.medistock.backend.entity.ExpiryTracking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpiryTrackingRepository extends JpaRepository<ExpiryTracking, Long> {

    List<ExpiryTracking> findByExpirationDateBefore(java.time.LocalDate cutoffDate);
}
