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

  async update(id: string, p: Partial<Product>): Promise<Product> {
    try {
      const conn = await client.connect();
      const sql =
        'UPDATE products SET name = COALESCE($1, name), price = COALESCE($2, price), category = COALESCE($3, category) WHERE id = $4 RETURNING *';
      const result = await conn.query(sql, [
        p.name ?? null,
        p.price ?? null,
        p.category ?? null,
        parseInt(id),
      ]);
      conn.release();

      if (!result.rows[0]) {
        throw new Error(`Product with ID ${id} not found.`);
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not update product ${id}. Error: ${err}`);
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

  async indexByCategory(category: string): Promise<Product[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM products WHERE category = $1';
      const result = await conn.query(sql, [category]);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get products by category. Error: ${err}`);
    }
  }

  async getTopProducts(): Promise<Product[]> {
    try {
      const conn = await client.connect();
      const sql = `
        SELECT p.id, p.name, p.price, p.category, SUM(op.quantity) as total_quantity
        FROM products p
        INNER JOIN order_products op ON p.id = op.product_id
        GROUP BY p.id
        ORDER BY total_quantity DESC
        LIMIT 5
      `;
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get top products. Error: ${err}`);
    }
  }
}
