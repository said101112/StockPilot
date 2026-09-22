package com.exmple.stockpilot.Warehouse.infrastructure.persistence;

import com.exmple.stockpilot.Warehouse.application.port.out.WarehouseRepository;
import com.exmple.stockpilot.Warehouse.domain.enums.WarehouseStatus;
import com.exmple.stockpilot.Warehouse.domain.model.Warehouse;
import com.exmple.stockpilot.Warehouse.domain.valueObject.Location;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class WarehousePersistenceAdapter implements WarehouseRepository {

    private final SpringDataWarehouseRepository springDataWarehouseRepository;

    public WarehousePersistenceAdapter(SpringDataWarehouseRepository springDataWarehouseRepository) {
        this.springDataWarehouseRepository = springDataWarehouseRepository;
    }

    @Override
    public Warehouse save(Warehouse warehouse) {
        WarehouseJpaEntity entity = toJpaEntity(warehouse);
        WarehouseJpaEntity savedEntity = springDataWarehouseRepository.save(entity);
        return toDomainModel(savedEntity);
    }

    @Override
    public Optional<Warehouse> findById(WarehouseId id) {
        return springDataWarehouseRepository.findById(id.value())
                .map(this::toDomainModel);
    }

    @Override
    public List<Warehouse> findAll() {
        return springDataWarehouseRepository.findAll()
                .stream()
                .map(this::toDomainModel)
                .toList();
    }

    private WarehouseJpaEntity toJpaEntity(Warehouse warehouse) {
        return new WarehouseJpaEntity(
                warehouse.getId().value(),
                warehouse.getName(),
                warehouse.getLocation().address(),
                warehouse.getLocation().city(),
                warehouse.getLocation().country(),
                warehouse.getLocation().zipCode(),
                warehouse.getStatus().name()
        );
    }

    private Warehouse toDomainModel(WarehouseJpaEntity entity) {
        return new Warehouse(
                WarehouseId.from(entity.getId()),
                entity.getName(),
                Location.create(
                        entity.getAddress(),
                        entity.getCity(),
                        entity.getCountry(),
                        entity.getZipCode()
                ),
                WarehouseStatus.valueOf(entity.getStatus())
        );
    }
}
