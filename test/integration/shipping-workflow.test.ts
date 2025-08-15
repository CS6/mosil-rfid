/**
 * 完整出貨流程模擬測試
 * 
 * 測試邏輯：
 * 模擬完整的 RFID 出貨業務流程，包含：
 * 1. 產生商品 RFID 標籤
 * 2. 產生外箱標籤
 * 3. 綁定商品到外箱
 * 4. 建立出貨單
 * 5. 驗證整個流程的資料一致性
 * 
 * 測試輸入：
 * - SKU: "A252600201234"
 * - 商品數量: 50 個
 * - 外箱數量: 2 個
 * - 使用者編碼: "001"
 * 
 * 預期輸出：
 * - 產生 50 個 RFID 標籤 (A2526002012340001 ~ A2526002012340050)
 * - 產生 2 個外箱 (B001202500001, B001202500002)
 * - 商品平均分配到外箱 (每箱 25 個)
 * - 建立出貨單並關聯所有外箱
 * - 所有資料狀態正確更新
 */

import { FastifyInstance } from 'fastify';
import { createTestApp } from '../../test/helpers/build-app';

describe('完整出貨流程模擬', () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('📦 完整出貨業務流程', () => {
    it('應該完成完整的出貨流程', async () => {
      console.log('\n🚀 開始模擬出貨流程...\n');

      // ========================================
      // 步驟 1: 使用者登入
      // ========================================
      console.log('👤 步驟 1: 使用者登入');
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          account: 'admin@example.com',
          password: 'admin123'
        }
      });

      expect(loginResponse.statusCode).toBe(200);
      const loginData = JSON.parse(loginResponse.body);
      authToken = loginData.data.accessToken;
      
      console.log(`✅ 登入成功，使用者: ${loginData.data.name} (${loginData.data.code})`);

      // ========================================
      // 步驟 2: 產生商品 RFID 標籤
      // ========================================
      console.log('\n🏷️  步驟 2: 產生商品 RFID 標籤');
      const generateRfidsResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/rfids/products',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          sku: 'A252600201234',
          quantity: 50
        }
      });

      expect(generateRfidsResponse.statusCode).toBe(201);
      const rfidsData = JSON.parse(generateRfidsResponse.body);
      
      console.log(`✅ 產生 ${rfidsData.data.generatedCount} 個商品標籤`);
      console.log(`📋 SKU: ${rfidsData.data.sku}`);
      console.log(`🔢 流水號範圍: ${rfidsData.data.startSerial} ~ ${rfidsData.data.endSerial}`);
      console.log(`🏷️  第一個標籤: ${rfidsData.data.rfids[0]}`);
      console.log(`🏷️  最後一個標籤: ${rfidsData.data.rfids[rfidsData.data.rfids.length - 1]}`);

      expect(rfidsData.data.generatedCount).toBe(50);
      expect(rfidsData.data.rfids).toHaveLength(50);

      // ========================================
      // 步驟 3: 產生外箱標籤
      // ========================================
      console.log('\n📦 步驟 3: 產生外箱標籤');
      const generateBoxesResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/boxes',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          code: '001',
          quantity: 2
        }
      });

      expect(generateBoxesResponse.statusCode).toBe(201);
      const boxesData = JSON.parse(generateBoxesResponse.body);
      
      console.log(`✅ 產生 ${boxesData.data.generatedCount} 個外箱`);
      console.log(`📦 外箱編號: ${boxesData.data.boxnos.join(', ')}`);

      expect(boxesData.data.generatedCount).toBe(2);
      expect(boxesData.data.boxnos).toHaveLength(2);

      const [box1, box2] = boxesData.data.boxnos;

      // ========================================
      // 步驟 4: 商品裝箱 - 第一個外箱
      // ========================================
      console.log(`\n📋 步驟 4a: 商品裝箱 - ${box1}`);
      const firstBatchRfids = rfidsData.data.rfids.slice(0, 25); // 前 25 個
      
      const bindBox1Response = await app.inject({
        method: 'POST',
        url: `/api/v1/boxes/${box1}/binding`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          rfids: firstBatchRfids
        }
      });

      expect(bindBox1Response.statusCode).toBe(200);
      const bind1Data = JSON.parse(bindBox1Response.body);
      
      console.log(`✅ ${box1} 裝箱完成`);
      console.log(`📊 成功綁定: ${bind1Data.data.successCount} 個`);
      console.log(`❌ 失敗: ${bind1Data.data.failedCount} 個`);

      expect(bind1Data.data.successCount).toBe(25);
      expect(bind1Data.data.failedCount).toBe(0);

      // ========================================
      // 步驟 4b: 商品裝箱 - 第二個外箱
      // ========================================
      console.log(`\n📋 步驟 4b: 商品裝箱 - ${box2}`);
      const secondBatchRfids = rfidsData.data.rfids.slice(25, 50); // 後 25 個
      
      const bindBox2Response = await app.inject({
        method: 'POST',
        url: `/api/v1/boxes/${box2}/binding`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          rfids: secondBatchRfids
        }
      });

      expect(bindBox2Response.statusCode).toBe(200);
      const bind2Data = JSON.parse(bindBox2Response.body);
      
      console.log(`✅ ${box2} 裝箱完成`);
      console.log(`📊 成功綁定: ${bind2Data.data.successCount} 個`);
      console.log(`❌ 失敗: ${bind2Data.data.failedCount} 個`);

      expect(bind2Data.data.successCount).toBe(25);
      expect(bind2Data.data.failedCount).toBe(0);

      // ========================================
      // 步驟 5: 驗證外箱內容
      // ========================================
      console.log('\n🔍 步驟 5: 驗證外箱內容');
      
      // 檢查第一個外箱
      const checkBox1Response = await app.inject({
        method: 'GET',
        url: `/api/v1/boxes/${box1}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(checkBox1Response.statusCode).toBe(200);
      const box1Data = JSON.parse(checkBox1Response.body);
      
      console.log(`📦 ${box1} 詳情:`);
      console.log(`   📊 RFID 數量: ${box1Data.data.rfidCount}`);
      console.log(`   📋 狀態: ${box1Data.data.status}`);

      expect(box1Data.data.rfidCount).toBe(25);

      // 檢查第二個外箱
      const checkBox2Response = await app.inject({
        method: 'GET',
        url: `/api/v1/boxes/${box2}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(checkBox2Response.statusCode).toBe(200);
      const box2Data = JSON.parse(checkBox2Response.body);
      
      console.log(`📦 ${box2} 詳情:`);
      console.log(`   📊 RFID 數量: ${box2Data.data.rfidCount}`);
      console.log(`   📋 狀態: ${box2Data.data.status}`);

      expect(box2Data.data.rfidCount).toBe(25);

      // ========================================
      // 步驟 6: 建立出貨單
      // ========================================
      console.log('\n🚚 步驟 6: 建立出貨單');
      const createShipmentResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/shipments',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          boxnos: [box1, box2],
          note: '模擬出貨流程測試 - 完整業務流程驗證'
        }
      });

      expect(createShipmentResponse.statusCode).toBe(201);
      const shipmentData = JSON.parse(createShipmentResponse.body);
      
      console.log(`✅ 出貨單建立成功`);
      console.log(`📋 出貨單號: ${shipmentData.data.shipmentNo}`);
      console.log(`📦 外箱數量: ${shipmentData.data.boxCount}`);
      console.log(`🏷️  總商品數: ${shipmentData.data.totalRfids}`);
      console.log(`📅 建立時間: ${shipmentData.data.createdAt}`);

      expect(shipmentData.data.boxCount).toBe(2);
      expect(shipmentData.data.totalRfids).toBe(50);

      const shipmentNo = shipmentData.data.shipmentNo;

      // ========================================
      // 步驟 7: 驗證出貨單詳情
      // ========================================
      console.log('\n🔍 步驟 7: 驗證出貨單詳情');
      const checkShipmentResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/shipments/${shipmentNo}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(checkShipmentResponse.statusCode).toBe(200);
      const shipmentDetails = JSON.parse(checkShipmentResponse.body);
      
      console.log(`📋 出貨單 ${shipmentNo} 詳情:`);
      console.log(`   📦 外箱數量: ${shipmentDetails.data.boxCount}`);
      console.log(`   🏷️  總商品數: ${shipmentDetails.data.totalRfids}`);
      console.log(`   📋 狀態: ${shipmentDetails.data.status}`);
      console.log(`   📝 備註: ${shipmentDetails.data.note}`);

      // ========================================
      // 步驟 8: 查詢未出貨外箱（應該沒有）
      // ========================================
      console.log('\n🔍 步驟 8: 查詢未出貨外箱');
      const unshippedBoxesResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/boxes?status=unshipped',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(unshippedBoxesResponse.statusCode).toBe(200);
      const unshippedData = JSON.parse(unshippedBoxesResponse.body);
      
      console.log(`📦 未出貨外箱數量: ${unshippedData.data.length}`);
      
      // 應該沒有未出貨的外箱（因為都已經加入出貨單）
      const ourBoxes = unshippedData.data.filter((box: any) => 
        box.boxNo === box1 || box.boxNo === box2
      );
      expect(ourBoxes).toHaveLength(0);

      // ========================================
      // 步驟 9: 查詢出貨單清單
      // ========================================
      console.log('\n📋 步驟 9: 查詢出貨單清單');
      const shipmentsListResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/shipments',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      });

      expect(shipmentsListResponse.statusCode).toBe(200);
      const shipmentsList = JSON.parse(shipmentsListResponse.body);
      
      console.log(`📋 出貨單總數: ${shipmentsList.data.length}`);
      
      // 確認我們的出貨單在清單中
      const ourShipment = shipmentsList.data.find((s: any) => s.shipmentNo === shipmentNo);
      expect(ourShipment).toBeDefined();
      
      console.log(`✅ 找到我們的出貨單: ${ourShipment.shipmentNo}`);

      // ========================================
      // 步驟 10: 流程總結
      // ========================================
      console.log('\n📊 === 出貨流程總結 ===');
      console.log(`🏷️  商品標籤: 產生 50 個 RFID (${rfidsData.data.rfids[0]} ~ ${rfidsData.data.rfids[49]})`);
      console.log(`📦 外箱: 產生 2 個 (${box1}, ${box2})`);
      console.log(`📋 裝箱: 每箱 25 個商品，總計 50 個`);
      console.log(`🚚 出貨單: ${shipmentNo} (包含 2 個外箱，50 個商品)`);
      console.log(`✅ 流程狀態: 全部成功完成`);
      
      // 最終驗證
      expect(rfidsData.data.generatedCount).toBe(50);
      expect(boxesData.data.generatedCount).toBe(2);
      expect(bind1Data.data.successCount + bind2Data.data.successCount).toBe(50);
      expect(shipmentData.data.boxCount).toBe(2);
      expect(shipmentData.data.totalRfids).toBe(50);

      console.log('\n🎉 完整出貨流程模擬成功！\n');
    }, 30000); // 設定 30 秒超時
  });

  describe('🔄 錯誤處理測試', () => {
    it('應該正確處理重複綁定錯誤', async () => {
      console.log('\n🚀 開始測試錯誤處理...\n');

      // 先登入
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          account: 'admin@example.com',
          password: 'admin123'
        }
      });
      const loginData = JSON.parse(loginResponse.body);
      authToken = loginData.data.accessToken;

      // 產生測試用的 RFID
      const generateRfidsResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/rfids/products',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          sku: 'A252600201235',
          quantity: 5
        }
      });
      const rfidsData = JSON.parse(generateRfidsResponse.body);

      // 產生測試用的外箱
      const generateBoxesResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/boxes',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          code: '002',
          quantity: 2
        }
      });
      const boxesData = JSON.parse(generateBoxesResponse.body);
      const [box1, box2] = boxesData.data.boxnos;

      console.log('📋 步驟 1: 將 RFID 綁定到第一個外箱');
      // 將 RFID 綁定到第一個外箱
      const bind1Response = await app.inject({
        method: 'POST',
        url: `/api/v1/boxes/${box1}/binding`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          rfids: rfidsData.data.rfids.slice(0, 3)
        }
      });

      expect(bind1Response.statusCode).toBe(200);
      const bind1Data = JSON.parse(bind1Response.body);
      console.log(`✅ 成功綁定 ${bind1Data.data.successCount} 個到 ${box1}`);

      console.log('\n📋 步驟 2: 嘗試將相同 RFID 綁定到第二個外箱（應該失敗）');
      // 嘗試將相同的 RFID 綁定到第二個外箱
      const bind2Response = await app.inject({
        method: 'POST',
        url: `/api/v1/boxes/${box2}/binding`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          rfids: [
            rfidsData.data.rfids[0], // 已經綁定的
            rfidsData.data.rfids[1], // 已經綁定的
            rfidsData.data.rfids[3], // 未綁定的
            rfidsData.data.rfids[4]  // 未綁定的
          ]
        }
      });

      expect(bind2Response.statusCode).toBe(200);
      const bind2Data = JSON.parse(bind2Response.body);
      
      console.log(`📊 綁定結果:`);
      console.log(`   ✅ 成功: ${bind2Data.data.successCount} 個`);
      console.log(`   ❌ 失敗: ${bind2Data.data.failedCount} 個`);
      console.log(`   📋 失敗原因:`, bind2Data.data.failed);

      // 驗證錯誤處理
      expect(bind2Data.data.successCount).toBe(2); // 只有未綁定的能成功
      expect(bind2Data.data.failedCount).toBe(2);  // 已綁定的會失敗
      expect(bind2Data.data.failed).toHaveLength(2);

      console.log('\n✅ 錯誤處理測試成功！');
    }, 15000);
  });
});