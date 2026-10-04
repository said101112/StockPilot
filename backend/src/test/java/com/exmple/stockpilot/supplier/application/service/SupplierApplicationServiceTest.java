package com.exmple.stockpilot.supplier.application.service;

import com.exmple.stockpilot.supplier.application.port.out.SupplierRepository;
import com.exmple.stockpilot.supplier.domain.exception.SupplierNotFoundException;
import com.exmple.stockpilot.supplier.domain.model.Supplier;
import com.exmple.stockpilot.supplier.domain.valueObject.ContactInfo;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;
import com.exmple.stockpilot.supplier.presentation.CreateSupplierRequest;
import com.exmple.stockpilot.supplier.presentation.SupplierResponse;
import com.exmple.stockpilot.supplier.presentation.UpdateSupplierRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SupplierApplicationService Unit Tests")
class SupplierApplicationServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    private SupplierApplicationService service;

    @BeforeEach
    void setUp() {
        service = new SupplierApplicationService(supplierRepository);
    }

    @Test
    @DisplayName("Should create supplier successfully")
    void shouldCreateSupplierSuccessfully() {
        CreateSupplierRequest request = new CreateSupplierRequest(
                "Acme Corp",
                "contact@acme.com",
                "+33123456789",
                "10 Rue de la Paix, Paris",
                "FR123456789",
                "NET30",
                "EUR"
        );

        when(supplierRepository.save(any(Supplier.class))).thenAnswer(inv -> inv.getArgument(0));

        SupplierResponse response = service.create(request);

        assertNotNull(response);
        assertEquals("Acme Corp", response.name());
        assertEquals("contact@acme.com", response.email());
        assertEquals("+33123456789", response.phoneNumber());
        verify(supplierRepository, times(1)).save(any(Supplier.class));
    }

    @Test
    @DisplayName("Should return all suppliers")
    void shouldReturnAllSuppliers() {
        Supplier s1 = Supplier.create("Supplier 1", ContactInfo.of("s1@test.com", "0102030405"), "Address 1", "TAX1", "NET30", "EUR");
        Supplier s2 = Supplier.create("Supplier 2", ContactInfo.of("s2@test.com", "0607080910"), "Address 2", "TAX2", "NET60", "USD");

        when(supplierRepository.getAllSuppliers()).thenReturn(List.of(s1, s2));

        List<SupplierResponse> result = service.getAllSuppliers();

        assertEquals(2, result.size());
        verify(supplierRepository, times(1)).getAllSuppliers();
    }

    @Test
    @DisplayName("Should return supplier by ID")
    void shouldReturnSupplierById() {
        UUID id = UUID.randomUUID();
        Supplier supplier = Supplier.create("Global Parts", ContactInfo.of("info@global.com", "+12345"), "Lyon", "FR999", "NET30", "EUR");

        when(supplierRepository.findById(SupplierId.from(id))).thenReturn(Optional.of(supplier));

        SupplierResponse response = service.getSupplierById(id);

        assertNotNull(response);
        assertEquals("Global Parts", response.name());
    }

    @Test
    @DisplayName("Should throw SupplierNotFoundException when supplier not found by ID")
    void shouldThrowWhenSupplierNotFound() {
        UUID id = UUID.randomUUID();
        when(supplierRepository.findById(SupplierId.from(id))).thenReturn(Optional.empty());

        assertThrows(SupplierNotFoundException.class, () -> service.getSupplierById(id));
    }

    @Test
    @DisplayName("Should update supplier details")
    void shouldUpdateSupplier() {
        UUID id = UUID.randomUUID();
        Supplier supplier = Supplier.create("Old Corp", ContactInfo.of("old@corp.com", "+33111"), "Paris", "FR11", "NET30", "EUR");

        when(supplierRepository.findById(SupplierId.from(id))).thenReturn(Optional.of(supplier));
        when(supplierRepository.save(any(Supplier.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateSupplierRequest request = new UpdateSupplierRequest(
                "New Corp",
                "new@corp.com",
                "+33222",
                "Marseille",
                "FR22",
                "NET60",
                "EUR",
                "ACTIVE"
        );

        SupplierResponse response = service.update(id, request);

        assertEquals("New Corp", response.name());
        assertEquals("new@corp.com", response.email());
        verify(supplierRepository, times(1)).save(supplier);
    }

    @Test
    @DisplayName("Should delete supplier successfully")
    void shouldDeleteSupplier() {
        UUID id = UUID.randomUUID();
        Supplier supplier = Supplier.create("ToDelete", ContactInfo.of("del@test.com", "+33999"), "Lille", "FR00", "NET30", "EUR");

        when(supplierRepository.findById(SupplierId.from(id))).thenReturn(Optional.of(supplier));

        service.delete(id);

        verify(supplierRepository, times(1)).deleteById(SupplierId.from(id));
    }
}
