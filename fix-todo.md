契約/行為層缺失
	•	分頁回應：多數列表回應給了 total/page/limit/totalPages，但未統一包在 data.pagination；也有端點完全沒分頁範例（如 boxes 列表沒有）。
	•	狀態機：
	•	RFID：available|bound|shipped 出現，但缺「何時轉換、由誰觸發」（綁定/出貨動作對應轉移規則）。
	•	Box：出現 productCount，但未定義 status 枚舉（3.1 版定為 CREATED|PACKED|SHIPPED）。
	•	Shipment：CREATED|SHIPPED 有，但缺流程（可否取消/回滾、允許何時新增箱）。
	•	冪等性：批次產生/綁定/建立出貨等未規範 Idempotency-Key，重試可能重複寫入。
	•	錯誤模型：有 {message, errorCode, details}，但未列常見錯誤碼表（例如 ALREADY_BOUND, INVALID_SKU, DUPLICATE_RFID, BOX_NOT_FOUND…）。
	•	RBAC 詳則：文字有說 supplier 只能查自己，但Swagger 裡沒以 401/403、或規則描述/範例來落實（建議在每 endpoint description 補「角色可見性」）。

3) 安全性與認證缺失
	•	/auth/login 應明確標 security: []，否則你的全域 security 會讓 login 需要 Token。
	•	401/403 回應：大部分端點未列出 401、403 標準回應（建議共用 response schema）。
	•	Token 更新：/auth/refresh 沒說明 refreshToken 來源（Cookie or Body）與旋轉（rotate）策略、過期/黑名單處理。

4) 命名與一致性問題
	•	路徑命名：/users/（尾斜線）vs /users；/box/* 單數 vs /boxes/* 複數；建議全改複數資源名。
	•	欄位命名：boxno（query） vs boxNo（body/回應）；請統一 boxNo。
	•	回應外層：大多是 {message, data}，但 Shipment 類端點混入 success: boolean → 不一致。
	•	SKU/ID 規則：你允許 ^[A-Z0-9]{13}$，但實際例子多為 A + 數字（顏色/尺寸是否純數字？）→ 若業務上已固定規則，建議更嚴格 pattern。
	•	日期欄位：有 createdAt/updatedAt，但未聲明時區（建議全 UTC, ISO 8601）。

5) 驗證與資料品質缺口
	•	BoxNo/ShipmentNo 正則：建議嚴格化：
	•	BoxNo: ^B\\d{12}$（B + 3碼編號 + 4碼年份 + 5碼流水）
	•	ShipmentNo: ^S\\d{15}$（S + 3碼編號 + 12碼時間戳）
	•	批次上限：/rfid/batch 有 1000，但 /rfids/products POST 也該描述同樣上限與行為（跳過已存在？覆蓋？）。
	•	去重與衝突策略：遇到已有 RFID/BoxNo 時，是否跳過、報錯、或回傳 status: skipped—各端點需一致。

6) 可觀測性與審計
	•	/logs 缺失：你之前規劃有日誌查詢，但本 Swagger 不含；
建議在所有變更型端點（create/bind/ship）定義會記一筆哪種 action（如 CREATE_BOX, BIND_RFIDS, CREATE_SHIPMENT, SHIP_SHIPMENT），並將 idempotencyKey、操作者、來源 IP/UA 一併紀錄。
	•	追蹤欄位：createdBy 有時有、有時無；建議統一出現在所有資源。

7) 部署與環境信息
	•	host/schemes：你寫 127.0.0.1:3001 + http，但文件描述是 https://api.calerdo.com。
→ 建議用 servers（或在 2.0 的 host/schemes/basePath）明確區分 prod/dev，避免被誤用到生產。

8) 清理建議
	•	definitions 的 def-0/1/2（pagination/paramId/message）似乎未引用；要嘛引用、要嘛移除，避免混亂。
	•	將 Box 的「單數動詞路徑」（/box/add-rfid, /box/remove-rfid）標示為 deprecated，提供標準 REST 版（/boxes/{boxNo}/binding）。

⸻

建議修補順序（最省痛）
	1.	修安全：在 /auth/login 加 security: []、各受保護端點補 401/403。
	2.	修一致性：移除 /users/ 尾斜線；全部改用 boxNo；移除 success 布林，統一 {message,data}。
	3.	補查詢端點：加上 GET /boxes、GET /boxes/{boxNo}、GET /shipments、GET /shipments/{shipmentNo}。
	4.	補分頁模型：統一 data.pagination。
	5.	補錯誤碼表：列常見 errorCode 與對應 HTTP status。
	6.	補冪等性：對「批次/重要寫入」端點加 Idempotency-Key 說明。
	7.	補狀態機：用表格描述 RFID/Box/Shipment 的狀態轉移與觸發動作。
	8.	補/logs 與各變更端點的審計欄位。
