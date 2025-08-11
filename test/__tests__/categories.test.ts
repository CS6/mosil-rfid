import { FastifyInstance } from 'fastify';
import { PrismaClient, Category } from '@prisma/client';
import { createTestApp } from '../helpers/build-app';

describe('Categories API', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;

  beforeAll(async () => {
    app = await createTestApp();
    await app.ready();
    prisma = app.prisma;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/categories', () => {
    it('should return empty array when no categories exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/categories',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual({ message: 'No elements found' });
    });

    it('should return categories with pagination', async () => {
      // Create test categories
      const categories: Category[] = [];
      for (let i = 0; i < 15; i++) {
        categories.push(
          await prisma.category.create({
            data: {
              name: `Category ${i + 1}`,
            },
          })
        );
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/categories?take=10',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.results).toHaveLength(10);
      expect(body.total).toBe(15);
      expect(body.results[0]).toHaveProperty('id');
      expect(body.results[0]).toHaveProperty('name');
      expect(body.results[0]).toHaveProperty('createdAt');
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should return 404 for non-existent category', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/categories/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Category not found');
    });

    it('should return category by id', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/categories/${category.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBe(category.id);
      expect(body.name).toBe('Test Category');
    });
  });

  describe('POST /api/v1/categories', () => {
    it('should create a new category', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/categories',
        payload: {
          name: 'New Category',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('New Category');

      // Verify category was created
      const created = await prisma.category.findUnique({
        where: { id: body.id },
      });
      expect(created).toBeTruthy();
      expect(created?.name).toBe('New Category');
    });

    it('should return 400 for invalid payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/categories',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/v1/categories/:id', () => {
    it('should update an existing category', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Original Name',
        },
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/categories/${category.id}`,
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.name).toBe('Updated Name');

      // Verify category was updated
      const updated = await prisma.category.findUnique({
        where: { id: category.id },
      });
      expect(updated?.name).toBe('Updated Name');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/categories/00000000-0000-0000-0000-000000000000',
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('should delete an existing category', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'To Delete',
        },
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/categories/${category.id}`,
      });

      expect(response.statusCode).toBe(204);

      // Verify category was deleted
      const deleted = await prisma.category.findUnique({
        where: { id: category.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent category', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/categories/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});