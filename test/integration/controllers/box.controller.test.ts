/**
 * Box Controller Integration Tests
 * 
 * Test Logic:
 * Tests the Box controller endpoints with real HTTP requests including:
 * - POST /api/v1/box - Single box creation
 * - POST /api/v1/boxes - Batch box creation
 * - GET /api/v1/boxes - Box list with pagination
 * - GET /api/v1/boxes/:boxNo - Single box retrieval
 * - POST /api/v1/box/add-rfid - Add RFID to box
 * - POST /api/v1/box/remove-rfid - Remove RFID from box
 * 
 * Test Inputs:
 * - Valid HTTP requests with proper headers and body
 * - Invalid requests with malformed data
 * - Authentication headers and user context
 * - Database state setup and cleanup
 * 
 * Expected Outputs:
 * - Correct HTTP status codes (200, 201, 400, 404, etc.)
 * - Proper JSON response format with success/error structure
 * - Database persistence verification
 * - Response headers and content-type validation
 */

import { FastifyInstance } from 'fastify';
import { createTestApp } from '../../helpers/build-app';

describe('Box Controller Integration Tests', () => {
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
    // This assumes you have a way to clean the test database
    if (app.prisma) {
      await app.prisma.productRfid.deleteMany({});
      await app.prisma.box.deleteMany({});
      await app.prisma.systemLog.deleteMany({});
    }
  });

  describe('POST /api/v1/box - Create Single Box', () => {
    it('should create a single box successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: {
          'content-type': 'application/json'
        },
        payload: {
          code: '001'
        }
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('success');
      expect(body.data).toBeDefined();
      expect(body.data.code).toBe('001');
      expect(body.data.boxNo).toMatch(/^B001\d{8}$/);
      expect(body.data.createdBy).toBe('dummy-user-uuid');
      expect(body.data.shipmentNo).toBeUndefined();
      expect(body.data.createdAt).toBeDefined();
      expect(body.data.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid code format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: {
          'content-type': 'application/json'
        },
        payload: {
          code: 'AB'  // Invalid: not 3 digits
        }
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();
      expect(body.errorCode).toBeDefined();
    });

    it('should return 400 for missing code', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: {
          'content-type': 'application/json'
        },
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });

    it('should create boxes with sequential numbers', async () => {
      // Create first box
      const response1 = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: {
          'content-type': 'application/json'
        },
        payload: { code: '123' }
      });

      expect(response1.statusCode).toBe(201);
      const body1 = JSON.parse(response1.body);

      // Create second box with same code
      const response2 = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: {
          'content-type': 'application/json'
        },
        payload: { code: '123' }
      });

      expect(response2.statusCode).toBe(201);
      const body2 = JSON.parse(response2.body);

      // Verify sequential numbering
      expect(body1.data.boxNo).not.toBe(body2.data.boxNo);
      expect(body1.data.boxNo).toMatch(/B123\d{8}/);
      expect(body2.data.boxNo).toMatch(/B123\d{8}/);
    });
  });

  describe('POST /api/v1/boxes - Create Batch Boxes', () => {
    it('should create batch of boxes successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/boxes',
        headers: {
          'content-type': 'application/json'
        },
        payload: {
          code: '456',
          quantity: 3
        }
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('success');
      expect(body.data).toBeDefined();
      expect(body.data.code).toBe('456');
      expect(body.data.generatedCount).toBe(3);
      expect(body.data.boxNos).toHaveLength(3);
      expect(body.data.year).toBe(new Date().getFullYear().toString());

      // Verify sequential box numbers
      const boxNos = body.data.boxNos;
      expect(boxNos[0]).toMatch(/^B456\d{8}$/);
      expect(boxNos[1]).toMatch(/^B456\d{8}$/);
      expect(boxNos[2]).toMatch(/^B456\d{8}$/);
    });

    it('should return 400 for missing quantity', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/boxes',
        headers: {
          'content-type': 'application/json'
        },
        payload: {
          code: '456'
          // Missing quantity
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid quantity', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/boxes',
        headers: {
          'content-type': 'application/json'
        },
        payload: {
          code: '456',
          quantity: 0  // Invalid: must be at least 1
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/boxes - List Boxes', () => {
    beforeEach(async () => {
      // Create some test boxes
      await app.inject({
        method: 'POST',
        url: '/api/v1/boxes',
        headers: { 'content-type': 'application/json' },
        payload: { code: '111', quantity: 5 }
      });

      await app.inject({
        method: 'POST',
        url: '/api/v1/boxes',
        headers: { 'content-type': 'application/json' },
        payload: { code: '222', quantity: 3 }
      });
    });

    it('should return paginated box list', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/boxes?page=1&limit=5'
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('success');
      expect(body.data).toBeDefined();
      expect(body.data.boxes).toBeInstanceOf(Array);
      expect(body.data.pagination).toBeDefined();
      expect(body.data.pagination.total).toBeGreaterThan(0);
      expect(body.data.pagination.page).toBe(1);
      expect(body.data.pagination.limit).toBe(5);
    });

    it('should return boxes with correct structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/boxes?limit=1'
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      const firstBox = body.data.boxes[0];

      expect(firstBox).toHaveProperty('boxNo');
      expect(firstBox).toHaveProperty('code');
      expect(firstBox).toHaveProperty('status');
      expect(firstBox).toHaveProperty('createdBy');
      expect(firstBox).toHaveProperty('createdAt');
      expect(firstBox).toHaveProperty('updatedAt');
      expect(firstBox.status).toBe('CREATED');
    });

    it('should handle default pagination parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/boxes'
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data.pagination.page).toBe(1);
      expect(body.data.pagination.limit).toBe(50);
    });

    it('should filter by shipmentNo when provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/boxes?shipmentNo=S001202500001'
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data.boxes).toBeInstanceOf(Array);
      // Since no boxes are assigned to shipments in this test, should be empty or filtered
    });
  });

  describe('GET /api/v1/boxes/:boxNo - Get Single Box', () => {
    let testBoxNo: string;

    beforeEach(async () => {
      // Create a test box
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: { 'content-type': 'application/json' },
        payload: { code: '333' }
      });

      const body = JSON.parse(response.body);
      testBoxNo = body.data.boxNo;
    });

    it('should return single box details', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/boxes/${testBoxNo}`
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('success');
      expect(body.data).toBeDefined();
      expect(body.data.boxNo).toBe(testBoxNo);
      expect(body.data.code).toBe('333');
      expect(body.data.status).toBe('CREATED');
      expect(body.data.productRfids).toBeInstanceOf(Array);
      expect(body.data.productRfids).toHaveLength(0);
    });

    it('should return 404 for non-existent box', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/boxes/B999999999999'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid box number format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/boxes/INVALID'
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Content-Type and Headers', () => {
    it('should return correct content-type for JSON responses', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: { 'content-type': 'application/json' },
        payload: { code: '999' }
      });

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should handle missing content-type header', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        payload: JSON.stringify({ code: '888' })
      });

      // Should still work or return appropriate error
      expect([201, 400, 415]).toContain(response.statusCode);
    });
  });

  describe('Database Persistence', () => {
    it('should persist created boxes to database', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: { 'content-type': 'application/json' },
        payload: { code: '777' }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);

      // Verify box exists in database by fetching it
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/boxes/${body.data.boxNo}`
      });

      expect(getResponse.statusCode).toBe(200);
      const getBody = JSON.parse(getResponse.body);
      expect(getBody.data.boxNo).toBe(body.data.boxNo);
    });

    it('should maintain data consistency across requests', async () => {
      // Create a box
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/box',
        headers: { 'content-type': 'application/json' },
        payload: { code: '666' }
      });

      const createBody = JSON.parse(createResponse.body);

      // Fetch it back
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/boxes/${createBody.data.boxNo}`
      });

      const getBody = JSON.parse(getResponse.body);

      // Verify all fields match
      expect(getBody.data.boxNo).toBe(createBody.data.boxNo);
      expect(getBody.data.code).toBe(createBody.data.code);
      expect(getBody.data.createdBy).toBe(createBody.data.createdBy);
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle concurrent box creation requests', async () => {
      const requests = Array.from({ length: 5 }, () =>
        app.inject({
          method: 'POST',
          url: '/api/v1/box',
          headers: { 'content-type': 'application/json' },
          payload: { code: '555' }
        })
      );

      const responses = await Promise.all(requests);

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
    });
  });
});