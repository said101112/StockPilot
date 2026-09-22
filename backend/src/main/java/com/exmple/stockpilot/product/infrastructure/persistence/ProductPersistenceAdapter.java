package com.exmple.stockpilot.product.infrastructure.persistence;

import com.exmple.stockpilot.product.application.port.out.ProductRepository;
import com.exmple.stockpilot.product.domain.model.Product;
import com.exmple.stockpilot.product.domain.valueobject.Price;
import com.exmple.stockpilot.product.domain.valueobject.ProductCategory;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.product.domain.valueobject.ProductStatus;
import com.exmple.stockpilot.product.domain.valueobject.SKU;
import com.exmple.stockpilot.product.domain.valueobject.UnitOfMeasure;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ProductPersistenceAdapter implements ProductRepository {

    private final SpringDataProductRepository springDataProductRepository;

    public ProductPersistenceAdapter(SpringDataProductRepository springDataProductRepository) {
        this.springDataProductRepository = springDataProductRepository;
    }

    @Override
    public Product save(Product product) {
        ProductJpaEntity entity = toJpaEntity(product);
        ProductJpaEntity savedEntity = springDataProductRepository.save(entity);
        return toDomainModel(savedEntity);
    }

    @Override
    public Optional<Product> findById(ProductId id) {
        return springDataProductRepository.findById(id.value())
                .map(this::toDomainModel);
    }

    @Override
    public Optional<Product> findBySku(SKU sku) {
        return springDataProductRepository.findBySku(sku.value())
                .map(this::toDomainModel);
    }

    @Override
    public List<Product> findAll() {
        return springDataProductRepository.findAll().stream()
                .map(this::toDomainModel)
                .toList();
    }

    private ProductJpaEntity toJpaEntity(Product product) {
        return new ProductJpaEntity(
                product.getId().value(),
                product.getName(),
                product.getDescription(),
                product.getSku().value(),
                product.getPrice().amount(),
                product.getPrice().currency(),
                product.getUnitOfMeasure() != null ? product.getUnitOfMeasure().value() : "PCS",
                product.getCategory() != null ? product.getCategory().name() : "FINISHED_GOOD",
                product.getStatus().name()
        );
    }

    private Product toDomainModel(ProductJpaEntity entity) {
        return new Product(
                ProductId.from(entity.getId()),
                entity.getName(),
                entity.getDescription(),
                SKU.of(entity.getSku()),
                Price.of(entity.getPrice(), entity.getCurrency()),
                UnitOfMeasure.of(entity.getUnitOfMeasure() != null ? entity.getUnitOfMeasure() : "PCS"),
                ProductCategory.fromString(entity.getCategory()),
                ProductStatus.valueOf(entity.getStatus())
        );
    }
}
