package com.exmple.stockpilot.product.application.port.in;

import java.util.List;
import java.util.UUID;

public interface GetProductsUseCase {
    List<ProductResponse> getAllProducts();
    ProductResponse getProductById(UUID id);
    ProductResponse getProductBySku(String sku);
}
