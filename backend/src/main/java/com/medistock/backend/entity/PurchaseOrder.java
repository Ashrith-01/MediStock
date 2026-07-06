package com.medistock.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    @ElementCollection
    @CollectionTable(name = "purchase_order_items", joinColumns = @JoinColumn(name = "purchase_order_id"))
    private List<PurchaseOrderItem> items = new ArrayList<>();

    @PrePersist
    public void onPersist() {
        orderDate = LocalDateTime.now();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Embeddable
    public static class PurchaseOrderItem {

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "medicine_id", nullable = false)
        private Medicine medicine;

        @Column(nullable = false)
        private Integer quantity;

        @Column(nullable = false)
        private BigDecimal unitPrice;

        @Column(nullable = false)
        private BigDecimal lineTotal;
    }
}
