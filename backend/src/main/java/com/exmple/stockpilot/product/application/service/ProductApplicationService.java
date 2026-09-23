package com.exmple.stockpilot.product.application.service;

import com.exmple.stockpilot.product.application.port.in.CreateProductCommand;
import com.exmple.stockpilot.product.application.port.in.CreateProductUseCase;
import com.exmple.stockpilot.product.application.port.in.GetProductsUseCase;
import com.exmple.stockpilot.product.application.port.in.ProductResponse;
import com.exmple.stockpilot.product.application.port.out.ProductRepository;
import com.exmple.stockpilot.product.domain.model.Product;
import com.exmple.stockpilot.product.domain.valueobject.Price;
import com.exmple.stockpilot.product.domain.valueobject.ProductCategory;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.product.domain.valueobject.SKU;
import com.exmple.stockpilot.product.domain.valueobject.UnitOfMeasure;
import com.exmple.stockpilot.product.application.port.in.DeleteProductUseCase;
import com.exmple.stockpilot.product.application.port.in.UpdateProductUseCase;
import com.exmple.stockpilot.product.presentation.UpdateProductRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class ProductApplicationService implements CreateProductUseCase, GetProductsUseCase, UpdateProductUseCase, DeleteProductUseCase {

    private final ProductRepository productRepository;

    public ProductApplicationService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ProductResponse create(CreateProductCommand command) {
        // 1. Instanciation des Value Objects (validation automatique par les records/types forts)
        SKU sku = SKU.of(command.sku());
        Price price = Price.of(command.priceAmount(), command.currency());
        UnitOfMeasure uom = UnitOfMeasure.of(command.unitOfMeasure() != null && !command.unitOfMeasure().isBlank() 
                ? command.unitOfMeasure() 
                : "PCS");
        ProductCategory category = ProductCategory.fromString(command.category());

        // 2. Création de l'Entité Métier (Invariants du domaine)
        Product product = Product.create(
                command.name(),
                command.description(),
                sku,
                price,
                uom,
                category
        );

        // 3. Sauvegarde via le Port Outbound (Abstraction de la persistance)
        Product savedProduct = productRepository.save(product);

        // 4. Conversion en DTO de réponse
        return ProductResponse.from(savedProduct);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Override
    public ProductResponse getProductById(UUID id) {
        return productRepository.findById(ProductId.from(id))
                .map(ProductResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Product not found with id: " + id));
    }

    @Override
    public ProductResponse getProductBySku(String sku) {
        return productRepository.findBySku(SKU.of(sku))
                .map(ProductResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Product not found with SKU: " + sku));
    }

    @Override
    public ProductResponse update(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(ProductId.from(id))
                .orElseThrow(() -> new NoSuchElementException("Product not found with id: " + id));

        Price price = request.price() != null 
                ? Price.of(request.price(), request.currency() != null ? request.currency() : product.getPrice().currency())
                : product.getPrice();
        UnitOfMeasure uom = request.unitOfMeasure() != null && !request.unitOfMeasure().isBlank()
                ? UnitOfMeasure.of(request.unitOfMeasure())
                : product.getUnitOfMeasure();
        ProductCategory category = request.category() != null
                ? ProductCategory.fromString(request.category())
                : product.getCategory();

        product.updateDetails(request.name(), request.description(), price, uom, category);
        Product saved = productRepository.save(product);
        return ProductResponse.from(saved);
    }

    @Override
    public void delete(UUID id) {
        productRepository.deleteById(ProductId.from(id));
    }
}
