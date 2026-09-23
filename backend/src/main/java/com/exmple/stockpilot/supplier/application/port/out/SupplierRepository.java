package com.exmple.stockpilot.supplier.application.port.out;

import com.exmple.stockpilot.supplier.domain.model.Supplier;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository {
    Supplier save(Supplier supplier);
    Optional<Supplier> findById(SupplierId id);
    List<Supplier> getAllSuppliers();
    void deleteById(SupplierId id);
}
