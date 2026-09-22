package com.exmple.stockpilot.supplier.application.port.in;

import com.exmple.stockpilot.supplier.presentation.CreateSupplierRequest;
import com.exmple.stockpilot.supplier.presentation.SupplierResponse;

public interface CreateSupplierUseCase {
    SupplierResponse create(CreateSupplierRequest request);
}
