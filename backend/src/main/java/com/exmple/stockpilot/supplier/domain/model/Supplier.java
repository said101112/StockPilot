package com.exmple.stockpilot.supplier.domain.model;

import com.exmple.stockpilot.supplier.domain.enums.SupplierStatus;
import com.exmple.stockpilot.supplier.domain.valueObject.ContactInfo;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;

import java.util.Objects;

/**
 * Entité Racine d'Agrégat Fournisseur (Vendor Master).
 * Gère le référentiel des fournisseurs, les conditions de paiement et l'identification fiscale.
 */
public class Supplier {

    private final SupplierId id;
    private String name;
    private ContactInfo contactInfo;
    private String address;
    private String taxNumber;
    private String paymentTerms;
    private String currency;
    private SupplierStatus status;

    public Supplier(
            SupplierId id,
            String name,
            ContactInfo contactInfo,
            String address,
            String taxNumber,
            String paymentTerms,
            String currency,
            SupplierStatus status
    ) {
        this.id = Objects.requireNonNull(id, "SupplierId cannot be null");
        
        if (name == null || name.trim().length() < 2) {
            throw new IllegalArgumentException("Supplier name must have at least 2 characters");
        }
        this.name = name.trim();
        this.contactInfo = Objects.requireNonNull(contactInfo, "ContactInfo cannot be null");
        this.address = address != null ? address.trim() : "";
        this.taxNumber = taxNumber != null ? taxNumber.trim() : "";
        this.paymentTerms = paymentTerms != null && !paymentTerms.isBlank() ? paymentTerms.trim() : "NET_30";
        this.currency = currency != null && !currency.isBlank() ? currency.trim().toUpperCase() : "EUR";
        this.status = status != null ? status : SupplierStatus.ACTIVE;
    }

    // Static Factory Method pour la création d'un NOUVEAU fournisseur
    public static Supplier create(
            String name,
            ContactInfo contactInfo,
            String address,
            String taxNumber,
            String paymentTerms,
            String currency
    ) {
        return new Supplier(
                SupplierId.generate(),
                name,
                contactInfo,
                address,
                taxNumber,
                paymentTerms,
                currency,
                SupplierStatus.ACTIVE
        );
    }

    // Méthodes métier
    public void deactivate() {
        this.status = SupplierStatus.INACTIVE;
    }

    public void activate() {
        this.status = SupplierStatus.ACTIVE;
    }

    public void updateDetails(
            String name,
            ContactInfo contactInfo,
            String address,
            String taxNumber,
            String paymentTerms,
            String currency,
            SupplierStatus status
    ) {
        if (name == null || name.trim().length() < 2) {
            throw new IllegalArgumentException("Supplier name must have at least 2 characters");
        }
        this.name = name.trim();
        this.contactInfo = Objects.requireNonNull(contactInfo, "ContactInfo cannot be null");
        this.address = address != null ? address.trim() : "";
        this.taxNumber = taxNumber != null ? taxNumber.trim() : "";
        if (paymentTerms != null && !paymentTerms.isBlank()) {
            this.paymentTerms = paymentTerms.trim();
        }
        if (currency != null && !currency.isBlank()) {
            this.currency = currency.trim().toUpperCase();
        }
        if (status != null) {
            this.status = status;
        }
    }

    // Getters
    public SupplierId getId() { return id; }
    public String getName() { return name; }
    public ContactInfo getContactInfo() { return contactInfo; }
    public String getAddress() { return address; }
    public String getTaxNumber() { return taxNumber; }
    public String getPaymentTerms() { return paymentTerms; }
    public String getCurrency() { return currency; }
    public SupplierStatus getStatus() { return status; }
}
