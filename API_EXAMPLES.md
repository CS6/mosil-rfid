# RFID 系統 API 使用範例

## RFID 標籤結構說明

```
17碼 RFID = SKU(13碼) + SerialNo(4碼)

SKU 結構：
├── 貨號 (8碼) - 產品編號
├── 顏色 (3碼) - 顏色代碼
└── 尺寸 (2碼) - 尺寸代碼

範例：A2526002012340001
├── A2526002 - 貨號
├── 012      - 顏色
├── 34       - 尺寸
└── 0001     - 流水號
```

## API 端點

### 1. 建立單一 RFID

```bash
POST /api/v1/rfid

# 請求範例
curl -X POST http://127.0.0.1:3001/api/v1/rfid \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "A252600201234",
    "productNo": "A2526002",
    "serialNo": "0001"
  }'

# 回應範例
{
  "success": true,
  "data": {
    "rfid": "A2526002012340001",
    "sku": "A252600201234",
    "productNo": "A2526002",
    "serialNo": "0001",
    "createdBy": "dummy-user-uuid",
    "createdAt": "2025-08-12T07:20:46.987Z"
  }
}
```

### 2. 批次建立 RFID

```bash
POST /api/v1/rfid/batch

# 範例 1: 服裝產品
# 貨號: SHIRT001, 顏色: RED, 尺寸: XL
curl -X POST http://127.0.0.1:3001/api/v1/rfid/batch \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SHIRT001REDXL",
    "productNo": "SHIRT001",
    "startSerialNo": "0001",
    "quantity": 10
  }'

# 範例 2: 鞋類產品
# 貨號: SHOE9999, 顏色: BLK, 尺寸: 42
curl -X POST http://127.0.0.1:3001/api/v1/rfid/batch \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SHOE9999BLK42",
    "productNo": "SHOE9999",
    "startSerialNo": "0100",
    "quantity": 5
  }'

# 回應範例
{
  "success": true,
  "data": {
    "totalRequested": 5,
    "totalCreated": 5,
    "failed": 0,
    "rfids": [
      {
        "rfid": "SHOE9999BLK420100",
        "sku": "SHOE9999BLK42",
        "productNo": "SHOE9999",
        "serialNo": "0100",
        "status": "created"
      },
      {
        "rfid": "SHOE9999BLK420101",
        "sku": "SHOE9999BLK42",
        "productNo": "SHOE9999",
        "serialNo": "0101",
        "status": "created"
      }
      // ... 更多 RFID
    ]
  }
}
```

### 3. 建立箱子

```bash
POST /api/v1/box

curl -X POST http://127.0.0.1:3001/api/v1/box \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "TST"
  }'
```

### 4. 將 RFID 加入箱子

```bash
POST /api/v1/box/add-rfid

curl -X POST http://127.0.0.1:3001/api/v1/box/add-rfid \
  -H "Content-Type: application/json" \
  -d '{
    "boxNo": "TSTME7SY4EDD3",
    "rfid": "A2526002012340001"
  }'
```

## 常見錯誤

### 1. ProductNo 與 SKU 不符

```bash
# 錯誤範例：productNo 不是 SKU 的前 8 碼
{
  "sku": "A252600201234",
  "productNo": "B1234567",  # 錯誤！應該是 A2526002
  "serialNo": "0001"
}

# 錯誤回應
{
  "success": false,
  "error": "ProductNo B1234567 does not match SKU prefix A2526002"
}
```

### 2. 序號重複

```bash
# 當序號已存在時
{
  "success": false,
  "error": "Serial number 0001 already exists for SKU A252600201234"
}
```

## 測試資料範例

| 產品類型 | 貨號 | 顏色 | 尺寸 | SKU | 範例 RFID |
|---------|------|------|------|-----|-----------|
| T-Shirt | TSHRT001 | WHT | SM | TSHRT001WHTSM | TSHRT001WHTSM0001 |
| 牛仔褲 | JEAN2022 | BLU | 32 | JEAN2022BLU32 | JEAN2022BLU320001 |
| 運動鞋 | SNKR5555 | RED | 41 | SNKR5555RED41 | SNKR5555RED410001 |
| 外套 | COAT7890 | BLK | LG | COAT7890BLKLG | COAT7890BLKLG0001 |