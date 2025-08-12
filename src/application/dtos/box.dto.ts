export interface CreateBoxRequest {
  code: string; // 3位編號
}

export interface CreateBatchBoxRequest {
  code: string; // 3位編號
  quantity: number; // 數量
}

export interface AddRfidToBoxRequest {
  boxNo: string;
  rfid: string;
}

export interface BoxResponse {
  boxNo: string;
  code: string; // 3位編號
  shipmentNo?: string;
  productCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoxDetailResponse extends BoxResponse {
  productRfids: {
    rfid: string;
    sku: string;
    productNo: string;
    serialNo: string;
  }[];
}