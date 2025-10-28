/// <reference types="jasmine" />

import supertest from 'supertest';
import app from '../../src/server';
import { Product } from '../../src/models/product';
import { UserStore, User } from '../../src/models/user';
import client from '../../src/database';

const request = supertest(app);
const userStore = new UserStore();

let token: string;
let _testUser: User;
let createdProduct: Product;

describe('Product Handler Endpoints', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE users RESTART IDENTITY CASCADE;');
    await conn.query('TRUNCATE products RESTART IDENTITY CASCADE;');
    conn.release();

    _testUser = await userStore.create({
      firstName: 'ProductTest',
      lastName: 'User',
      password: 'password123',
    });

    const authResponse = await request.post('/users').send({
      firstName: 'ProductTest',
      lastName: 'User',
      password: 'password123',
    });
    token = authResponse.body.token;

    if (!token) {
      throw new Error('Could not obtain JWT token for testing');
    }

    createdProduct = (
      await request
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Product BeforeEach',
          price: 1000,
          category: 'Test Category',
        })
    ).body;
  });

  it('GET /products should return a list containing one product', async () => {
    const response = await request.get('/products');
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(1);
    expect(response.body[0].name).toEqual('Test Product BeforeEach');
  });

  it('POST /products should create a new product (requires token)', async () => {
    const newProductData = {
      name: 'Super Monitor',
      price: 65000,
      category: 'Electronics',
    };

    const response = await request
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProductData);

    expect(response.status).toBe(200);
    expect(response.body.name).toEqual(newProductData.name);
    expect(response.body.price).toEqual(newProductData.price);
    expect(response.body.id).toBeDefined();
    expect(response.body.id).not.toEqual(createdProduct.id);
  });

  it('POST /products should return 401 if no token is provided', async () => {
    const newProductData = {
      name: 'Another Monitor',
      price: 70000,
      category: 'Electronics',
    };

    const response = await request.post('/products').send(newProductData);
    expect(response.status).toBe(401);
  });

  it('GET /products/:id should return the correct product', async () => {
    const response = await request.get(`/products/${createdProduct.id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(createdProduct.id);
    expect(response.body.name).toEqual('Test Product BeforeEach');
  });

  it('GET /products/:id should return 404 for non-existent product', async () => {
    const nonExistentId = 9999;
    const response = await request.get(`/products/${nonExistentId}`);
    expect(response.status).toBe(404);
  });
});
