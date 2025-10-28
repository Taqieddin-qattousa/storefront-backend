// User handlers and route registration.
// Notes:
// - Read operations require auth (see route wiring below).
// - Create returns a signed JWT for the newly created user.
import express, { Request, Response } from 'express';
import { User, UserStore } from '../models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import verifyAuthToken from '../services/auth';

dotenv.config();

const store = new UserStore();
const { TOKEN_SECRET } = process.env;

const index = async (_req: Request, res: Response) => {
  try {
    const users = await store.index();
    res.json(users);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

const show = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.id;
    const user = await store.show(userId);
    res.json(user);
  } catch (err) {
    const error = err as Error;
    if (error.message.includes('not found')) {
      res.status(404).json(error.message);
    } else {
      res.status(400).json(error.message);
    }
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const u: User = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
    };

    const newUser = await store.create(u);
    const token = jwt.sign({ user: newUser }, TOKEN_SECRET as string);
    res.json({ token });
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

const userRoutes = (app: express.Application) => {
  app.get('/users', verifyAuthToken, index);
  app.get('/users/:id', verifyAuthToken, show);
  app.post('/users', create);
};

export default userRoutes;
