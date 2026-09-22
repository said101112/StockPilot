package com.exmple.stockpilot.purchaseorder.application.port.out;

import com.exmple.stockpilot.purchaseorder.domain.enums.PurchaseOrderStatus;
import com.exmple.stockpilot.purchaseorder.domain.model.PurchaseOrder;
import com.exmple.stockpilot.purchaseorder.domain.valueobject.PurchaseOrderId;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository {

    PurchaseOrder save(PurchaseOrder po);

    Optional<PurchaseOrder> findById(PurchaseOrderId id);

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    List<PurchaseOrder> findAll();

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);
}
