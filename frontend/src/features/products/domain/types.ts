export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  unitOfMeasure: string;
  category: string;
  createdAt?: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  sku: string;
  price: number;
  currency?: string;
  unitOfMeasure?: string;
  category?: string;
  initialStock?: number;
  reorderPoint?: number;
}
