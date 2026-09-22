package com.exmple.stockpilot.supplier.domain.exception;

import java.util.UUID;

public class SupplierNotFoundException extends RuntimeException {
    public SupplierNotFoundException(UUID id) {
        super("Supplier not found with ID: " + id);
    }
}
