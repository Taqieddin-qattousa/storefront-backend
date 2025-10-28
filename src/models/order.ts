// Order model: orders and order_products operations.
import client from '../database';

export type Order = {
  id?: number;
  user_id: string;
  status: string;
};

export type OrderProduct = {
  id?: number;
  quantity: number;
  order_id: string;
  product_id: string;
};

export class OrderStore {
  async getCurrentOrderByUser(userId: string): Promise<Order | null> {
    try {
      const sql =
        "SELECT * FROM orders WHERE user_id=($1) AND status='active' LIMIT 1";
      const conn = await client.connect();
      const result = await conn.query(sql, [parseInt(userId)]);
      conn.release();
      return result.rows[0] || null;
    } catch (err) {
      throw new Error(
        `Could not get current order for user ${userId}. Error: ${err}`
      );
    }
  }

  async getCompletedOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const sql =
        "SELECT * FROM orders WHERE user_id=($1) AND status='complete'";
      const conn = await client.connect();
      const result = await conn.query(sql, [parseInt(userId)]);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get completed orders for user ${userId}. Error: ${err}`
      );
    }
  }

  async create(userId: string): Promise<Order> {
    try {
      const sql =
        "INSERT INTO orders (user_id, status) VALUES($1, 'active') RETURNING *";
      const conn = await client.connect();
      const result = await conn.query(sql, [parseInt(userId)]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not create order for user ${userId}. Error: ${err}`
      );
    }
  }

  async addProduct(
    quantity: number,
    orderId: string,
    productId: string
  ): Promise<OrderProduct> {
    try {
      const sql =
        'INSERT INTO order_products (quantity, order_id, product_id) VALUES($1, $2, $3) RETURNING *';
      const conn = await client.connect();
      const result = await conn.query(sql, [
        quantity,
        parseInt(orderId),
        parseInt(productId),
      ]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not add product ${productId} to order ${orderId}. Error: ${err}`
      );
    }
  }

  async getRecentPurchases(userId: string): Promise<OrderProduct[]> {
    try {
      const sql = `
        SELECT op.id, op.quantity, op.order_id, op.product_id, 
               p.name, p.price, p.category, o.status
        FROM order_products op
        INNER JOIN orders o ON op.order_id = o.id
        INNER JOIN products p ON op.product_id = p.id
        WHERE o.user_id = $1 AND o.status = 'complete'
        ORDER BY o.id DESC
        LIMIT 5
      `;
      const conn = await client.connect();
      const result = await conn.query(sql, [parseInt(userId)]);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get recent purchases for user ${userId}. Error: ${err}`
      );
    }
  }
}
