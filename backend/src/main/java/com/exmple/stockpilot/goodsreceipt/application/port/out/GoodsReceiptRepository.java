package com.exmple.stockpilot.goodsreceipt.application.port.out;

import com.exmple.stockpilot.goodsreceipt.domain.model.GoodsReceipt;
import com.exmple.stockpilot.goodsreceipt.domain.valueobject.GoodsReceiptId;
import com.exmple.stockpilot.purchaseorder.domain.valueobject.PurchaseOrderId;

import java.util.List;
import java.util.Optional;

public interface GoodsReceiptRepository {

    GoodsReceipt save(GoodsReceipt goodsReceipt);

    Optional<GoodsReceipt> findById(GoodsReceiptId id);

    Optional<GoodsReceipt> findByGrNumber(String grNumber);

    List<GoodsReceipt> findAll();

    List<GoodsReceipt> findByPurchaseOrderId(PurchaseOrderId purchaseOrderId);
}
