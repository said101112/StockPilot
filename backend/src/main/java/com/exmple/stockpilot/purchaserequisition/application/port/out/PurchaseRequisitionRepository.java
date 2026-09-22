package com.exmple.stockpilot.purchaserequisition.application.port.out;

import com.exmple.stockpilot.purchaserequisition.domain.enums.PurchaseRequisitionStatus;
import com.exmple.stockpilot.purchaserequisition.domain.model.PurchaseRequisition;
import com.exmple.stockpilot.purchaserequisition.domain.valueobject.PurchaseRequisitionId;

import java.util.List;
import java.util.Optional;

public interface PurchaseRequisitionRepository {

    PurchaseRequisition save(PurchaseRequisition pr);

    Optional<PurchaseRequisition> findById(PurchaseRequisitionId id);

    Optional<PurchaseRequisition> findByPrNumber(String prNumber);

    List<PurchaseRequisition> findAll();

    List<PurchaseRequisition> findByStatus(PurchaseRequisitionStatus status);
}
