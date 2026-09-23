package com.exmple.stockpilot.supplier.application.port.in;

import com.exmple.stockpilot.supplier.presentation.SupplierResponse;
import com.exmple.stockpilot.supplier.presentation.UpdateSupplierRequest;

import java.util.UUID;

public interface UpdateSupplierUseCase {
    SupplierResponse update(UUID id, UpdateSupplierRequest request);
}
