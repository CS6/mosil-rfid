/**
 * Domain 層出貨流程模擬測試
 *
 * 測試邏輯：
 * 使用 Domain Value Objects 和 Entities 模擬完整的出貨業務流程
 * 不依賴 API 層，專注於驗證業務邏輯的正確性
 *
 * 流程步驟：
 * 1. 建立使用者（UserCode）
 * 2. 產生商品 RFID 標籤
 * 3. 產生外箱標籤
 * 4. 建立外箱實體
 * 5. 模擬商品裝箱過程
 * 6. 建立出貨單
 * 7. 驗證整個流程的資料一致性
 *
 * 測試輸入：
 * - 使用者編碼: "001"
 * - SKU: "A252600201234"
 * - 商品數量: 30 個
 * - 外箱數量: 3 個
 * - 每箱 10 個商品
 *
 * 預期輸出：
 * - 30 個有效的 RFID 標籤
 * - 3 個有效的外箱編號
 * - 每個外箱包含 10 個商品
 * - 1 個出貨單包含所有外箱
 */

import { RfidTag } from '../../src/domain/value-objects/rfid-tag';
import { SKU } from '../../src/domain/value-objects/sku';
import { ProductNumber } from '../../src/domain/value-objects/product-number';
import { SerialNumber } from '../../src/domain/value-objects/serial-number';
import { BoxNumber } from '../../src/domain/value-objects/box-number';
import { ShipmentNumber } from '../../src/domain/value-objects/shipment-number';
import { UserCode } from '../../src/domain/value-objects/user-code';

// 模擬外箱實體
interface BoxEntity {
  boxNumber: BoxNumber;
  userCode: UserCode;
  rfids: RfidTag[];
  shipmentNumber?: ShipmentNumber;
  createdAt: Date;
}

// 模擬出貨單實體
interface ShipmentEntity {
  shipmentNumber: ShipmentNumber;
  userCode: UserCode;
  boxes: BoxNumber[];
  totalItems: number;
  status: 'CREATED' | 'SHIPPED';
  createdAt: Date;
}

describe('🚀 Domain 層出貨流程模擬', () => {

  describe('📦 完整業務流程測試', () => {
    it('應該完成完整的領域層出貨流程', () => {
      console.log('\n🚀 開始 Domain 層出貨流程模擬...\n');

      // ========================================
      // 步驟 1: 建立使用者編碼
      // ========================================
      console.log('👤 步驟 1: 建立使用者編碼');
      const userCode = new UserCode('001');
      console.log(`✅ 使用者編碼: ${userCode.getValue()}`);

      // ========================================
      // 步驟 2: 定義商品資訊
      // ========================================
      console.log('\n📋 步驟 2: 定義商品資訊');
      const sku = new SKU('A252600201234');
      const productNumber = new ProductNumber('A2526002'); // 貨號8碼
      const quantity = 30;

      console.log(`✅ SKU: ${sku.getValue()}`);
      console.log(`✅ 貨號: ${productNumber.getValue()}`);
      console.log(`✅ 數量: ${quantity} 個`);

      // ========================================
      // 步驟 3: 產生商品 RFID 標籤
      // ========================================
      console.log('\n🏷️  步驟 3: 產生商品 RFID 標籤');
      const rfidTags: RfidTag[] = [];

      for (let i = 1; i <= quantity; i++) {
        const serialNumber = new SerialNumber(i.toString().padStart(4, '0'));
        // RFID 格式: SKU13碼 + 流水號4碼 = 17碼
        const rfidValue = `${sku.getValue()}${serialNumber.getValue()}`;
        const rfidTag = new RfidTag(rfidValue);
        rfidTags.push(rfidTag);
      }

      console.log(`✅ 產生 ${rfidTags.length} 個 RFID 標籤`);
      console.log(`📋 第一個: ${rfidTags[0].getValue()}`);
      console.log(`📋 最後一個: ${rfidTags[rfidTags.length - 1].getValue()}`);

      // 驗證 RFID 格式
      expect(rfidTags).toHaveLength(30);
      expect(rfidTags[0].getValue()).toBe('A2526002012340001');
      expect(rfidTags[29].getValue()).toBe('A2526002012340030');

      // ========================================
      // 步驟 4: 產生外箱標籤
      // ========================================
      console.log('\n📦 步驟 4: 產生外箱標籤');
      const boxNumbers: BoxNumber[] = [];
      const currentYear = new Date().getFullYear().toString();

      for (let i = 1; i <= 3; i++) {
        const serialNo = i.toString().padStart(5, '0');
        // 外箱格式: B + 編號3碼 + 年份4碼 + 流水號5碼 = 13碼
        const boxValue = `B${userCode.getValue()}${currentYear}${serialNo}`;
        const boxNumber = new BoxNumber(boxValue);
        boxNumbers.push(boxNumber);
      }

      console.log(`✅ 產生 ${boxNumbers.length} 個外箱`);
      boxNumbers.forEach((box, index) => {
        console.log(`📦 外箱 ${index + 1}: ${box.getValue()}`);
      });

      // 驗證外箱格式
      expect(boxNumbers).toHaveLength(3);

      // ========================================
      // 步驟 5: 建立外箱實體並裝箱
      // ========================================
      console.log('\n📋 步驟 5: 建立外箱實體並模擬裝箱');
      const boxes: BoxEntity[] = [];

      boxNumbers.forEach((boxNumber, index) => {
        const startIndex = index * 10;
        const endIndex = startIndex + 10;
        const boxRfids = rfidTags.slice(startIndex, endIndex);

        const box: BoxEntity = {
          boxNumber,
          userCode,
          rfids: boxRfids,
          createdAt: new Date()
        };

        boxes.push(box);
        console.log(`📦 ${boxNumber.getValue()}: 裝入 ${boxRfids.length} 個商品`);
        console.log(`   📋 RFID 範圍: ${boxRfids[0].getValue()} ~ ${boxRfids[boxRfids.length - 1].getValue()}`);
      });

      // 驗證裝箱結果
      expect(boxes).toHaveLength(3);
      boxes.forEach(box => {
        expect(box.rfids).toHaveLength(10);
      });

      // ========================================
      // 步驟 6: 建立出貨單
      // ========================================
      console.log('\n🚚 步驟 6: 建立出貨單');
      const shipmentSerial = Date.now().toString().slice(-12); // 取後12位作為時間戳記
      const shipmentValue = `S${userCode.getValue()}${shipmentSerial}`;
      const shipmentNumber = new ShipmentNumber(shipmentValue);

      const shipment: ShipmentEntity = {
        shipmentNumber,
        userCode,
        boxes: boxes.map(box => box.boxNumber),
        totalItems: boxes.reduce((total, box) => total + box.rfids.length, 0),
        status: 'CREATED',
        createdAt: new Date()
      };

      console.log(`✅ 出貨單建立成功`);
      console.log(`📋 出貨單號: ${shipment.shipmentNumber.getValue()}`);
      console.log(`📦 外箱數量: ${shipment.boxes.length}`);
      console.log(`🏷️  總商品數: ${shipment.totalItems}`);
      console.log(`📅 狀態: ${shipment.status}`);

      // 將外箱關聯到出貨單
      boxes.forEach(box => {
        box.shipmentNumber = shipmentNumber;
      });

      // ========================================
      // 步驟 7: 驗證業務規則
      // ========================================
      console.log('\n🔍 步驟 7: 驗證業務規則');

      // 驗證 RFID 唯一性
      const allRfids = boxes.flatMap(box => box.rfids);
      const uniqueRfids = new Set(allRfids.map(rfid => rfid.getValue()));
      console.log(`📊 總 RFID 數: ${allRfids.length}`);
      console.log(`📊 唯一 RFID 數: ${uniqueRfids.size}`);
      expect(uniqueRfids.size).toBe(allRfids.length); // 所有 RFID 都應該是唯一的

      // 驗證外箱內容
      let totalItemsInBoxes = 0;
      boxes.forEach((box, index) => {
        console.log(`📦 外箱 ${index + 1} (${box.boxNumber.getValue()}):`);
        console.log(`   📊 商品數量: ${box.rfids.length}`);
        console.log(`   📋 出貨單: ${box.shipmentNumber?.getValue()}`);

        expect(box.rfids.length).toBe(10);
        expect(box.shipmentNumber?.getValue()).toBe(shipmentNumber.getValue());
        totalItemsInBoxes += box.rfids.length;
      });

      // 驗證總數一致性
      expect(totalItemsInBoxes).toBe(shipment.totalItems);
      expect(shipment.totalItems).toBe(30);

      // 驗證出貨單內容
      expect(shipment.boxes.length).toBe(3);
      expect(shipment.totalItems).toBe(30);

      // ========================================
      // 步驟 8: 模擬出貨狀態更新
      // ========================================
      console.log('\n📤 步驟 8: 模擬出貨狀態更新');
      shipment.status = 'SHIPPED';
      console.log(`✅ 出貨單狀態更新為: ${shipment.status}`);

      // ========================================
      // 步驟 9: 最終驗證和總結
      // ========================================
      console.log('\n📊 === 流程總結 ===');
      console.log(`👤 使用者: ${userCode.getValue()}`);
      console.log(`🏷️  商品標籤: ${rfidTags.length} 個 (${rfidTags[0].getValue()} ~ ${rfidTags[rfidTags.length - 1].getValue()})`);
      console.log(`📦 外箱: ${boxes.length} 個`);
      boxes.forEach((box, index) => {
        console.log(`   📦 ${index + 1}. ${box.boxNumber.getValue()} (${box.rfids.length} 個商品)`);
      });
      console.log(`🚚 出貨單: ${shipment.shipmentNumber.getValue()}`);
      console.log(`📊 總計: ${shipment.boxes.length} 箱 ${shipment.totalItems} 個商品`);
      console.log(`📋 狀態: ${shipment.status}`);

      // 最終斷言
      expect(userCode.getValue()).toBe('001');
      expect(sku.getValue()).toBe('A252600201234');
      expect(rfidTags.length).toBe(30);
      expect(boxes.length).toBe(3);
      expect(shipment.totalItems).toBe(30);
      expect(shipment.status).toBe('SHIPPED');

      console.log('\n🎉 Domain 層出貨流程模擬成功完成！\n');
    });
  });

  describe('🧪 Value Object 組合測試', () => {
    it('應該正確組合所有 Value Objects', () => {
      console.log('\n🧪 開始 Value Object 組合測試...\n');

      // 測試各種格式組合
      const testCases = [
        {
          userCode: '001',
          sku: 'A252600201234',
          productNo: 'A2526002',
          serialNo: '0001',
          expectedRfid: 'A2526002012340001'
        },
        {
          userCode: '999',
          sku: 'Z999888777666',
          productNo: 'Z9998887',
          serialNo: '9999',
          expectedRfid: 'Z9998887776669999'
        }
      ];

      testCases.forEach((testCase, index) => {
        console.log(`📋 測試案例 ${index + 1}:`);

        // 建立 Value Objects
        const userCode = new UserCode(testCase.userCode);
        const sku = new SKU(testCase.sku);
        new ProductNumber(testCase.productNo); // 驗證格式正確性
        new SerialNumber(testCase.serialNo);   // 驗證格式正確性

        // 組合 RFID
        const rfidValue = `${testCase.sku}${testCase.serialNo}`;
        const rfidTag = new RfidTag(rfidValue);

        // 組合外箱編號
        const currentYear = new Date().getFullYear().toString();
        const boxValue = `B${testCase.userCode}${currentYear}00001`;
        const boxNumber = new BoxNumber(boxValue);

        // 組合出貨單編號
        const timestamp = '202508151500';
        const shipmentValue = `S${testCase.userCode}${timestamp}`;
        const shipmentNumber = new ShipmentNumber(shipmentValue);

        console.log(`   👤 使用者編碼: ${userCode.getValue()}`);
        console.log(`   📋 SKU: ${sku.getValue()}`);
        console.log(`   🏷️  RFID: ${rfidTag.getValue()}`);
        console.log(`   📦 外箱: ${boxNumber.getValue()}`);
        console.log(`   🚚 出貨單: ${shipmentNumber.getValue()}`);

        // 驗證格式
        expect(userCode.getValue()).toBe(testCase.userCode);
        expect(sku.getValue()).toBe(testCase.sku);
        expect(rfidTag.getValue()).toBe(testCase.expectedRfid);
        expect(boxNumber.getValue()).toMatch(/^B\d{3}\d{4}\d{5}$/);
        expect(shipmentNumber.getValue()).toMatch(/^S\d{3}\d{12}$/);

        console.log(`   ✅ 測試案例 ${index + 1} 驗證通過\n`);
      });

      console.log('🎉 Value Object 組合測試完成！\n');
    });
  });

  describe('❌ 錯誤處理測試', () => {
    it('應該正確處理無效的組合', () => {
      console.log('\n❌ 開始錯誤處理測試...\n');

      console.log('📋 測試無效的 RFID 格式:');

      // 測試無效的 RFID 長度 (應該是17個字元)
      expect(() => new RfidTag('A252600201234001')).toThrow('RFID tag must be exactly 17 characters');   // 16字元
      expect(() => new RfidTag('A252600201234001XX')).toThrow('RFID tag must be exactly 17 characters'); // 19字元
      console.log('   ✅ RFID 長度驗證正確');

      // 測試無效的 RFID 字元 (正確的17字元長度但無效字元)
      expect(() => new RfidTag('a25260020123400x1')).toThrow('RFID tag must contain only uppercase letters and numbers');
      expect(() => new RfidTag('A252600201234@001')).toThrow('RFID tag must contain only uppercase letters and numbers');
      console.log('   ✅ RFID 字元驗證正確');

      console.log('\n📦 測試無效的外箱格式:');

      // 測試無效的外箱長度
      expect(() => new BoxNumber('B00120250000')).toThrow('Box number must be exactly 13 characters');
      expect(() => new BoxNumber('B0012025000001')).toThrow('Box number must be exactly 13 characters');
      console.log('   ✅ 外箱長度驗證正確');

      console.log('\n🚚 測試無效的出貨單格式:');

      // 測試無效的出貨單長度
      expect(() => new ShipmentNumber('S00120250815150')).toThrow('Shipment number must be exactly 16 characters');
      expect(() => new ShipmentNumber('S001202508151500X')).toThrow('Shipment number must be exactly 16 characters');
      console.log('   ✅ 出貨單長度驗證正確');

      console.log('\n🎉 錯誤處理測試完成！\n');
    });
  });
});
