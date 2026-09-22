package com.exmple.stockpilot.stockmovement.application.service;

import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.stockmovement.application.port.in.GetStockMovementUseCase;
import com.exmple.stockpilot.stockmovement.application.port.in.RecordStockMovementUseCase;
import com.exmple.stockpilot.stockmovement.application.port.out.StockMovementRepository;
import com.exmple.stockpilot.stockmovement.domain.enums.MovementType;
import com.exmple.stockpilot.stockmovement.domain.model.StockMovement;
import com.exmple.stockpilot.stockmovement.presentation.StockMovementResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class StockMovementService implements RecordStockMovementUseCase, GetStockMovementUseCase {

    private final StockMovementRepository stockMovementRepository;
    private static final AtomicInteger MOV_COUNTER = new AtomicInteger((int) (System.currentTimeMillis() % 89999) + 10000);

    public StockMovementService(StockMovementRepository stockMovementRepository) {
        this.stockMovementRepository = stockMovementRepository;
    }

    @Override
    @Transactional
    public StockMovementResponse recordMovement(
            UUID productId,
            UUID warehouseId,
            MovementType type,
            int quantity,
            String referenceDocument
    ) {
        String movNumber = generateMovementNumber();
        StockMovement movement = StockMovement.create(
                movNumber,
                ProductId.from(productId),
                WarehouseId.from(warehouseId),
                type,
                quantity,
                referenceDocument
        );

        StockMovement saved = stockMovementRepository.save(movement);
        log.info("Stock movement recorded: {} | Type: {} | Qty: {} | Ref: {}", 
                saved.getMovementNumber(), saved.getType(), saved.getQuantity(), saved.getReferenceDocument());

        return StockMovementResponse.from(saved);
    }

    @Override
    public List<StockMovementResponse> getAllMovements() {
        return stockMovementRepository.findAll().stream()
                .map(StockMovementResponse::from)
                .toList();
    }

    @Override
    public List<StockMovementResponse> getMovementsByProductId(UUID productId) {
        return stockMovementRepository.findByProductId(ProductId.from(productId)).stream()
                .map(StockMovementResponse::from)
                .toList();
    }

    private synchronized String generateMovementNumber() {
        int year = LocalDate.now().getYear();
        return String.format("MOV-%d-%04d", year, MOV_COUNTER.incrementAndGet());
    }
}
