package com.exmple.stockpilot.purchaseorder.application.port.in;

import com.exmple.stockpilot.purchaseorder.domain.enums.PurchaseOrderStatus;
import com.exmple.stockpilot.purchaseorder.presentation.PurchaseOrderResponse;

import java.util.List;
import java.util.UUID;

public interface GetPurchaseOrderUseCase {
    List<PurchaseOrderResponse> getAllOrders();
    List<PurchaseOrderResponse> getOrdersByStatus(PurchaseOrderStatus status);
    PurchaseOrderResponse getOrderById(UUID id);
    PurchaseOrderResponse getOrderByPoNumber(String poNumber);
}
