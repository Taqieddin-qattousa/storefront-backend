import client from '../database';

export type Order = {
  id?: number;
  user_id: string | number;
  quantity: number;
  status: 'active' | 'complete';
};

export type OrderProduct = {
  id?: number;
  quantity: number;
  order_id: string | number;
  product_id: string | number;
};

export class OrderStore {
  // Get the current active order for a user
  async getCurrentOrderByUser(userId: string | number): Promise<Order> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM orders WHERE user_id=($1) AND status=($2)';
      const result = await conn.query(sql, [userId, 'active']);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not get current order for user ${userId}. Error: ${err}`
      );
    }
  }

  //This is the main "cart" functionality: adding products to an order
  async addProduct(
    quantity: number,
    orderId: string,
    productId: string
  ): Promise<OrderProduct> {
    try {
      const conn = await client.connect();
      const sql =
        'INSERT INTO order_products (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *';
      const result = await conn.query(sql, [quantity, orderId, productId]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not add product ${productId} to order ${orderId}. Error: ${err}`
      );
    }
  }

  //Method to create a new order (e.g., when user signs up )
  async create(userId: string): Promise<Order> {
    try {
      const conn = await client.connect();
      const sql =
        'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *';
      const result = await conn.query(sql, [userId, 'active']);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not create order for user ${userId}. Error: ${err}`
      );
    }
  }
  //Method to get completed orders for a user -- Additional functionality
  async getCompletedOrdersByUser(userId: string | number): Promise<Order[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM orders WHERE user_id=($1) AND status=($2)';
      const result = await conn.query(sql, [userId, 'complete']);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get completed orders for user ${userId}. Error: ${err}`
      );
    }
  }
}
