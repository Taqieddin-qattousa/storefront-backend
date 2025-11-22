// Order handlers and route registration.
// All endpoints require auth.
import express, { Request, Response } from 'express';
import { OrderStore } from '../models/order';
import verifyAuthToken from '../services/auth';
import client from '../database';

const store = new OrderStore();

/** Get the current active order (cart) for a user */
const getCurrentOrderByUser = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.userId;
    const order = await store.getCurrentOrderByUser(userId);
    res.json(order);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

/** Get completed orders for a user */
const getCompletedOrdersByUser = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.userId;
    const orders = await store.getCompletedOrdersByUser(userId);
    res.json(orders);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

/** Create a new order (cart) for a user */
const create = async (req: Request, res: Response) => {
  try {
    const userId: string = req.body.userId;
    const newOrder = await store.create(userId);
    res.json(newOrder);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

/** Add a product to an order (cart) */
const addProduct = async (req: Request, res: Response) => {
  try {
    const orderId: string = req.params.id;
    const productId: string = req.body.productId;
    const quantity: number = parseInt(req.body.quantity);

    const addedProduct = await store.addProduct(quantity, orderId, productId);
    res.json(addedProduct);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

/** Mark an order as complete */
const completeOrder = async (req: Request, res: Response) => {
  try {
    const orderId: string = req.params.id;
    const conn = await client.connect();
    const sql = 'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *';
    const result = await conn.query(sql, ['complete', parseInt(orderId)]);
    conn.release();

    if (!result.rows[0]) {
      res.status(404).json(`Order with ID ${orderId} not found.`);
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

const orderRoutes = (app: express.Application) => {
  app.post('/orders', verifyAuthToken, create);
  app.post('/orders/:id/products', verifyAuthToken, addProduct);
  app.put('/orders/:id/complete', verifyAuthToken, completeOrder);
  app.get('/orders/current/:userId', verifyAuthToken, getCurrentOrderByUser);
  app.get('/orders/completed/:userId', verifyAuthToken, getCompletedOrdersByUser);
};

export default orderRoutes;
