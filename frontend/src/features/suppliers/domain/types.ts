export interface Supplier {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  taxNumber: string;
  paymentTerms: string;
  currency: string;
  status?: string;
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

export interface UpdateSupplierDto {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  taxNumber: string;
  paymentTerms: string;
  currency: string;
  status?: string;
}
