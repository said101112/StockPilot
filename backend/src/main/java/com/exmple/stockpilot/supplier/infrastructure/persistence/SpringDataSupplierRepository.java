package com.exmple.stockpilot.supplier.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

interface SpringDataSupplierRepository extends JpaRepository<SupplierJpaEntity, UUID> {
}
