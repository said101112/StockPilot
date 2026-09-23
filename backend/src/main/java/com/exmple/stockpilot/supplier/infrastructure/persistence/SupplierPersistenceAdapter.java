package com.exmple.stockpilot.supplier.infrastructure.persistence;

import com.exmple.stockpilot.supplier.application.port.out.SupplierRepository;
import com.exmple.stockpilot.supplier.domain.enums.SupplierStatus;
import com.exmple.stockpilot.supplier.domain.model.Supplier;
import com.exmple.stockpilot.supplier.domain.valueObject.ContactInfo;
import com.exmple.stockpilot.supplier.domain.valueObject.SupplierId;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class SupplierPersistenceAdapter implements SupplierRepository {

    private final SpringDataSupplierRepository springDataSupplierRepository;

    public SupplierPersistenceAdapter(SpringDataSupplierRepository springDataSupplierRepository) {
        this.springDataSupplierRepository = springDataSupplierRepository;
    }

    @Override
    public Supplier save(Supplier supplier) {
        SupplierJpaEntity entity = toJpaEntity(supplier);
        SupplierJpaEntity savedEntity = springDataSupplierRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public List<Supplier> getAllSuppliers() {
        return springDataSupplierRepository.findAll()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<Supplier> findById(SupplierId id) {
        return springDataSupplierRepository.findById(id.value())
                .map(this::toDomain);
    }

    @Override
    public void deleteById(SupplierId id) {
        springDataSupplierRepository.deleteById(id.value());
    }

    private Supplier toDomain(SupplierJpaEntity entity) {
        return new Supplier(
                SupplierId.from(entity.getId()),
                entity.getName(),
                ContactInfo.of(entity.getEmail(), entity.getPhoneNumber()),
                entity.getAddress(),
                entity.getTaxNumber(),
                entity.getPaymentTerms(),
                entity.getCurrency(),
                SupplierStatus.valueOf(entity.getStatus())
        );
    }

    private SupplierJpaEntity toJpaEntity(Supplier supplier) {
        return new SupplierJpaEntity(
                supplier.getId().value(),
                supplier.getName(),
                supplier.getContactInfo().email(),
                supplier.getContactInfo().phoneNumber(),
                supplier.getAddress(),
                supplier.getTaxNumber(),
                supplier.getPaymentTerms(),
                supplier.getCurrency(),
                supplier.getStatus().name()
        );
    }
}
