package com.exmple.stockpilot.purchaserequisition.application.service;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchaserequisition.application.port.out.PurchaseRequisitionRepository;
import com.exmple.stockpilot.purchaserequisition.domain.enums.PurchaseRequisitionStatus;
import com.exmple.stockpilot.purchaserequisition.domain.model.PurchaseRequisition;
import com.exmple.stockpilot.purchaserequisition.domain.valueobject.PurchaseRequisitionId;
import com.exmple.stockpilot.purchaserequisition.presentation.CreatePurchaseRequisitionRequest;
import com.exmple.stockpilot.purchaserequisition.presentation.PurchaseRequisitionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PurchaseRequisitionService Unit Tests")
class PurchaseRequisitionServiceTest {

    @Mock
    private PurchaseRequisitionRepository repository;

    private PurchaseRequisitionService service;

    @BeforeEach
    void setUp() {
        service = new PurchaseRequisitionService(repository);
    }

    @Test
    @DisplayName("Should create purchase requisition in DRAFT status")
    void shouldCreatePurchaseRequisition() {
        CreatePurchaseRequisitionRequest request = new CreatePurchaseRequisitionRequest(
                UUID.randomUUID().toString(),
                UUID.randomUUID().toString(),
                100,
                LocalDate.now().plusDays(10),
                "Production replenishment"
        );

        when(repository.save(any(PurchaseRequisition.class))).thenAnswer(inv -> inv.getArgument(0));

        PurchaseRequisitionResponse response = service.createRequisition(request);

        assertNotNull(response);
        assertEquals("DRAFT", response.status());
        assertEquals(100, response.requestedQuantity());
        verify(repository, times(1)).save(any(PurchaseRequisition.class));
    }

    @Test
    @DisplayName("Should submit purchase requisition")
    void shouldSubmitRequisition() {
        UUID id = UUID.randomUUID();
        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-0001",
                ProductId.from(UUID.randomUUID()),
                WarehouseId.from(UUID.randomUUID()),
                50,
                LocalDate.now().plusDays(5),
                "Restock"
        );

        when(repository.findById(PurchaseRequisitionId.from(id))).thenReturn(Optional.of(pr));
        when(repository.save(any(PurchaseRequisition.class))).thenAnswer(inv -> inv.getArgument(0));

        PurchaseRequisitionResponse response = service.submitRequisition(id);

        assertEquals("SUBMITTED", response.status());
        verify(repository, times(1)).save(pr);
    }

    @Test
    @DisplayName("Should approve submitted requisition")
    void shouldApproveRequisition() {
        UUID id = UUID.randomUUID();
        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-0002",
                ProductId.from(UUID.randomUUID()),
                WarehouseId.from(UUID.randomUUID()),
                50,
                LocalDate.now().plusDays(5),
                "Restock"
        );
        pr.submit();

        when(repository.findById(PurchaseRequisitionId.from(id))).thenReturn(Optional.of(pr));
        when(repository.save(any(PurchaseRequisition.class))).thenAnswer(inv -> inv.getArgument(0));

        PurchaseRequisitionResponse response = service.approveRequisition(id);

        assertEquals("APPROVED", response.status());
        verify(repository, times(1)).save(pr);
    }

    @Test
    @DisplayName("Should reject submitted requisition with reason")
    void shouldRejectRequisition() {
        UUID id = UUID.randomUUID();
        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-0003",
                ProductId.from(UUID.randomUUID()),
                WarehouseId.from(UUID.randomUUID()),
                50,
                LocalDate.now().plusDays(5),
                "Restock"
        );
        pr.submit();

        when(repository.findById(PurchaseRequisitionId.from(id))).thenReturn(Optional.of(pr));
        when(repository.save(any(PurchaseRequisition.class))).thenAnswer(inv -> inv.getArgument(0));

        PurchaseRequisitionResponse response = service.rejectRequisition(id, "Budget exceeded");

        assertEquals("REJECTED", response.status());
        assertEquals("Budget exceeded", response.rejectionReason());
        verify(repository, times(1)).save(pr);
    }

    @Test
    @DisplayName("Should throw exception when attempting to delete an ORDERED requisition")
    void shouldRejectDeleteWhenAlreadyOrdered() {
        UUID id = UUID.randomUUID();
        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-0004",
                ProductId.from(UUID.randomUUID()),
                WarehouseId.from(UUID.randomUUID()),
                50,
                LocalDate.now().plusDays(5),
                "Restock"
        );
        pr.submit();
        pr.approve();
        pr.markAsOrdered();

        when(repository.findById(PurchaseRequisitionId.from(id))).thenReturn(Optional.of(pr));

        assertThrows(IllegalStateException.class, () -> service.deleteRequisition(id));
    }

    @Test
    @DisplayName("Should delete non-ordered requisition successfully")
    void shouldDeleteRequisition() {
        UUID id = UUID.randomUUID();
        PurchaseRequisition pr = PurchaseRequisition.create(
                "PR-2026-0005",
                ProductId.from(UUID.randomUUID()),
                WarehouseId.from(UUID.randomUUID()),
                50,
                LocalDate.now().plusDays(5),
                "Restock"
        );

        when(repository.findById(PurchaseRequisitionId.from(id))).thenReturn(Optional.of(pr));

        service.deleteRequisition(id);

        verify(repository, times(1)).deleteById(PurchaseRequisitionId.from(id));
    }

    @Test
    @DisplayName("Should return requisitions by status")
    void shouldReturnRequisitionsByStatus() {
        when(repository.findByStatus(PurchaseRequisitionStatus.APPROVED)).thenReturn(List.of());

        List<PurchaseRequisitionResponse> list = service.getRequisitionsByStatus(PurchaseRequisitionStatus.APPROVED);

        assertNotNull(list);
        verify(repository, times(1)).findByStatus(PurchaseRequisitionStatus.APPROVED);
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when requisition not found by ID")
    void shouldThrowWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(PurchaseRequisitionId.from(id))).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.getRequisitionById(id));
    }
}
