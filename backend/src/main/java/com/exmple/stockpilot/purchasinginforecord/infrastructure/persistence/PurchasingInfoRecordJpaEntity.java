package com.exmple.stockpilot.purchasinginforecord.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(
        name = "purchasing_info_records",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"product_id", "supplier_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchasingInfoRecordJpaEntity {

    @Id
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "supplier_part_number")
    private String supplierPartNumber;

    @Column(name = "base_unit_price", nullable = false)
    private BigDecimal baseUnitPrice;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(name = "lead_time_days", nullable = false)
    private int leadTimeDays;

    @Column(name = "min_order_quantity", nullable = false)
    private int minOrderQuantity;

    @Column(name = "discount_tier_quantity")
    private int discountTierQuantity;

    @Column(name = "discount_percentage")
    private BigDecimal discountPercentage;

    @Column(name = "is_preferred", nullable = false)
    private boolean preferred;

    @Column(name = "is_active", nullable = false)
    private boolean active;
}
