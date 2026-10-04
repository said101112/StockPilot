package com.exmple.stockpilot.product.application.service;

import com.exmple.stockpilot.product.application.port.in.CreateProductCommand;
import com.exmple.stockpilot.product.application.port.in.ProductResponse;
import com.exmple.stockpilot.product.application.port.out.ProductRepository;
import com.exmple.stockpilot.product.domain.model.Product;
import com.exmple.stockpilot.product.domain.valueobject.Price;
import com.exmple.stockpilot.product.domain.valueobject.ProductCategory;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.product.domain.valueobject.SKU;
import com.exmple.stockpilot.product.domain.valueobject.UnitOfMeasure;
import com.exmple.stockpilot.product.presentation.UpdateProductRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductApplicationService Unit Tests")
class ProductApplicationServiceTest {

    @Mock
    private ProductRepository productRepository;

    private ProductApplicationService service;

    @BeforeEach
    void setUp() {
        service = new ProductApplicationService(productRepository);
    }

    @Test
    @DisplayName("Should create product successfully via application service")
    void shouldCreateProductSuccessfully() {
        CreateProductCommand command = new CreateProductCommand(
                "Steel Pipe",
                "Industrial pipe",
                "SKU-PIPE-10",
                new BigDecimal("49.99"),
                "EUR",
                "PCS",
                "RAW_MATERIAL"
        );

        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse response = service.create(command);

        assertNotNull(response);
        assertEquals("Steel Pipe", response.name());
        assertEquals("SKU-PIPE-10", response.sku());
        assertEquals(new BigDecimal("49.99"), response.price());
        assertEquals("EUR", response.currency());

        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should return product by ID when present")
    void shouldReturnProductById() {
        UUID id = UUID.randomUUID();
        Product product = Product.create(
                "Hydraulic Valve",
                "High pressure valve",
                SKU.of("SKU-VALVE-01"),
                Price.of(new BigDecimal("120.00"), "EUR"),
                UnitOfMeasure.of("PCS"),
                ProductCategory.SPARE_PART
        );

        when(productRepository.findById(ProductId.from(id))).thenReturn(Optional.of(product));

        ProductResponse response = service.getProductById(id);

        assertNotNull(response);
        assertEquals("Hydraulic Valve", response.name());
        assertEquals("SKU-VALVE-01", response.sku());
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when product not found by ID")
    void shouldThrowWhenProductNotFoundById() {
        UUID id = UUID.randomUUID();
        when(productRepository.findById(ProductId.from(id))).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.getProductById(id));
    }

    @Test
    @DisplayName("Should return all products")
    void shouldReturnAllProducts() {
        Product p1 = Product.create("Item 1", "Desc 1", SKU.of("SKU-1"), Price.of(BigDecimal.TEN, "EUR"), UnitOfMeasure.of("PCS"), ProductCategory.FINISHED_GOOD);
        Product p2 = Product.create("Item 2", "Desc 2", SKU.of("SKU-2"), Price.of(BigDecimal.ONE, "EUR"), UnitOfMeasure.of("PCS"), ProductCategory.RAW_MATERIAL);

        when(productRepository.findAll()).thenReturn(List.of(p1, p2));

        List<ProductResponse> all = service.getAllProducts();

        assertEquals(2, all.size());
    }

    @Test
    @DisplayName("Should update product details")
    void shouldUpdateProduct() {
        UUID id = UUID.randomUUID();
        Product product = Product.create(
                "Old Name",
                "Old Desc",
                SKU.of("SKU-UPD"),
                Price.of(new BigDecimal("10.00"), "EUR"),
                UnitOfMeasure.of("PCS"),
                ProductCategory.RAW_MATERIAL
        );

        when(productRepository.findById(ProductId.from(id))).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProductRequest req = new UpdateProductRequest(
                "New Name",
                "New Desc",
                new BigDecimal("15.50"),
                "EUR",
                "BOX",
                "SPARE_PARTS"
        );

        ProductResponse updated = service.update(id, req);

        assertEquals("New Name", updated.name());
        assertEquals("New Desc", updated.description());
        assertEquals(new BigDecimal("15.50"), updated.price());
        verify(productRepository, times(1)).save(product);
    }

    @Test
    @DisplayName("Should delete product by ID")
    void shouldDeleteProduct() {
        UUID id = UUID.randomUUID();

        service.delete(id);

        verify(productRepository, times(1)).deleteById(ProductId.from(id));
    }
}
