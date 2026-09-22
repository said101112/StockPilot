import { apiClient } from "@/shared/api/httpClient";
import type { PurchaseOrder, PurchaseRequisition } from "../domain/types";

export const procurementApi = {
  // Demandes d'Achat (DA / PR)
  getRequisitions: () => apiClient<PurchaseRequisition[]>("/api/purchase-requisitions"),
  getRequisitionById: (id: string) => apiClient<PurchaseRequisition>(`/api/purchase-requisitions/${id}`),
  submitRequisition: (id: string) =>
    apiClient<PurchaseRequisition>(`/api/purchase-requisitions/${id}/submit`, { method: "POST" }),
  approveRequisition: (id: string) =>
    apiClient<PurchaseRequisition>(`/api/purchase-requisitions/${id}/approve`, { method: "POST" }),
  rejectRequisition: (id: string, reason: string) =>
    apiClient<PurchaseRequisition>(`/api/purchase-requisitions/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  // Bons de Commande (PO / BC)
  getOrders: () => apiClient<PurchaseOrder[]>("/api/purchase-orders"),
  getOrderById: (id: string) => apiClient<PurchaseOrder>(`/api/purchase-orders/${id}`),
  createOrderFromRequisition: (data: {
    requisitionId: string;
    supplierId: string;
    negotiatedUnitPrice: number;
    expectedDeliveryDate: string;
  }) =>
    apiClient<PurchaseOrder>("/api/purchase-orders/from-requisition", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  issueOrder: (id: string) =>
    apiClient<PurchaseOrder>(`/api/purchase-orders/${id}/issue`, { method: "POST" }),
};
