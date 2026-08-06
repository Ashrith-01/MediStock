package com.medistock.repository;

import com.medistock.entity.StockLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockLogRepository extends JpaRepository<StockLog, Long> {

    @Query("select s from StockLog s join fetch s.medicine where s.medicine.id = :medicineId order by s.timestamp desc")
    List<StockLog> findByMedicineId(@Param("medicineId") Long medicineId);

    @Query("select s from StockLog s join fetch s.medicine order by s.timestamp desc")
    List<StockLog> findAllByOrderByTimestampDesc(Pageable pageable);

    @Query("""
            SELECT s 
            FROM StockLog s
            JOIN FETCH s.medicine
            """)
    List<StockLog> findAllWithMedicine();
}
