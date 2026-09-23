package com.exmple.stockpilot.supplier.presentation;

public record UpdateSupplierRequest(
        String name,
        String email,
        String phoneNumber,
        String address,
        String taxNumber,
        String paymentTerms,
        String currency,
        String status
) {
}
