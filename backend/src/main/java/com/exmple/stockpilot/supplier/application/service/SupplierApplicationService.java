package com.exmple.stockpilot.supplier.application.service;

import com.exmple.stockpilot.supplier.application.port.in.CreateSupplierUseCase;
import com.exmple.stockpilot.supplier.application.port.in.GetSupplierUseCase;
import com.exmple.stockpilot.supplier.application.port.out.SupplierRepository;
import com.exmple.stockpilot.supplier.domain.model.Supplier;
import com.exmple.stockpilot.supplier.domain.valueObject.ContactInfo;
import com.exmple.stockpilot.supplier.presentation.CreateSupplierRequest;
import com.exmple.stockpilot.supplier.presentation.SupplierResponse;

import com.exmple.stockpilot.supplier.application.port.in.DeleteSupplierUseCase;
import com.exmple.stockpilot.supplier.application.port.in.GetSupplierByIdUseCase;
import com.exmple.stockpilot.supplier.application.port.in.UpdateSupplierUseCase;
import com.exmple.stockpilot.supplier.domain.enums.SupplierStatus;
import com.exmple.stockpilot.supplier.domain.exception.SupplierNotFoundException;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;
import com.exmple.stockpilot.supplier.presentation.UpdateSupplierRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class SupplierApplicationService implements 
        CreateSupplierUseCase, 
        GetSupplierUseCase, 
        GetSupplierByIdUseCase,
        UpdateSupplierUseCase,
        DeleteSupplierUseCase {

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

    @Override
    @Transactional
    public SupplierResponse update(UUID id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(SupplierId.from(id))
                .orElseThrow(() -> new SupplierNotFoundException(id));

        ContactInfo contactInfo = ContactInfo.of(request.email(), request.phoneNumber());
        SupplierStatus status = null;
        if (request.status() != null && !request.status().isBlank()) {
            try {
                status = SupplierStatus.valueOf(request.status().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        supplier.updateDetails(
                request.name(),
                contactInfo,
                request.address(),
                request.taxNumber(),
                request.paymentTerms(),
                request.currency(),
                status
        );

        Supplier saved = supplierRepository.save(supplier);
        return SupplierResponse.from(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        SupplierId supplierId = SupplierId.from(id);
        supplierRepository.findById(supplierId)
                .orElseThrow(() -> new SupplierNotFoundException(id));
        supplierRepository.deleteById(supplierId);
    }
}
