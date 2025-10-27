import express, { Request, Response } from 'express';
import { OrderStore } from '../models/order';
import verifyAuthToken from '../services/auth';

const store = new OrderStore();

// Handler for Get Current Order (Cart) for a User
const getCurrentOrder = async (req: Request, res: Response) => {
  try {
    // We get the user ID from the URL parameters
    const currentOrder = await store.getCurrentOrderByUser(req.params.userId);
    res.json(currentOrder);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

// Handler for Adding a Product to an Order (Cart)
const addProductToOrder = async (req: Request, res: Response) => {
  try {
    const orderId: string = req.params.id; // The ID of the order (cart)
    const productId: string = req.body.productId;
    const quantity: number = parseInt(req.body.quantity);

    // Basic validation
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json('Missing or invalid productId or quantity.');
    }

    const addedProduct = await store.addProduct(quantity, orderId, productId);
    res.json(addedProduct);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

// Handler for Creating a New Order (Cart)
// Useful for when a new user is created
const createOrder = async (req: Request, res: Response) => {
  try {
    // We expect the user ID in the request body
    const userId: string = req.body.userId;
    if (!userId) {
      return res.status(400).json('User ID is required.');
    }
    const newOrder = await store.create(userId);
    res.json(newOrder);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

// Handler for Get Completed Orders for a User
const getCompletedOrders = async (req: Request, res: Response) => {
  try {
    const completedOrders = await store.getCompletedOrdersByUser(
      req.params.userId
    );
    res.json(completedOrders);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

// Group all our order routes
const orderRoutes = (app: express.Application) => {
  app.get('/orders/current/:userId', verifyAuthToken, getCurrentOrder);
  app.post('/orders/:id/products', verifyAuthToken, addProductToOrder);
  app.post('/orders', verifyAuthToken, createOrder); // Create a new cart
  app.get('/orders/completed/:userId', verifyAuthToken, getCompletedOrders); // Get past orders
};

export default orderRoutes;
