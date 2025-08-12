export interface CreateBoxRequest {
  userCode: string;
}

export interface AddRfidToBoxRequest {
  boxNo: string;
  rfid: string;
}

export interface BoxResponse {
  boxNo: string;
  userCode: string;
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