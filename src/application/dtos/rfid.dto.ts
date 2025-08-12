export interface CreateRfidRequest {
  sku: string;
  productNo: string;
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