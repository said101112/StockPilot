package com.exmple.stockpilot.supplier.application.port.in;

import com.exmple.stockpilot.supplier.presentation.SupplierResponse;

import java.util.UUID;

public interface GetSupplierByIdUseCase {
    SupplierResponse getSupplierById(UUID id);
}
