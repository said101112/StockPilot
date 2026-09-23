package com.exmple.stockpilot.product.application.port.in;

import com.exmple.stockpilot.product.presentation.UpdateProductRequest;
import java.util.UUID;

public interface UpdateProductUseCase {
    ProductResponse update(UUID id, UpdateProductRequest request);
}
