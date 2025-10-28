// Product model: queries for products.
import client from '../database';

export type Product = {
  id?: number;
  name: string;
  price: number;
  category?: string;
};

export class ProductStore {
  async index(): Promise<Product[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM products';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get products. Error: ${err}`);
    }
  }

  async show(id: string): Promise<Product> {
    try {
      const sql = 'SELECT * FROM products WHERE id=($1)';
      const conn = await client.connect();
      const result = await conn.query(sql, [parseInt(id)]);
      conn.release();

      if (!result.rows[0]) {
        throw new Error(`Product with ID ${id} not found.`);
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not find product ${id}. Error: ${err}`);
    }
  }

  async create(p: Product): Promise<Product> {
    try {
      const conn = await client.connect();
      const sql =
        'INSERT INTO products (name, price, category) VALUES($1, $2, $3) RETURNING *';
      const result = await conn.query(sql, [p.name, p.price, p.category]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create product. Error: ${err}`);
    }
  }
  // Method to update an existing product (Update)
  async update(p: Product): Promise<Product> {
    // Check if the product ID exists
    if (!p.id) {
      throw new Error('Product ID is required for update.');
    }
    try {
      const conn = await client.connect();
      const sql =
        'UPDATE products SET name = $1, price = $2, category = $3 WHERE id = $4 RETURNING *';
      const result = await conn.query(sql, [p.name, p.price, p.category, p.id]);
      conn.release();

      if (!result.rows[0]) {
        throw new Error(`Could not update product ${p.id}. Product not found.`);
      }

      return result.rows[0];
    } catch (err) {
      if ((err as Error).message.includes('not found')) {
        throw err;
      }
      throw new Error(`Could not update product ${p.id}. Error: ${err}`);
    }
  }
  async delete(id: string): Promise<Product> {
    try {
      const conn = await client.connect();
      const sql = 'DELETE FROM products WHERE id=($1) RETURNING *';
      const result = await conn.query(sql, [parseInt(id)]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not delete product ${id}. Error: ${err}`);
    }
  }
}
