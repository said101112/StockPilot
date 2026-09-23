export type RequisitionStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ORDERED";

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  requisitionNumber?: string;
  productId: string;
  warehouseId: string;
  requestedQuantity: number;
  status: RequisitionStatus;
  justification?: string;
  notes?: string;
  rejectionReason?: string;
  requestedDeliveryDate?: string;
  requestedAt?: string;
  createdAt?: string;
  submittedAt?: string;
}

export type PurchaseOrderStatus = "DRAFT" | "ISSUED" | "PARTIALLY_RECEIVED" | "COMPLETED" | "CANCELLED";

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity?: number;
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
