package com.exmple.stockpilot.product.domain.model;

import com.exmple.stockpilot.product.domain.valueobject.Price;
import com.exmple.stockpilot.product.domain.valueobject.ProductCategory;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.product.domain.valueobject.ProductStatus;
import com.exmple.stockpilot.product.domain.valueobject.SKU;
import com.exmple.stockpilot.product.domain.valueobject.UnitOfMeasure;

import java.util.Objects;

/**
 * Entité Racine d'Agrégat du Produit / Article (Material Master).
 * Encapsule les règles métier pures relatives à l'article sans aucune dépendance framework.
 */
public class Product {

    private final ProductId id;
    private String name;
    private String description;
    private SKU sku;
    private Price price;
    private UnitOfMeasure unitOfMeasure;
    private ProductCategory category;
    private ProductStatus status;

    public Product(
            ProductId id,
            String name,
            String description,
            SKU sku,
            Price price,
            UnitOfMeasure unitOfMeasure,
            ProductCategory category,
            ProductStatus status
    ) {
        this.id = Objects.requireNonNull(id, "ProductId cannot be null");
        if (name == null || name.trim().length() < 2) {
            throw new IllegalArgumentException("Product name must contain at least 2 characters");
        }
        this.name = name.trim();
        this.description = description != null ? description.trim() : "";
        this.sku = Objects.requireNonNull(sku, "SKU cannot be null");
        this.price = Objects.requireNonNull(price, "Price cannot be null");
        this.unitOfMeasure = unitOfMeasure != null ? unitOfMeasure : UnitOfMeasure.of("PCS");
        this.category = category != null ? category : ProductCategory.FINISHED_GOOD;
        this.status = status != null ? status : ProductStatus.ACTIVE;
    }

    // Static Factory pour la création d'un nouvel article
    public static Product create(
            String name,
            String description,
            SKU sku,
            Price price,
            UnitOfMeasure unitOfMeasure,
            ProductCategory category
    ) {
        return new Product(
                ProductId.generate(),
                name,
                description,
                sku,
                price,
                unitOfMeasure,
                category,
                ProductStatus.ACTIVE
        );
    }

    // Méthodes métier (Logique de domaine)
    public void updatePrice(Price newPrice) {
        this.price = Objects.requireNonNull(newPrice, "New price cannot be null");
    }

    public void deactivate() {
        this.status = ProductStatus.INACTIVE;
    }

    public void activate() {
        this.status = ProductStatus.ACTIVE;
    }

    // Getters
    public ProductId getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public SKU getSku() { return sku; }
    public Price getPrice() { return price; }
    public UnitOfMeasure getUnitOfMeasure() { return unitOfMeasure; }
    public ProductCategory getCategory() { return category; }
    public ProductStatus getStatus() { return status; }
}
