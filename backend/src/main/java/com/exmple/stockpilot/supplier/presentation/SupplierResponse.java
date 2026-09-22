package com.exmple.stockpilot.supplier.presentation;

import com.exmple.stockpilot.supplier.domain.model.Supplier;

import java.util.UUID;

public record SupplierResponse(
        UUID id,
        String name,
        String email,
        String phoneNumber,
        String address,
        String taxNumber,
        String paymentTerms,
        String currency,
        String status
) {
    public static SupplierResponse from(Supplier supplier) {
        return new SupplierResponse(
                supplier.getId().value(),
                supplier.getName(),
                supplier.getContactInfo().email(),
                supplier.getContactInfo().phoneNumber(),
                supplier.getAddress(),
                supplier.getTaxNumber(),
                supplier.getPaymentTerms(),
                supplier.getCurrency(),
                supplier.getStatus().name()
        );
    }
}
