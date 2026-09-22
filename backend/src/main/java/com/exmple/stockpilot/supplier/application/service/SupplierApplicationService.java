package com.exmple.stockpilot.supplier.application.service;

import com.exmple.stockpilot.supplier.application.port.in.CreateSupplierUseCase;
import com.exmple.stockpilot.supplier.application.port.in.GetSupplierUseCase;
import com.exmple.stockpilot.supplier.application.port.out.SupplierRepository;
import com.exmple.stockpilot.supplier.domain.model.Supplier;
import com.exmple.stockpilot.supplier.domain.valueObject.ContactInfo;
import com.exmple.stockpilot.supplier.presentation.CreateSupplierRequest;
import com.exmple.stockpilot.supplier.presentation.SupplierResponse;

import com.exmple.stockpilot.supplier.application.port.in.GetSupplierByIdUseCase;
import com.exmple.stockpilot.supplier.domain.exception.SupplierNotFoundException;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class SupplierApplicationService implements CreateSupplierUseCase, GetSupplierUseCase, GetSupplierByIdUseCase {

    private final SupplierRepository supplierRepository;

    public SupplierApplicationService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Override
    public SupplierResponse create(CreateSupplierRequest request) {
        ContactInfo contactInfo = ContactInfo.of(request.email(), request.phoneNumber());

        Supplier supplier = Supplier.create(
                request.name(),
                contactInfo,
                request.address(),
                request.taxNumber(),
                request.paymentTerms(),
                request.currency()
        );

        Supplier savedSupplier = supplierRepository.save(supplier);
        return SupplierResponse.from(savedSupplier);
    }
    
    @Override
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.getAllSuppliers()
                .stream()
                .map(SupplierResponse::from)
                .toList();
    }

    @Override
    public SupplierResponse getSupplierById(UUID id) {
        Supplier supplier = supplierRepository.findById(SupplierId.from(id))
                .orElseThrow(() -> new SupplierNotFoundException(id));
        return SupplierResponse.from(supplier);
    }
}
