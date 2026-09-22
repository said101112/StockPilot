package com.exmple.stockpilot.product.application.port.in;

public interface CreateProductUseCase {
    ProductResponse create(CreateProductCommand command);
}
