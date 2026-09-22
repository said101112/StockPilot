export interface GoodsReceiptItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  receivedQuantity: number;
}

export interface GoodsReceipt {
  id: string;
  grNumber: string;
  purchaseOrderId: string;
  deliveryNoteNumber: string;
  receivedAt: string;
  notes: string;
  items: GoodsReceiptItem[];
}

export interface CreateGoodsReceiptRequest {
  purchaseOrderId: string;
  deliveryNoteNumber: string;
  notes: string;
  items: {
    productId: string;
    receivedQuantity: number;
  }[];
}
