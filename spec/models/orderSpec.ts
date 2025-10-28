/// <reference types="jasmine" />

import { OrderStore, Order, OrderProduct } from '../../src/models/order';
import { UserStore, User } from '../../src/models/user';
import { ProductStore, Product } from '../../src/models/product';
import client from '../../src/database';

const orderStore = new OrderStore();
const userStore = new UserStore();
const productStore = new ProductStore();

let testUser: User;
let testProduct: Product;
let testOrder: Order;

describe('Order Model', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE users RESTART IDENTITY CASCADE;');
    await conn.query('TRUNCATE products RESTART IDENTITY CASCADE;');
    await conn.query('TRUNCATE orders RESTART IDENTITY CASCADE;');
    await conn.query('TRUNCATE order_products RESTART IDENTITY CASCADE;');
    conn.release();

    testUser = await userStore.create({
      firstName: 'OrderTest',
      lastName: 'User',
      password: 'password123',
    });

    testProduct = await productStore.create({
      name: 'Order Test Product',
      price: 2000,
      category: 'Testing',
    });

    testOrder = await orderStore.create(testUser.id!.toString());
  });

  it('should have a create method', () => {
    expect(orderStore.create).toBeDefined();
  });

  it('create method should create a new active order', async () => {
    expect(testOrder.status).toEqual('active');
    expect(parseInt(testOrder.user_id as string)).toEqual(testUser.id!);
    expect(testOrder.id).toBeDefined();
  });

  it('should have an addProduct method', () => {
    expect(orderStore.addProduct).toBeDefined();
  });

  it('addProduct method should add a product to the order', async () => {
    const quantity = 5;
    const addedProduct: OrderProduct = await orderStore.addProduct(
      quantity,
      testOrder.id!.toString(),
      testProduct.id!.toString()
    );

    expect(parseInt(addedProduct.order_id as string)).toEqual(testOrder.id!);
    expect(parseInt(addedProduct.product_id as string)).toEqual(
      testProduct.id!
    );
    expect(addedProduct.quantity).toEqual(quantity);
    expect(addedProduct.id).toBeDefined();
  });

  it('should have a getCurrentOrderByUser method', () => {
    expect(orderStore.getCurrentOrderByUser).toBeDefined();
  });

  it('getCurrentOrderByUser method should return the active order for the user', async () => {
    const currentOrder = await orderStore.getCurrentOrderByUser(
      testUser.id!.toString()
    );

    expect(currentOrder).toBeDefined();
    if (currentOrder) {
      expect(currentOrder.id).toEqual(testOrder.id!);
      expect(currentOrder.status).toEqual('active');
      expect(parseInt(currentOrder.user_id as string)).toEqual(testUser.id!);
    }
  });

  it('should have a getCompletedOrdersByUser method', () => {
    expect(orderStore.getCompletedOrdersByUser).toBeDefined();
  });

  it('getCompletedOrdersByUser method should return an empty list initially', async () => {
    const completedOrders = await orderStore.getCompletedOrdersByUser(
      testUser.id!.toString()
    );
    expect(completedOrders).toEqual([]);
  });

  it('should have a getRecentPurchases method', () => {
    expect(orderStore.getRecentPurchases).toBeDefined();
  });

  it('getRecentPurchases method should return empty array for user with no completed orders', async () => {
    const purchases = await orderStore.getRecentPurchases(
      testUser.id!.toString()
    );
    expect(purchases).toEqual([]);
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
