package com.exmple.stockpilot.goodsreceipt.application.port.in;

import com.exmple.stockpilot.goodsreceipt.presentation.GoodsReceiptResponse;

import java.util.List;
import java.util.UUID;

public interface GetGoodsReceiptUseCase {
    GoodsReceiptResponse getById(UUID id);
    GoodsReceiptResponse getByGrNumber(String grNumber);
    List<GoodsReceiptResponse> getAll();
    List<GoodsReceiptResponse> getByPurchaseOrderId(UUID purchaseOrderId);
}
