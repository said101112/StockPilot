export type RequisitionStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ORDERED";

export interface PurchaseRequisition {
  id: string;
  requisitionNumber: string;
  productId: string;
  warehouseId: string;
  requestedQuantity: number;
  status: RequisitionStatus;
  notes: string;
  rejectionReason?: string;
  requestedDeliveryDate?: string;
  requestedAt: string;
}

export type PurchaseOrderStatus = "DRAFT" | "ISSUED" | "PARTIALLY_RECEIVED" | "COMPLETED" | "CANCELLED";

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  requisitionId: string;
  supplierId: string;
  warehouseId: string;
  status: PurchaseOrderStatus;
  paymentTerms: string;
  currency: string;
  totalAmount: number;
  expectedDeliveryDate: string;
  issuedAt?: string;
  items: PurchaseOrderItem[];
}
