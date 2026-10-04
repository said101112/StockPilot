package com.exmple.stockpilot.stockmovement.application.service;

import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockmovement.application.port.out.StockMovementRepository;
import com.exmple.stockpilot.stockmovement.domain.enums.MovementType;
import com.exmple.stockpilot.stockmovement.domain.model.StockMovement;
import com.exmple.stockpilot.stockmovement.presentation.StockMovementResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StockMovementService Unit Tests")
class StockMovementServiceTest {

    @Mock
    private StockMovementRepository repository;

    private StockMovementService service;

    @BeforeEach
    void setUp() {
        service = new StockMovementService(repository);
    }

    @Test
    @DisplayName("Should record stock movement successfully")
    void shouldRecordMovement() {
        UUID prodId = UUID.randomUUID();
        UUID whId = UUID.randomUUID();

        when(repository.save(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        StockMovementResponse response = service.recordMovement(
                prodId,
                whId,
                MovementType.GOODS_RECEIPT_PO,
                25,
                "DOC-REC-101"
        );

        assertNotNull(response);
        assertEquals(prodId, response.productId());
        assertEquals(whId, response.warehouseId());
        assertEquals("GOODS_RECEIPT_PO", response.type());
        assertEquals(25, response.quantity());
        assertEquals("DOC-REC-101", response.referenceDocument());
        verify(repository, times(1)).save(any(StockMovement.class));
    }

    @Test
    @DisplayName("Should get movements by product ID")
    void shouldGetMovementsByProductId() {
        UUID prodId = UUID.randomUUID();
        when(repository.findByProductId(ProductId.from(prodId))).thenReturn(List.of());

        List<StockMovementResponse> result = service.getMovementsByProductId(prodId);

        assertNotNull(result);
        verify(repository, times(1)).findByProductId(ProductId.from(prodId));
    }
}
