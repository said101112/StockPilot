package com.exmple.stockpilot.goodsreceipt.presentation;

import com.exmple.stockpilot.goodsreceipt.application.port.in.CreateGoodsReceiptUseCase;
import com.exmple.stockpilot.goodsreceipt.application.port.in.GetGoodsReceiptUseCase;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goods-receipts")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER','USER')")
public class GoodsReceiptController {

    private final CreateGoodsReceiptUseCase createGoodsReceiptUseCase;
    private final GetGoodsReceiptUseCase getGoodsReceiptUseCase;

    public GoodsReceiptController(
            CreateGoodsReceiptUseCase createGoodsReceiptUseCase,
            GetGoodsReceiptUseCase getGoodsReceiptUseCase
    ) {
        this.createGoodsReceiptUseCase = createGoodsReceiptUseCase;
        this.getGoodsReceiptUseCase = getGoodsReceiptUseCase;
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','USER')")
    @PostMapping
    public ResponseEntity<GoodsReceiptResponse> createGoodsReceipt(@RequestBody CreateGoodsReceiptRequest request) {
        GoodsReceiptResponse response = createGoodsReceiptUseCase.createGoodsReceipt(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<GoodsReceiptResponse>> getAll() {
        return ResponseEntity.ok(getGoodsReceiptUseCase.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoodsReceiptResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(getGoodsReceiptUseCase.getById(id));
    }

    @GetMapping("/number/{grNumber}")
    public ResponseEntity<GoodsReceiptResponse> getByGrNumber(@PathVariable String grNumber) {
        return ResponseEntity.ok(getGoodsReceiptUseCase.getByGrNumber(grNumber));
    }

    @GetMapping("/purchase-order/{poId}")
    public ResponseEntity<List<GoodsReceiptResponse>> getByPurchaseOrderId(@PathVariable UUID poId) {
        return ResponseEntity.ok(getGoodsReceiptUseCase.getByPurchaseOrderId(poId));
    }
}
