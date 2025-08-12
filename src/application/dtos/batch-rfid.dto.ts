export interface BatchCreateRfidRequest {
  sku: string;           // 13碼: 貨號(8) + 顏色(3) + 尺寸(2)
  productNo?: string;    // 8碼: 貨號（選填，預設從 SKU 前8碼自動產生）
  startSerialNo: string; // 4碼: 起始流水號
  quantity: number;      // 要產生的數量
}

export interface BatchRfidResponse {
  totalRequested: number;
  totalCreated: number;
  failed: number;
  rfids: {
    rfid: string;
    sku: string;
    productNo: string;
    serialNo: string;
    status: 'created' | 'skipped';
    reason?: string;
  }[];
}