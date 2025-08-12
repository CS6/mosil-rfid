加連登 RFID 應用程式 API 規劃書 v2.0

一率請使用者行啟動開發環境

一、專案概述
1.1 系統簡介
加連登 RFID 應用程式是一套倉儲管理系統，透過 RFID 技術追蹤商品從入庫到出貨的完整流程。系統支援多種使用者角色，提供商品標籤生成、外箱管理、出貨單處理等核心功能。
1.2 系統目標

提供完整的 RFID 標籤生命週期管理
確保商品追蹤的準確性與即時性
支援多角色權限管理
提供完整的操作稽核軌跡

1.3 使用者角色

admin: 系統管理員，擁有全部權限
user: 加連登內部使用者，可進行日常操作
supplier: 供應商，僅能查詢相關資訊


二、系統架構設計
2.1 API 設計原則

RESTful 標準：遵循 REST 架構風格
版本控制：所有 API 路徑包含版本號 /api/v1
無狀態設計：每個請求獨立，不依賴伺服器端狀態
統一回應格式：標準化成功與錯誤回應結構

2.2 認證機制

採用 JWT (JSON Web Token) 進行身份驗證
Token 有效期：8 小時
Token 包含資訊：uuid、code、userType、exp

2.3 資料格式

請求與回應皆採用 JSON 格式
時間格式：ISO 8601 標準 (YYYY-MM-DDTHH:mm:ssZ)
編碼：UTF-8


三、通用規範
3.1 基礎路徑
https://api.calerdo.com/api/v1
3.2 認證方式
httpAuthorization: Bearer {JWT_TOKEN}
3.3 回應格式
成功回應
json{
    "message": "success",
    "data": {
        // 實際回傳資料
    }
}
錯誤回應
json{
    "message": "錯誤描述",
    "errorCode": "ERROR_CODE",
    "details": {} // 選填，額外錯誤資訊
}
3.4 HTTP 狀態碼
狀態碼說明使用時機200成功GET、PUT、PATCH 成功201建立成功POST 新增資源成功204無內容DELETE 成功或無需回傳資料400請求錯誤參數驗證失敗401未認證Token 無效或過期403無權限權限不足404找不到資源資源不存在409衝突業務邏輯衝突500伺服器錯誤系統內部錯誤
3.5 分頁參數
參數類型說明預設值pageinteger頁碼1limitinteger每頁筆數20sortstring排序欄位-createdAtorderstring排序方向 (asc/desc)desc
3.6 分頁回應
json{
    "message": "success",
    "data": [...],
    "pagination": {
        "total": 100,
        "perPage": 20,
        "currentPage": 1,
        "totalPages": 5,
        "hasNext": true,
        "hasPrev": false
    }
}

四、標籤編碼規則
4.1 商品標籤 (17碼)
A2526002012340001
├─────┬─────┤├─┬─┤├───┬───┤
   貨號8碼   顏色3碼 尺寸2碼 流水號4碼
4.2 外箱標籤 (13碼)
B001202512345
├┬─┤├──┬──┤├───┬───┤
B 編號3碼 年份4碼 流水號5碼
4.3 出貨單號 (16碼)
S001202508101545
├┬─┤├─────┬─────┤
S 編號3碼 時間戳記12碼


#  APIs


API 端點定義
5.1 認證相關 APIs
5.1.1 使用者登入

端點：POST /api/v1/auth/login
權限：公開
功能：驗證帳號密碼，取得 JWT Token

請求內容
json{
    "account": "user@calerdo.com",
    "password": "password123"
}
成功回應 (200 OK)
json{
    "message": "success",
    "data": {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "code": "001",
        "account": "user@calerdo.com",
        "name": "總公司",
        "userType": "admin",
        "accessToken": "eyJhbGciOiJIUzI1NiIs..."
    }
}
5.1.2 Token 更新

端點：POST /api/v1/auth/refresh
權限：需認證
功能：更新即將過期的 Token


5.2 使用者管理 APIs
5.2.1 建立使用者

端點：POST /api/v1/users
權限：admin, user
功能：新增系統使用者

請求內容
json{
    "account": "newuser@calerdo.com",
    "password": "securePass123",
    "code": "002",
    "name": "新竹分公司",
    "userType": "user"
}
成功回應 (201 Created)
json{
    "message": "success",
    "data": {
        "uuid": "550e8400-e29b-41d4-a716-446655440001",
        "code": "002",
        "account": "newuser@calerdo.com",
        "name": "新竹分公司",
        "userType": "user"
    }
}
5.2.2 查詢使用者清單

端點：GET /api/v1/users
權限：admin, user
查詢參數：page, limit, userType, code

5.2.3 查詢單一使用者

端點：GET /api/v1/users/{uuid}
權限：

admin, user: 可查詢任何使用者
supplier: 僅能查詢自己



5.2.4 更新使用者資料

端點：PATCH /api/v1/users/{uuid}
權限：admin, user

5.2.5 刪除使用者

端點：DELETE /api/v1/users/{uuid}
權限：admin


5.3 RFID 標籤管理 APIs
5.3.1 產生商品標籤

端點：POST /api/v1/rfids/products
權限：admin, user
功能：批次產生商品 RFID 標籤

請求內容
json{
    "sku": "A252600201234",
    "quantity": 100
}
成功回應 (201 Created)
json{
    "message": "success",
    "data": {
        "sku": "A252600201234",
        "generatedCount": 100,
        "startSerial": "0001",
        "endSerial": "0100",
        "rfids": [
            "A2526002012340001",
            "A2526002012340002",
            "..."
        ]
    }
}
5.3.2 查詢商品標籤

端點：GET /api/v1/rfids/products
權限：admin, user, supplier
查詢參數：

sku: 商品代碼
status: 狀態 (available/bound/shipped)
boxno: 外箱編號
page, limit




5.4 外箱管理 APIs
5.4.1 產生外箱標籤

端點：POST /api/v1/boxes
權限：admin, user
功能：批次產生外箱編號

請求內容
json{
    "code": "001",
    "quantity": 10
}
成功回應 (201 Created)
json{
    "message": "success",
    "data": {
        "code": "001",
        "year": "2025",
        "generatedCount": 10,
        "boxnos": [
            "B001202500001",
            "B001202500002",
            "..."
        ]
    }
}
5.4.2 綁定商品至外箱

端點：POST /api/v1/boxes/{boxno}/binding
權限：admin, user
功能：將商品標籤綁定至外箱

請求內容
json{
    "rfids": [
        "A2526002012340001",
        "A2526002012340002",
        "A2526002012340003"
    ]
}
成功回應 (200 OK)
json{
    "message": "success",
    "data": {
        "boxno": "B001202500001",
        "successCount": 2,
        "failedCount": 1,
        "success": [
            "A2526002012340001",
            "A2526002012340002"
        ],
        "failed": [
            {
                "rfid": "A2526002012340003",
                "reason": "ALREADY_BOUND",
                "boundTo": "B001202500002"
            }
        ]
    }
}
5.4.3 移除外箱內商品

端點：DELETE /api/v1/boxes/{boxno}/binding
權限：admin, user

請求內容
json{
    "rfids": ["A2526002012340001"]
}
5.4.4 查詢外箱詳情

端點：GET /api/v1/boxes/{boxno}
權限：admin, user, supplier

成功回應 (200 OK)
json{
    "message": "success",
    "data": {
        "boxno": "B001202500001",
        "code": "001",
        "status": "PACKED",
        "rfidCount": 150,
        "createdAt": "2025-08-10T10:00:00Z",
        "rfids": ["..."],
        "shipmentNo": null
    }
}
5.4.5 查詢未出貨外箱

端點：GET /api/v1/boxes?status=unshipped
權限：admin, user
功能：取得所有未出貨的外箱清單


5.5 出貨管理 APIs
5.5.1 建立出貨單

端點：POST /api/v1/shipments
權限：admin, user
功能：建立出貨單並關聯外箱

請求內容
json{
    "boxnos": [
        "B001202500001",
        "B001202500002"
    ],
    "note": "出貨備註"
}
成功回應 (201 Created)
json{
    "message": "success",
    "data": {
        "shipmentNo": "S001202508101545",
        "boxCount": 2,
        "totalRfids": 300,
        "status": "CREATED",
        "createdAt": "2025-08-10T15:45:00Z"
    }
}
5.5.2 查詢出貨單

端點：GET /api/v1/shipments/{shipmentNo}
權限：admin, user, supplier

5.5.3 查詢出貨單清單

端點：GET /api/v1/shipments
權限：admin, user
查詢參數：

status: 狀態
startDate: 開始日期
endDate: 結束日期
page, limit




5.6 系統日誌 APIs
5.6.1 查詢操作日誌

端點：GET /api/v1/logs
權限：admin
功能：查詢系統操作記錄
查詢參數：

userId: 使用者 ID
action: 操作類型
startDate: 開始時間
endDate: 結束時間
page, limit



成功回應 (200 OK)
json{
    "message": "success",
    "data": [
        {
            "id": "log-001",
            "userId": "550e8400-e29b-41d4-a716-446655440000",
            "userName": "總公司",
            "action": "CREATE_BOX",
            "details": "建立外箱 B001202500001",
            "ipAddress": "192.168.1.100",
            "userAgent": "Mozilla/5.0...",
            "timestamp": "2025-08-10T10:00:00Z"
        }
    ],
    "pagination": {...}
}
