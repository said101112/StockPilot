package com.exmple.stockpilot.product.presentation;

import com.exmple.stockpilot.product.application.port.in.CreateProductUseCase;
import com.exmple.stockpilot.product.application.port.in.GetProductsUseCase;
import com.exmple.stockpilot.product.application.port.in.ProductResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Adaptateur Primaire (Driving Adapter) exposant l'API REST pour les Articles.
 * Rôle utilisateur : Administrateur Référentiel (Master Data Admin) ou tout utilisateur consultant le catalogue.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final CreateProductUseCase createProductUseCase;
    private final GetProductsUseCase getProductsUseCase;

    public ProductController(
            CreateProductUseCase createProductUseCase,
            GetProductsUseCase getProductsUseCase
    ) {
        this.createProductUseCase = createProductUseCase;
        this.getProductsUseCase = getProductsUseCase;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody CreateProductRequest request) {
        ProductResponse response = createProductUseCase.create(request.toCommand());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(getProductsUseCase.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(getProductsUseCase.getProductById(id));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductResponse> getProductBySku(@PathVariable String sku) {
        return ResponseEntity.ok(getProductsUseCase.getProductBySku(sku));
    }
}
