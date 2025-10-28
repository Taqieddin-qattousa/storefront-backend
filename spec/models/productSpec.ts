import { ProductStore, Product } from '../../src/models/product';
import client from '../../src/database';

const store = new ProductStore();
let testProduct: Product;

describe('Product Model', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE products RESTART IDENTITY CASCADE;');
    conn.release();

    testProduct = await store.create({
      name: 'Test Book',
      price: 1550,
      category: 'Books',
    });
  });

  it('should have a create method', () => {
    expect(store.create).toBeDefined();
  });

  it('create method should add a new product', async () => {
    expect(testProduct.name).toEqual('Test Book');
    expect(testProduct.price).toEqual(1550);
    expect(testProduct.category).toEqual('Books');
    expect(testProduct.id).toBeDefined();
  });

  it('should have an index method', () => {
    expect(store.index).toBeDefined();
  });

  it('index method should return a list containing the created product', async () => {
    const result = await store.index();
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual(testProduct.id);
    expect(result[0].name).toEqual('Test Book');
  });

  it('should have a show method', () => {
    expect(store.show).toBeDefined();
  });

  it('show method should return the correct product', async () => {
    const result = await store.show(testProduct.id!.toString());
    expect(result.id).toEqual(testProduct.id);
    expect(result.name).toEqual('Test Book');
  });

  it('should have a delete method', () => {
    expect(store.delete).toBeDefined();
  });

  it('delete method should remove the product', async () => {
    await store.delete(testProduct.id!.toString());
    const result = await store.index();
    expect(result.length).toEqual(0);
  });

  it('should have an update method', () => {
    expect(store.update).toBeDefined();
  });

  it('update method should update the product data', async () => {
    const updatedProductData: Product = {
      id: testProduct.id,
      name: 'Updated Test Book',
      price: 1999,
      category: 'Updated Books',
    };

    const updatedProduct = await store.update(updatedProductData);

    expect(updatedProduct.id).toEqual(testProduct.id);
    expect(updatedProduct.name).toEqual(updatedProductData.name);
    expect(updatedProduct.price).toEqual(updatedProductData.price);
    expect(updatedProduct.category).toEqual(updatedProductData.category);

    const refetchedProduct = await store.show(testProduct.id!.toString());
    expect(refetchedProduct.name).toEqual(updatedProductData.name);
  });

  afterAll(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE products RESTART IDENTITY CASCADE;');
    conn.release();
  });
});
