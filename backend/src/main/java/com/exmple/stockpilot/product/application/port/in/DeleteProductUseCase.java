package com.exmple.stockpilot.product.application.port.in;

import java.util.UUID;

public interface DeleteProductUseCase {
    void delete(UUID id);
}
