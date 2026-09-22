package com.exmple.stockpilot.goodsreceipt.application.port.in;

import com.exmple.stockpilot.goodsreceipt.presentation.CreateGoodsReceiptRequest;
import com.exmple.stockpilot.goodsreceipt.presentation.GoodsReceiptResponse;

public interface CreateGoodsReceiptUseCase {
    GoodsReceiptResponse createGoodsReceipt(CreateGoodsReceiptRequest request);
}
