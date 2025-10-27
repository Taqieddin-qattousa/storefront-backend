import express, { Request, Response } from 'express';
import { Product, ProductStore } from '../models/product';

const store = new ProductStore();

// Handler function for Index (Get All Products)
const index = async (_req: Request, res: Response) => {
  try {
    const products = await store.index();
    res.json(products);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

// Handler function for Show (Get One Product)
const show = async (req: Request, res: Response) => {
  try {
    const productId: string = req.params.id;
    const product = await store.show(productId);
    res.json(product);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

// Handler function for Create (New Product)
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

// This function will group all our product routes
const productRoutes = (app: express.Application) => {
  app.get('/products', index);
  app.get('/products/:id', show);
  app.post('/products', create);
};

export default productRoutes;
