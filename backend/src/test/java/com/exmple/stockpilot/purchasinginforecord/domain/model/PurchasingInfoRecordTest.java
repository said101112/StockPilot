package com.exmple.stockpilot.purchasinginforecord.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PurchasingInfoRecord Domain Model Tests")
class PurchasingInfoRecordTest {

    @Test
    @DisplayName("Should create purchasing info record with valid values")
    void shouldCreatePIRSuccessfully() {
        UUID productId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();

        PurchasingInfoRecord pir = PurchasingInfoRecord.create(
                productId,
                supplierId,
                "PART-XYZ-100",
                new BigDecimal("25.00"),
                "EUR",
                7,
                10,
                50,
                new BigDecimal("10.0"), // 10% discount for orders >= 50
                true
        );

        assertNotNull(pir.getId());
        assertEquals(productId, pir.getProductId());
        assertEquals(supplierId, pir.getSupplierId());
        assertEquals("PART-XYZ-100", pir.getSupplierPartNumber());
        assertEquals(new BigDecimal("25.00"), pir.getBaseUnitPrice());
        assertEquals("EUR", pir.getCurrency());
        assertEquals(7, pir.getLeadTimeDays());
        assertEquals(10, pir.getMinOrderQuantity());
        assertEquals(50, pir.getDiscountTierQuantity());
        assertEquals(new BigDecimal("10.0"), pir.getDiscountPercentage());
        assertTrue(pir.isPreferred());
        assertTrue(pir.isActive());
    }

    @Test
    @DisplayName("Should calculate effective unit price correctly below and above discount tier")
    void shouldCalculateEffectiveUnitPrice() {
        PurchasingInfoRecord pir = PurchasingInfoRecord.create(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "PART-ABC",
                new BigDecimal("100.00"),
                "EUR",
                5,
                1,
                20,
                new BigDecimal("15.0"), // 15% discount for quantity >= 20
                false
        );

        // Below tier: standard price 100.00
        BigDecimal normalPrice = pir.calculateEffectiveUnitPrice(10);
        assertEquals(new BigDecimal("100.00"), normalPrice);

        // At or above tier: 15% discount -> 85.00
        BigDecimal discountedPrice = pir.calculateEffectiveUnitPrice(20);
        assertEquals(new BigDecimal("85.00"), discountedPrice);

        BigDecimal higherQuantityPrice = pir.calculateEffectiveUnitPrice(100);
        assertEquals(new BigDecimal("85.00"), higherQuantityPrice);
    }

    @Test
    @DisplayName("Should reject non-positive base price")
    void shouldRejectNonPositiveBasePrice() {
        UUID productId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();

        assertThrows(IllegalArgumentException.class, () ->
                PurchasingInfoRecord.create(
                        productId,
                        supplierId,
                        "REF-1",
                        BigDecimal.ZERO,
                        "EUR",
                        3,
                        1,
                        0,
                        BigDecimal.ZERO,
                        false
                )
        );

        assertThrows(IllegalArgumentException.class, () ->
                PurchasingInfoRecord.create(
                        productId,
                        supplierId,
                        "REF-1",
                        new BigDecimal("-15.00"),
                        "EUR",
                        3,
                        1,
                        0,
                        BigDecimal.ZERO,
                        false
                )
        );
    }

    @Test
    @DisplayName("Should reject null productId or supplierId")
    void shouldRejectNullMandatoryEntities() {
        assertThrows(NullPointerException.class, () ->
                PurchasingInfoRecord.create(
                        null,
                        UUID.randomUUID(),
                        "REF-1",
                        new BigDecimal("20.00"),
                        "EUR",
                        3,
                        1,
                        0,
                        BigDecimal.ZERO,
                        false
                )
        );

        assertThrows(NullPointerException.class, () ->
                PurchasingInfoRecord.create(
                        UUID.randomUUID(),
                        null,
                        "REF-1",
                        new BigDecimal("20.00"),
                        "EUR",
                        3,
                        1,
                        0,
                        BigDecimal.ZERO,
                        false
                )
        );
    }
}
