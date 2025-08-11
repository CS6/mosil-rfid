import { FastifyInstance } from 'fastify';
import { PrismaClient, Product, Category } from '@prisma/client';
import { createTestApp } from '../helpers/build-app';

describe('Products API', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;
  let testCategory: Category;

  beforeAll(async () => {
    app = await createTestApp();
    await app.ready();
    prisma = app.prisma;
  });

  beforeEach(async () => {
    // Create a test category for products
    testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/products', () => {
    it('should return empty array when no products exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual({ message: 'No elements found' });
    });

    it('should return products with pagination', async () => {
      // Create test products
      const products: Product[] = [];
      for (let i = 0; i < 15; i++) {
        products.push(
          await prisma.product.create({
            data: {
              name: `Product ${i + 1}`,
              price: (i + 1) * 10,
              published: i % 2 === 0,
              categoryId: testCategory.id,
            },
          })
        );
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products?take=10',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.results).toHaveLength(10);
      expect(body.total).toBe(15);
      expect(body.results[0]).toHaveProperty('id');
      expect(body.results[0]).toHaveProperty('name');
      expect(body.results[0]).toHaveProperty('price');
      expect(body.results[0]).toHaveProperty('published');
      expect(body.results[0]).toHaveProperty('category');
    });

    it('should filter products by published status', async () => {
      // Create test products
      await prisma.product.createMany({
        data: [
          { name: 'Published 1', price: 100, published: true, categoryId: testCategory.id },
          { name: 'Published 2', price: 200, published: true, categoryId: testCategory.id },
          { name: 'Unpublished 1', price: 300, published: false, categoryId: testCategory.id },
        ],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products?published=true',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.results).toHaveLength(2);
      expect(body.results.every((p: Product) => p.published)).toBe(true);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Product not found');
    });

    it('should return product by id with category', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 99.99,
          published: true,
          categoryId: testCategory.id,
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/products/${product.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBe(product.id);
      expect(body.name).toBe('Test Product');
      expect(body.price).toBe(99.99);
      expect(body.category.id).toBe(testCategory.id);
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'New Product',
          price: 49.99,
          published: true,
          categoryId: testCategory.id,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('New Product');
      expect(body.price).toBe(49.99);
      expect(body.published).toBe(true);

      // Verify product was created
      const created = await prisma.product.findUnique({
        where: { id: body.id },
      });
      expect(created).toBeTruthy();
      expect(created?.name).toBe('New Product');
    });

    it('should create product without category', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'Product without category',
          price: 29.99,
          published: false,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.categoryId).toBeNull();
    });

    it('should return 400 for invalid payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'Invalid Product',
          // Missing required price field
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update an existing product', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Original Product',
          price: 100,
          published: false,
          categoryId: testCategory.id,
        },
      });

      const newCategory = await prisma.category.create({
        data: {
          name: 'New Category',
        },
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/products/${product.id}`,
        payload: {
          name: 'Updated Product',
          price: 150,
          published: true,
          categoryId: newCategory.id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.name).toBe('Updated Product');
      expect(body.price).toBe(150);
      expect(body.published).toBe(true);
      expect(body.categoryId).toBe(newCategory.id);

      // Verify product was updated
      const updated = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(updated?.name).toBe('Updated Product');
      expect(updated?.price).toBe(150);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/products/00000000-0000-0000-0000-000000000000',
        payload: {
          name: 'Updated Product',
          price: 100,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete an existing product', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'To Delete',
          price: 50,
          published: true,
          categoryId: testCategory.id,
        },
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/products/${product.id}`,
      });

      expect(response.statusCode).toBe(204);

      // Verify product was deleted
      const deleted = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/products/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});