export interface CreateRfidRequest {
  sku: string;
  productNo?: string;
  serialNo: string;
}

export interface RfidResponse {
  rfid: string;
  sku: string;
  productNo: string;
  serialNo: string;
  boxNo?: string;
  createdBy: string;
  createdAt: Date;
}

export interface GenerateProductRfidsRequest {
  sku: string;
  quantity: number;
}

export interface GenerateProductRfidsResponse {
  sku: string;
  generatedCount: number;
  startSerial: string;
  endSerial: string;
  rfids: string[];
}

export interface QueryProductRfidsRequest {
  sku?: string;
  status?: 'available' | 'bound' | 'shipped';
  boxNo?: string;
  page?: number;
  limit?: number;
}

export interface ProductRfidItem {
  rfid: string;
  sku: string;
  productNo: string;
  serialNo: string;
  status: 'available' | 'bound' | 'shipped';
  boxNo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryProductRfidsResponse {
  rfids: ProductRfidItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}