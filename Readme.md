# MOSIL RFID 系統使用手冊

## 🌐 線上服務

**主要服務網址：** https://mosil-rfid.vercel.app/

**API 文件（Swagger UI）：** https://mosil-rfid.vercel.app/docs

## 📋 系統概述

MOSIL RFID 系統是一個基於 Domain-Driven Design (DDD) 架構的 RFID 標籤管理系統，提供商品標籤生成、箱號管理、出貨追蹤等功能。

### 核心概念

- **RFID 標籤 (17碼)**: SKU(13碼) + 序號(4碼)
  - SKU = 貨號(8碼) + 顏色(3碼) + 尺寸(2碼) 
- **箱號 (13碼)**: B + 編號(3碼) + 年份(4碼) + 流水號(5碼)
- **使用者認證**: JWT Token 驗證
- **系統日誌**: 完整操作追蹤記錄

## 🚀 快速開始

### 1. 訪問 API 文件

前往 **[https://mosil-rfid.vercel.app/docs](https://mosil-rfid.vercel.app/docs)** 查看完整的 API 文件。

Swagger UI 提供：
- 📖 完整的 API 端點說明
- 🧪 線上 API 測試工具
- 📄 請求/回應格式範例
- 🔐 認證方式說明

### 2. 健康檢查

測試系統是否正常運行：
```bash
curl https://mosil-rfid.vercel.app/api/v1/health
```

預期回應：
```json
{
  "status": "ok",
  "timestamp": "2025-08-12T20:11:41.591Z"
}
```

## 🔐 認證系統

### 登入

**POST** `/api/v1/auth/login`

```bash
curl -X POST "https://mosil-rfid.vercel.app/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

成功回應：
```json
{
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "username": "your_username",
      "role": "USER"
    }
  }
}
```

### Token 刷新

**POST** `/api/v1/auth/refresh`

```bash
curl -X POST "https://mosil-rfid.vercel.app/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

## 📦 主要功能

### 1. RFID 標籤管理

#### 生成單一 RFID 標籤
**POST** `/api/v1/rfid`

```bash
curl -X POST "https://mosil-rfid.vercel.app/api/v1/rfid" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "MNNR7TSL153M",
    "productNo": "MNNR7TSL", 
    "serialNo": "0001",
    "createdBy": "user123"
  }'
```

#### 批量生成 RFID 標籤
**POST** `/api/v1/rfid/batch`

```bash
curl -X POST "https://mosil-rfid.vercel.app/api/v1/rfid/batch" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "MNNR7TSL153M",
    "productNo": "MNNR7TSL",
    "quantity": 100,
    "createdBy": "user123"
  }'
```

#### 查詢商品標籤 (規範 5.3.2)
**GET** `/api/v1/rfids/products`

```bash
curl -X GET "https://mosil-rfid.vercel.app/api/v1/rfids/products?sku=MNNR7TSL153M&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. 箱號管理

#### 生成單一箱號
**POST** `/api/v1/box`

```bash
curl -X POST "https://mosil-rfid.vercel.app/api/v1/box" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "153",
    "createdBy": "user123"
  }'
```

#### 批量生成箱號
**POST** `/api/v1/box/batch`

```bash
curl -X POST "https://mosil-rfid.vercel.app/api/v1/box/batch" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "153",
    "quantity": 50,
    "createdBy": "user123"
  }'
```

#### 將 RFID 加入箱子
**POST** `/api/v1/box/{boxId}/rfid`

```bash
curl -X POST "https://mosil-rfid.vercel.app/api/v1/box/123/rfid" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rfidTag": "MNNR7TSL153M0001"
  }'
```

#### 將 RFID 移出箱子
**DELETE** `/api/v1/box/{boxId}/rfid/{rfidTag}`

```bash
curl -X DELETE "https://mosil-rfid.vercel.app/api/v1/box/123/rfid/MNNR7TSL153M0001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. 出貨單管理

#### 創建出貨單
**POST** `/api/v1/shipment`

```bash
curl -X POST "https://mosil-rfid.vercel.app/api/v1/shipment" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipmentNumber": "SHIP001",
    "destination": "台北倉庫",
    "createdBy": "user123"
  }'
```

### 4. 系統日誌

#### 查詢操作日誌
**GET** `/api/v1/logs`

```bash
curl -X GET "https://mosil-rfid.vercel.app/api/v1/logs?action=CREATE_RFID&page=1&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 獲取日誌摘要
**GET** `/api/v1/logs/summary`

```bash
curl -X GET "https://mosil-rfid.vercel.app/api/v1/logs/summary" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📊 API 回應格式

### 成功回應
```json
{
  "message": "success",
  "data": {
    // 回應資料
  }
}
```

### 錯誤回應
```json
{
  "message": "錯誤描述",
  "errorCode": "ERROR_CODE",
  "details": {
    // 錯誤詳細資訊
  }
}
```

## 🛠️ 開發環境設定

### 本地安裝

```bash
# 複製專案
git clone https://github.com/CS6/mosil-rfid.git
cd mosil-rfid

# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env
# 編輯 .env 文件，設定 DATABASE_URL 等必要參數

# 生成 Prisma Client
npx prisma generate

# 執行資料庫遷移
npx prisma db push

# 啟動開發伺服器
npm run start
```

### 本地訪問

- **API 服務：** http://localhost:3001
- **API 文件：** http://localhost:3001/docs
- **健康檢查：** http://localhost:3001/api/v1/health

## 🔧 故障排除

### 常見問題

1. **認證失敗**
   - 檢查 Token 是否過期
   - 確認 Authorization Header 格式正確

2. **API 回應 404**
   - 確認 URL 路徑正確
   - 檢查 API 版本號 (`/api/v1/`)

3. **RFID 格式錯誤**
   - 確認 SKU 為 13 碼
   - 確認序號為 4 碼數字

4. **箱號格式錯誤**
   - 確認編號為 3 碼
   - 系統會自動生成年份和流水號

## 📞 技術支援

- **API 文件：** https://mosil-rfid.vercel.app/docs
- **健康檢查：** https://mosil-rfid.vercel.app/api/v1/health
- **專案倉庫：** https://github.com/CS6/mosil-rfid

---

*本文件最後更新：2025-08-12*