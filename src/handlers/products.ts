// Product handlers and route registration.
// Create is public; reads are public.
import express, { Request, Response } from 'express';
import { Product, ProductStore } from '../models/product';
import verifyAuthToken from '../services/auth';

const store = new ProductStore();

/** Get all products, optionally filtered by category */
const index = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const products = category
      ? await store.indexByCategory(category)
      : await store.index();
    res.json(products);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

/** Get one product by id */
const show = async (req: Request, res: Response) => {
  try {
    const productId: string = req.params.id;
    const product = await store.show(productId);
    res.json(product);
  } catch (err) {
    const error = err as Error;
    if (error.message.includes('not found')) {
      res.status(404).json(error.message);
    } else {
      res.status(400).json(error.message);
    }
  }
};

/** Create a new product */
const create = async (req: Request, res: Response) => {
  try {
    const p: Product = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
    };

    const newProduct = await store.create(p);
    res.json(newProduct);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

/** Update a product */
const update = async (req: Request, res: Response) => {
  try {
    const productId: string = req.params.id;
    const p: Partial<Product> = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
    };

    const updatedProduct = await store.update(productId, p);
    res.json(updatedProduct);
  } catch (err) {
    const error = err as Error;
    if (error.message.includes('not found')) {
      res.status(404).json(error.message);
    } else {
      res.status(400).json(error.message);
    }
  }
};

/** Delete a product */
const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId: string = req.params.id;
    const deletedProduct = await store.delete(productId);
    res.json(deletedProduct);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

/** Get top 5 popular products */
const popular = async (_req: Request, res: Response) => {
  try {
    const products = await store.getTopProducts();
    res.json(products);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

/** Register product endpoints */
const productRoutes = (app: express.Application) => {
  app.get('/products/popular', popular);
  app.get('/products', index);
  app.get('/products/:id', show);
  app.post('/products', verifyAuthToken, create);
  app.put('/products/:id', verifyAuthToken, update);
  app.delete('/products/:id', verifyAuthToken, deleteProduct);
};

export default productRoutes;
