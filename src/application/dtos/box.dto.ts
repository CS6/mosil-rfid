export interface CreateBoxRequest {
  code: string; // 3位編號
}

export interface CreateBatchBoxRequest {
  code: string; // 3位編號
  quantity: number; // 數量
}

export interface BatchBoxResponse {
  code: string;
  year: string;
  generatedCount: number;
  boxNos: string[];
}

export interface AddRfidToBoxRequest {
  boxNo: string;
  rfid: string;
}

export interface RemoveRfidFromBoxRequest {
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
  status: string;
  productRfids: {
    rfid: string;
    sku: string;
    productNo: string;
    serialNo: string;
  }[];
}

export interface BoxListResponse {
  boxes: (BoxResponse & { status: string })[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}