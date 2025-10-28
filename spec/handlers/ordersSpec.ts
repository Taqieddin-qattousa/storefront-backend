/// <reference types="jasmine" />

import supertest from 'supertest';
import app from '../../src/server';
import { OrderStore, Order } from '../../src/models/order';
import { UserStore, User } from '../../src/models/user';
import { ProductStore, Product } from '../../src/models/product';
import client from '../../src/database';

const request = supertest(app);
const orderStore = new OrderStore();
const userStore = new UserStore();
const productStore = new ProductStore();

let token: string;
let testUser: User;
let testProduct: Product;
let testOrder: Order;

describe('Order Handler Endpoints', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE users RESTART IDENTITY CASCADE;');
    await conn.query('TRUNCATE products RESTART IDENTITY CASCADE;');
    await conn.query('TRUNCATE orders RESTART IDENTITY CASCADE;');
    await conn.query('TRUNCATE order_products RESTART IDENTITY CASCADE;');
    conn.release();

    testUser = await userStore.create({
      firstName: 'OrderHandlerTest',
      lastName: 'User',
      password: 'password123',
    });

    testProduct = await productStore.create({
      name: 'Order Handler Test Product',
      price: 3000,
      category: 'HandlerTest',
    });

    const authResponse = await request.post('/users').send({
      firstName: 'OrderHandlerTest',
      lastName: 'User',
      password: 'password123',
    });
    token = authResponse.body.token;
    if (!token) throw new Error('Could not obtain token');

    testOrder = await orderStore.create(testUser.id!.toString());
  });

  it('POST /orders/:id/products should add a product to the order (requires token)', async () => {
    const quantity = 10;
    const response = await request
      .post(`/orders/${testOrder.id}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct.id!.toString(), quantity: quantity });

    expect(response.status).toBe(200);
    expect(response.body.quantity).toEqual(quantity);
    expect(parseInt(response.body.order_id as string)).toEqual(testOrder.id!);
    expect(parseInt(response.body.product_id as string)).toEqual(
      testProduct.id!
    );
  });

  it('POST /orders/:id/products should return 401 without a token', async () => {
    const quantity = 5;
    const response = await request
      .post(`/orders/${testOrder.id}/products`)
      .send({ productId: testProduct.id!.toString(), quantity: quantity });

    expect(response.status).toBe(401);
  });

  it('GET /orders/current/:userId should return the active order (requires token)', async () => {
    const response = await request
      .get(`/orders/current/${testUser.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(testOrder.id);
    expect(response.body.status).toEqual('active');
    expect(parseInt(response.body.user_id as string)).toEqual(testUser.id!);
  });

  it('GET /orders/current/:userId should return 401 without a token', async () => {
    const response = await request.get(`/orders/current/${testUser.id}`);
    expect(response.status).toBe(401);
  });

  it('GET /orders/completed/:userId should return empty list initially (requires token)', async () => {
    const response = await request
      .get(`/orders/completed/${testUser.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('POST /orders should create a new order (requires token)', async () => {
    const newUser = await userStore.create({
      firstName: 'NewOrderTest',
      lastName: 'User',
      password: 'pw',
    });
    const authResponse = await request
      .post('/users')
      .send({ firstName: 'NewOrderTest', lastName: 'User', password: 'pw' });
    const newToken = authResponse.body.token;

    const response = await request
      .post('/orders')
      .set('Authorization', `Bearer ${newToken}`)
      .send({ userId: newUser.id!.toString() });

    expect(response.status).toBe(200);
    expect(response.body.status).toEqual('active');
    expect(parseInt(response.body.user_id as string)).toEqual(newUser.id!);
    expect(response.body.id).toBeDefined();
  });

  afterAll(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE users RESTART IDENTITY CASCADE;');
    await conn.query('TRUNCATE products RESTART IDENTITY CASCADE;');
    await conn.query('TRUNCATE orders RESTART IDENTITY CASCADE;');
    await conn.query('TRUNCATE order_products RESTART IDENTITY CASCADE;');
    conn.release();
  });
});
