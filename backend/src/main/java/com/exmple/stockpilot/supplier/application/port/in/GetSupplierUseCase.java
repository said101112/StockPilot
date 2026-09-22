package com.exmple.stockpilot.supplier.application.port.in;

import java.util.List;

import com.exmple.stockpilot.supplier.presentation.SupplierResponse;

public interface GetSupplierUseCase {
    List<SupplierResponse> getAllSuppliers();
}
