// Order handlers and route registration.
// All endpoints require auth.
import express, { Request, Response } from 'express';
import { OrderStore } from '../models/order';
import verifyAuthToken from '../services/auth';

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

/** Register order endpoints (all require auth) */
const orderRoutes = (app: express.Application) => {
  app.get('/orders/current/:userId', verifyAuthToken, getCurrentOrderByUser);
  app.get(
    '/orders/completed/:userId',
    verifyAuthToken,
    getCompletedOrdersByUser
  );
  app.post('/orders', verifyAuthToken, create);
  app.post('/orders/:id/products', verifyAuthToken, addProduct);
};

export default orderRoutes;
