package com.exmple.stockpilot.stockalert.application.port.in;

import com.exmple.stockpilot.stockalert.presentation.StockAlertResponse;

import java.util.List;
import java.util.UUID;

public interface GetStockAlertsUseCase {
    List<StockAlertResponse> getActiveAlerts();
    List<StockAlertResponse> getAllAlerts();
    StockAlertResponse getAlertById(UUID id);
}
