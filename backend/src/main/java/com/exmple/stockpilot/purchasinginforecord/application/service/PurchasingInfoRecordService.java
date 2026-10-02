package com.exmple.stockpilot.purchasinginforecord.application.service;

import com.exmple.stockpilot.product.application.port.out.ProductRepository;
import com.exmple.stockpilot.product.domain.model.Product;
import com.exmple.stockpilot.product.domain.valueobject.ProductId;
import com.exmple.stockpilot.purchasinginforecord.infrastructure.persistence.PurchasingInfoRecordJpaEntity;
import com.exmple.stockpilot.purchasinginforecord.infrastructure.persistence.SpringDataPurchasingInfoRecordRepository;
import com.exmple.stockpilot.purchasinginforecord.presentation.CreatePurchasingInfoRecordRequest;
import com.exmple.stockpilot.purchasinginforecord.presentation.PurchasingInfoRecordResponse;
import com.exmple.stockpilot.supplier.application.port.out.SupplierRepository;
import com.exmple.stockpilot.supplier.domain.model.Supplier;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PurchasingInfoRecordService {

    private final SpringDataPurchasingInfoRecordRepository repository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    @Transactional
    public PurchasingInfoRecordResponse createOrUpdate(CreatePurchasingInfoRecordRequest request) {
        Product product = productRepository.findById(ProductId.from(request.productId()))
                .orElseThrow(() -> new NoSuchElementException("Product not found: " + request.productId()));

        Supplier supplier = supplierRepository.findById(SupplierId.from(request.supplierId()))
                .orElseThrow(() -> new NoSuchElementException("Supplier not found: " + request.supplierId()));

        Optional<PurchasingInfoRecordJpaEntity> existing = repository.findByProductIdAndSupplierId(request.productId(), request.supplierId());

        PurchasingInfoRecordJpaEntity entity;
        if (existing.isPresent()) {
            entity = existing.get();
            entity.setSupplierPartNumber(request.supplierPartNumber() != null ? request.supplierPartNumber().trim() : entity.getSupplierPartNumber());
            entity.setBaseUnitPrice(request.baseUnitPrice() != null ? request.baseUnitPrice() : entity.getBaseUnitPrice());
            entity.setCurrency(request.currency() != null ? request.currency() : entity.getCurrency());
            if (request.leadTimeDays() != null) entity.setLeadTimeDays(request.leadTimeDays());
            if (request.minOrderQuantity() != null) entity.setMinOrderQuantity(request.minOrderQuantity());
            if (request.discountTierQuantity() != null) entity.setDiscountTierQuantity(request.discountTierQuantity());
            if (request.discountPercentage() != null) entity.setDiscountPercentage(request.discountPercentage());
            if (request.preferred() != null) entity.setPreferred(request.preferred());
        } else {
            entity = PurchasingInfoRecordJpaEntity.builder()
                    .id(UUID.randomUUID())
                    .productId(product.getId().value())
                    .supplierId(supplier.getId().value())
                    .supplierPartNumber(request.supplierPartNumber() != null ? request.supplierPartNumber().trim() : "REF-" + product.getSku().value())
                    .baseUnitPrice(request.baseUnitPrice() != null ? request.baseUnitPrice() : product.getPrice().amount())
                    .currency(request.currency() != null ? request.currency() : supplier.getCurrency())
                    .leadTimeDays(request.leadTimeDays() != null ? request.leadTimeDays() : 5)
                    .minOrderQuantity(request.minOrderQuantity() != null ? request.minOrderQuantity() : 1)
                    .discountTierQuantity(request.discountTierQuantity() != null ? request.discountTierQuantity() : 0)
                    .discountPercentage(request.discountPercentage() != null ? request.discountPercentage() : BigDecimal.ZERO)
                    .preferred(Boolean.TRUE.equals(request.preferred()))
                    .active(true)
                    .build();
        }

        PurchasingInfoRecordJpaEntity saved = repository.save(entity);
        log.info("PIR created/updated for Product: {} and Supplier: {}", product.getSku().value(), supplier.getName());

        return PurchasingInfoRecordResponse.from(saved, product.getName(), product.getSku().value(), supplier.getName());
    }

    @Transactional(readOnly = true)
    public List<PurchasingInfoRecordResponse> getByProductId(UUID productId) {
        Product product = productRepository.findById(ProductId.from(productId))
                .orElseThrow(() -> new NoSuchElementException("Product not found: " + productId));

        return repository.findByProductId(productId).stream()
                .map(entity -> {
                    String supplierName = supplierRepository.findById(SupplierId.from(entity.getSupplierId()))
                            .map(Supplier::getName)
                            .orElse("Fournisseur Inconnu");
                    return PurchasingInfoRecordResponse.from(entity, product.getName(), product.getSku().value(), supplierName);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PurchasingInfoRecordResponse> getAll() {
        return repository.findAll().stream()
                .map(entity -> {
                    String productName = productRepository.findById(ProductId.from(entity.getProductId()))
                            .map(Product::getName)
                            .orElse("Article Inconnu");
                    String productSku = productRepository.findById(ProductId.from(entity.getProductId()))
                            .map(p -> p.getSku().value())
                            .orElse("");
                    String supplierName = supplierRepository.findById(SupplierId.from(entity.getSupplierId()))
                            .map(Supplier::getName)
                            .orElse("Fournisseur Inconnu");
                    return PurchasingInfoRecordResponse.from(entity, productName, productSku, supplierName);
                })
                .toList();
    }

    @Transactional
    public PurchasingInfoRecordResponse update(UUID id, CreatePurchasingInfoRecordRequest request) {
        PurchasingInfoRecordJpaEntity entity = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("PIR not found with id: " + id));

        if (request.supplierPartNumber() != null) entity.setSupplierPartNumber(request.supplierPartNumber().trim());
        if (request.baseUnitPrice() != null) entity.setBaseUnitPrice(request.baseUnitPrice());
        if (request.currency() != null) entity.setCurrency(request.currency());
        if (request.leadTimeDays() != null) entity.setLeadTimeDays(request.leadTimeDays());
        if (request.minOrderQuantity() != null) entity.setMinOrderQuantity(request.minOrderQuantity());
        if (request.discountTierQuantity() != null) entity.setDiscountTierQuantity(request.discountTierQuantity());
        if (request.discountPercentage() != null) entity.setDiscountPercentage(request.discountPercentage());
        if (request.preferred() != null) entity.setPreferred(request.preferred());

        PurchasingInfoRecordJpaEntity saved = repository.save(entity);
        Product product = productRepository.findById(ProductId.from(saved.getProductId())).orElse(null);
        Supplier supplier = supplierRepository.findById(SupplierId.from(saved.getSupplierId())).orElse(null);
        String productName = product != null ? product.getName() : "Article Inconnu";
        String productSku = product != null ? product.getSku().value() : "";
        String supplierName = supplier != null ? supplier.getName() : "Fournisseur Inconnu";

        return PurchasingInfoRecordResponse.from(saved, productName, productSku, supplierName);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
