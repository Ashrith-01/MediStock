package com.medistock.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "stock_logs")
public class StockLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false)
    private Integer quantityChanged;

    @Column(nullable = false, length = 50)
    private String changeType;

    @Column(length = 255)
    private String note;

    @Column(nullable = false)
    private LocalDateTime occurredAt;

    @PrePersist
    public void onPersist() {
        occurredAt = LocalDateTime.now();
    }
}
