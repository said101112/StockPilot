package com.exmple.stockpilot.supplier.application.port.in;

import java.util.UUID;

public interface DeleteSupplierUseCase {
    void delete(UUID id);
}
