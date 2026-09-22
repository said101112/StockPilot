export interface Supplier {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  taxNumber: string;
  paymentTerms: string;
  currency: string;
}

export interface CreateSupplierDto {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  taxNumber: string;
  paymentTerms: string;
  currency: string;
}
