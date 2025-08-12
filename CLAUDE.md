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

