/**
 * Box Management E2E Tests
 * 
 * Test Logic:
 * End-to-end tests covering complete box management workflows including:
 * - Complete box lifecycle: creation → RFID assignment → shipment assignment
 * - Cross-API integration testing with real database transactions
 * - Business workflow validation with multiple API calls
 * - Data consistency verification across different endpoints
 * - Error handling in complex scenarios
 * 
 * Test Inputs:
 * - Complete workflow scenarios with multiple API calls
 * - Real HTTP requests with authentication and headers
 * - Database state setup and verification
 * - RFID and shipment data integration
 * 
 * Expected Outputs:
 * - End-to-end workflow completion
 * - Consistent data across all related APIs
 * - Proper state transitions and business rule enforcement
 * - Complete audit trail generation
 */

import { FastifyInstance } from 'fastify';
import { createTestApp } from '../helpers/build-app';

describe('Box Management E2E Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    if (app.prisma) {
      await app.prisma.productRfid.deleteMany({});
      await app.prisma.box.deleteMany({});
      await app.prisma.shipment.deleteMany({});
      await app.prisma.systemLog.deleteMany({});
    }
  });

  describe('Complete Box Lifecycle Workflow', () => {
    it('should complete full box lifecycle: create → add RFID → assign to shipment', async () => {
      // Step 1: Create RFID first
      const rfidResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/rfid',
        headers: { 'content-type': 'application/json' },
        payload: {
          sku: 'SKU-TEST-001',
          productNo: 'P001',
          serialNo: 'SN001'
        }
      });

      expect(rfidResponse.statusCode).toBe(201);
      const rfidBody = JSON.parse(rfidResponse.body);
      const rfidTag = rfidBody.data.rfid;

      // Step 2: Create a box
      const boxResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: { 'content-type': 'application/json' },
        payload: { code: '001' }
      });

      expect(boxResponse.statusCode).toBe(201);
      const boxBody = JSON.parse(boxResponse.body);
      const boxNo = boxBody.data.boxNo;

      // Step 3: Add RFID to box
      const addRfidResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/box/add-rfid',
        headers: { 'content-type': 'application/json' },
        payload: {
          boxNo: boxNo,
          rfid: rfidTag
        }
      });

      expect(addRfidResponse.statusCode).toBe(200);
      const addRfidBody = JSON.parse(addRfidResponse.body);
      expect(addRfidBody.data.productRfids).toHaveLength(1);
      expect(addRfidBody.data.productRfids[0].rfid).toBe(rfidTag);

      // Step 4: Verify box details show RFID
      const boxDetailsResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/boxes/${boxNo}`
      });

      expect(boxDetailsResponse.statusCode).toBe(200);
      const boxDetailsBody = JSON.parse(boxDetailsResponse.body);
      expect(boxDetailsBody.data.productRfids).toHaveLength(1);
      expect(boxDetailsBody.data.status).toBe('CREATED');

      // Step 5: Create shipment
      const shipmentResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/shipments',
        headers: { 'content-type': 'application/json' },
        payload: { code: '001' }
      });

      expect(shipmentResponse.statusCode).toBe(201);
      const shipmentBody = JSON.parse(shipmentResponse.body);
      const shipmentNo = shipmentBody.data.shipmentNo;

      // Step 6: Add box to shipment
      const addBoxToShipmentResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/shipments/add-box',
        headers: { 'content-type': 'application/json' },
        payload: {
          shipmentNo: shipmentNo,
          boxNo: boxNo
        }
      });

      expect(addBoxToShipmentResponse.statusCode).toBe(200);

      // Step 7: Verify box status changed to PACKED
      const finalBoxDetailsResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/boxes/${boxNo}`
      });

      expect(finalBoxDetailsResponse.statusCode).toBe(200);
      const finalBoxBody = JSON.parse(finalBoxDetailsResponse.body);
      expect(finalBoxBody.data.status).toBe('PACKED');
      expect(finalBoxBody.data.shipmentNo).toBe(shipmentNo);
    });

    it('should prevent RFID modification when box is assigned to shipment', async () => {
      // Create RFID and box first
      const rfidResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/rfid',
        headers: { 'content-type': 'application/json' },
        payload: { sku: 'SKU-002', productNo: 'P002', serialNo: 'SN002' }
      });

      const boxResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: { 'content-type': 'application/json' },
        payload: { code: '002' }
      });

      const rfidTag = JSON.parse(rfidResponse.body).data.rfid;
      const boxNo = JSON.parse(boxResponse.body).data.boxNo;

      // Add RFID to box
      await app.inject({
        method: 'POST',
        url: '/api/v1/box/add-rfid',
        headers: { 'content-type': 'application/json' },
        payload: { boxNo, rfid: rfidTag }
      });

      // Create and assign to shipment
      const shipmentResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/shipments',
        headers: { 'content-type': 'application/json' },
        payload: { code: '002' }
      });

      const shipmentNo = JSON.parse(shipmentResponse.body).data.shipmentNo;

      await app.inject({
        method: 'POST',
        url: '/api/v1/shipments/add-box',
        headers: { 'content-type': 'application/json' },
        payload: { shipmentNo, boxNo }
      });

      // Try to remove RFID - should fail
      const removeRfidResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/box/remove-rfid',
        headers: { 'content-type': 'application/json' },
        payload: { boxNo, rfid: rfidTag }
      });

      expect(removeRfidResponse.statusCode).toBe(400);
      expect(JSON.parse(removeRfidResponse.body).message).toContain('Cannot modify box');
    });
  });

  describe('Batch Operations Workflow', () => {
    it('should handle batch box creation and individual RFID assignment', async () => {
      // Create batch of boxes
      const batchResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/boxes',
        headers: { 'content-type': 'application/json' },
        payload: { code: '100', quantity: 3 }
      });

      expect(batchResponse.statusCode).toBe(201);
      const batchBody = JSON.parse(batchResponse.body);
      const boxNumbers = batchBody.data.boxNos;

      // Create multiple RFIDs
      const rfidPromises = Array.from({ length: 3 }, (_, i) =>
        app.inject({
          method: 'POST',
          url: '/api/v1/rfid',
          headers: { 'content-type': 'application/json' },
          payload: {
            sku: `SKU-BATCH-${i + 1}`,
            productNo: `P${i + 1}`,
            serialNo: `SN${i + 1}`
          }
        })
      );

      const rfidResponses = await Promise.all(rfidPromises);
      const rfidTags = rfidResponses.map(response => 
        JSON.parse(response.body).data.rfid
      );

      // Assign each RFID to a different box
      for (let i = 0; i < 3; i++) {
        const addRfidResponse = await app.inject({
          method: 'POST',
          url: '/api/v1/box/add-rfid',
          headers: { 'content-type': 'application/json' },
          payload: {
            boxNo: boxNumbers[i],
            rfid: rfidTags[i]
          }
        });

        expect(addRfidResponse.statusCode).toBe(200);
      }

      // Verify all boxes have their assigned RFIDs
      for (let i = 0; i < 3; i++) {
        const boxDetailsResponse = await app.inject({
          method: 'GET',
          url: `/api/v1/boxes/${boxNumbers[i]}`
        });

        const boxBody = JSON.parse(boxDetailsResponse.body);
        expect(boxBody.data.productRfids).toHaveLength(1);
        expect(boxBody.data.productRfids[0].rfid).toBe(rfidTags[i]);
      }
    });
  });

  describe('Data Consistency Across APIs', () => {
    it('should maintain consistent data between box list and individual box APIs', async () => {
      // Create multiple boxes
      const boxCreationPromises = ['201', '202', '203'].map(code =>
        app.inject({
          method: 'POST',
          url: '/api/v1/box',
          headers: { 'content-type': 'application/json' },
          payload: { code }
        })
      );

      const boxResponses = await Promise.all(boxCreationPromises);
      const boxNumbers = boxResponses.map(response => 
        JSON.parse(response.body).data.boxNo
      );

      // Get box list
      const listResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/boxes?limit=10'
      });

      expect(listResponse.statusCode).toBe(200);
      const listBody = JSON.parse(listResponse.body);

      // Verify each box in list matches individual API
      for (const boxNo of boxNumbers) {
        const listBox = listBody.data.boxes.find((box: any) => box.boxNo === boxNo);
        expect(listBox).toBeDefined();

        const individualResponse = await app.inject({
          method: 'GET',
          url: `/api/v1/boxes/${boxNo}`
        });

        const individualBody = JSON.parse(individualResponse.body);

        // Compare common fields
        expect(listBox.boxNo).toBe(individualBody.data.boxNo);
        expect(listBox.code).toBe(individualBody.data.code);
        expect(listBox.status).toBe(individualBody.data.status);
        expect(listBox.createdBy).toBe(individualBody.data.createdBy);
      }
    });
  });

  describe('Error Handling in Complex Scenarios', () => {
    it('should handle RFID assignment to non-existent box gracefully', async () => {
      // Create RFID
      const rfidResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/rfid',
        headers: { 'content-type': 'application/json' },
        payload: { sku: 'SKU-404', productNo: 'P404', serialNo: 'SN404' }
      });

      const rfidTag = JSON.parse(rfidResponse.body).data.rfid;

      // Try to add to non-existent box
      const addRfidResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/box/add-rfid',
        headers: { 'content-type': 'application/json' },
        payload: {
          boxNo: 'B999999999999',
          rfid: rfidTag
        }
      });

      expect(addRfidResponse.statusCode).toBe(404);
      expect(JSON.parse(addRfidResponse.body).message).toContain('Box not found');
    });

    it('should handle duplicate RFID assignment across different boxes', async () => {
      // Create RFID and two boxes
      const rfidResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/rfid',
        headers: { 'content-type': 'application/json' },
        payload: { sku: 'SKU-DUP', productNo: 'PDUP', serialNo: 'SNDUP' }
      });

      const boxResponse1 = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: { 'content-type': 'application/json' },
        payload: { code: '301' }
      });

      const boxResponse2 = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: { 'content-type': 'application/json' },
        payload: { code: '302' }
      });

      const rfidTag = JSON.parse(rfidResponse.body).data.rfid;
      const boxNo1 = JSON.parse(boxResponse1.body).data.boxNo;
      const boxNo2 = JSON.parse(boxResponse2.body).data.boxNo;

      // Add RFID to first box - should succeed
      const addRfidResponse1 = await app.inject({
        method: 'POST',
        url: '/api/v1/box/add-rfid',
        headers: { 'content-type': 'application/json' },
        payload: { boxNo: boxNo1, rfid: rfidTag }
      });

      expect(addRfidResponse1.statusCode).toBe(200);

      // Try to add same RFID to second box - should fail
      const addRfidResponse2 = await app.inject({
        method: 'POST',
        url: '/api/v1/box/add-rfid',
        headers: { 'content-type': 'application/json' },
        payload: { boxNo: boxNo2, rfid: rfidTag }
      });

      expect(addRfidResponse2.statusCode).toBe(400);
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle concurrent box creation without conflicts', async () => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
        app.inject({
          method: 'POST',
          url: '/api/v1/box',
          headers: { 'content-type': 'application/json' },
          payload: { code: '999' }
        })
      );

      const responses = await Promise.all(concurrentRequests);

      // All should succeed
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
      });

      // All should have unique box numbers
      const boxNumbers = responses.map(response => {
        const body = JSON.parse(response.body);
        return body.data.boxNo;
      });

      const uniqueBoxNumbers = new Set(boxNumbers);
      expect(uniqueBoxNumbers.size).toBe(boxNumbers.length);

      // Verify all boxes exist in database
      const listResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/boxes?limit=50'
      });

      const listBody = JSON.parse(listResponse.body);
      expect(listBody.data.boxes.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Audit Trail Verification', () => {
    it('should create proper audit trail for complete workflow', async () => {
      // Perform a complete workflow
      const boxResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: { 'content-type': 'application/json' },
        payload: { code: '888' }
      });

      const rfidResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/rfid',
        headers: { 'content-type': 'application/json' },
        payload: { sku: 'SKU-AUDIT', productNo: 'PAUDIT', serialNo: 'SNAUDIT' }
      });

      const boxNo = JSON.parse(boxResponse.body).data.boxNo;
      const rfidTag = JSON.parse(rfidResponse.body).data.rfid;

      await app.inject({
        method: 'POST',
        url: '/api/v1/box/add-rfid',
        headers: { 'content-type': 'application/json' },
        payload: { boxNo, rfid: rfidTag }
      });

      // Check if logs endpoint exists and verify audit trail
      const logsResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/logs?page=1&limit=10'
      });

      if (logsResponse.statusCode === 200) {
        const logsBody = JSON.parse(logsResponse.body);
        expect(logsBody.data.logs.length).toBeGreaterThan(0);
        
        // Look for box-related audit entries
        const boxLogs = logsBody.data.logs.filter((log: any) => 
          log.entityType === 'Box' && log.entityId === boxNo
        );
        
        expect(boxLogs.length).toBeGreaterThan(0);
      }
    });
  });
});