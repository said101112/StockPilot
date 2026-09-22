package com.exmple.stockpilot.Warehouse.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

interface SpringDataWarehouseRepository extends JpaRepository<WarehouseJpaEntity, UUID> {
}
