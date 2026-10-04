package com.exmple.stockpilot.product.domain.model;

import com.exmple.stockpilot.product.domain.valueobject.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductTest {

    @Test
    @DisplayName("Devrait créer un produit valide avec le factory create()")
    void shouldCreateValidProduct() {
        SKU sku = SKU.of("SKU-TEST-001");
        Price price = Price.of(new BigDecimal("49.99"), "EUR");
        UnitOfMeasure uom = UnitOfMeasure.of("PCS");

        Product product = Product.create(
                "Capteur de température",
                "Capteur industriel haute précision",
                sku,
                price,
                uom,
                ProductCategory.SPARE_PART
        );

        assertThat(product.getId()).isNotNull();
        assertThat(product.getName()).isEqualTo("Capteur de température");
        assertThat(product.getDescription()).isEqualTo("Capteur industriel haute précision");
        assertThat(product.getSku().value()).isEqualTo("SKU-TEST-001");
        assertThat(product.getPrice().amount()).isEqualByComparingTo("49.99");
        assertThat(product.getUnitOfMeasure().value()).isEqualTo("PCS");
        assertThat(product.getCategory()).isEqualTo(ProductCategory.SPARE_PART);
        assertThat(product.getStatus()).isEqualTo(ProductStatus.ACTIVE);
    }

    @Test
    @DisplayName("Devrait rejeter un nom de produit trop court ou null")
    void shouldRejectShortOrNullName() {
        SKU sku = SKU.of("SKU-001");
        Price price = Price.of(BigDecimal.TEN, "EUR");

        assertThatThrownBy(() -> Product.create("A", "Desc", sku, price, UnitOfMeasure.of("PCS"), ProductCategory.FINISHED_GOOD))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Product name must contain at least 2 characters");

        assertThatThrownBy(() -> Product.create(null, "Desc", sku, price, UnitOfMeasure.of("PCS"), ProductCategory.FINISHED_GOOD))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Devrait rejeter un prix négatif")
    void shouldRejectNegativePrice() {
        assertThatThrownBy(() -> Price.of(new BigDecimal("-5.00"), "EUR"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Price cannot be negative");
    }

    @Test
    @DisplayName("Devrait rejeter un SKU vide ou blank")
    void shouldRejectBlankSku() {
        assertThatThrownBy(() -> SKU.of("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("SKU cannot be empty");
    }

    @Test
    @DisplayName("Devrait mettre à jour le prix de l'article")
    void shouldUpdatePrice() {
        Product product = Product.create(
                "Roulement à billes",
                "Description",
                SKU.of("SKU-ROUL-01"),
                Price.of(new BigDecimal("12.50"), "EUR"),
                UnitOfMeasure.of("PCS"),
                ProductCategory.SPARE_PART
        );

        Price newPrice = Price.of(new BigDecimal("15.00"), "EUR");
        product.updatePrice(newPrice);

        assertThat(product.getPrice().amount()).isEqualByComparingTo("15.00");
    }

    @Test
    @DisplayName("Devrait désactiver puis réactiver un produit")
    void shouldToggleProductStatus() {
        Product product = Product.create(
                "Disjoncteur différentiel",
                "Matériel électrique",
                SKU.of("SKU-ELEC-40A"),
                Price.of(new BigDecimal("85.00"), "EUR"),
                UnitOfMeasure.of("PCS"),
                ProductCategory.RAW_MATERIAL
        );

        product.deactivate();
        assertThat(product.getStatus()).isEqualTo(ProductStatus.INACTIVE);

        product.activate();
        assertThat(product.getStatus()).isEqualTo(ProductStatus.ACTIVE);
    }

    @Test
    @DisplayName("Devrait mettre à jour les détails de l'article")
    void shouldUpdateDetails() {
        Product product = Product.create(
                "Câble RJ45",
                "Cat 6 UTP",
                SKU.of("SKU-CAB-01"),
                Price.of(new BigDecimal("5.00"), "EUR"),
                UnitOfMeasure.of("M"),
                ProductCategory.FINISHED_GOOD
        );

        product.updateDetails(
                "Câble RJ45 Blindé",
                "Cat 6A S/FTP 10Gbps",
                Price.of(new BigDecimal("8.50"), "EUR"),
                UnitOfMeasure.of("M"),
                ProductCategory.SPARE_PART
        );

        assertThat(product.getName()).isEqualTo("Câble RJ45 Blindé");
        assertThat(product.getDescription()).isEqualTo("Cat 6A S/FTP 10Gbps");
        assertThat(product.getPrice().amount()).isEqualByComparingTo("8.50");
        assertThat(product.getCategory()).isEqualTo(ProductCategory.SPARE_PART);
    }
}
