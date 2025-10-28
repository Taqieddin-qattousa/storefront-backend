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
    const updated = await store.update(testProduct.id!.toString(), {
      price: 2000,
      category: 'Updated Books',
    });
    expect(updated.id).toEqual(testProduct.id);
    expect(updated.name).toEqual('Test Book');
    expect(updated.price).toEqual(2000);
    expect(updated.category).toEqual('Updated Books');
  });

  it('should have an indexByCategory method', () => {
    expect(store.indexByCategory).toBeDefined();
  });

  it('indexByCategory method should return products in the specified category', async () => {
    await store.create({
      name: 'Another Book',
      price: 1200,
      category: 'Books',
    });
    await store.create({
      name: 'Laptop',
      price: 50000,
      category: 'Electronics',
    });

    const booksResult = await store.indexByCategory('Books');
    expect(booksResult.length).toEqual(2);
    expect(booksResult.every((p) => p.category === 'Books')).toBeTrue();

    const electronicsResult = await store.indexByCategory('Electronics');
    expect(electronicsResult.length).toEqual(1);
    expect(electronicsResult[0].name).toEqual('Laptop');
  });

  it('should have a getTopProducts method', () => {
    expect(store.getTopProducts).toBeDefined();
  });

  afterAll(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE products RESTART IDENTITY CASCADE;');
    conn.release();
  });
});
