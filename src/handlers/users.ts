import express, { Request, Response } from 'express';
import { User, UserStore } from '../models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import verifyAuthToken from '../services/auth';

dotenv.config();

const store = new UserStore();
const { TOKEN_SECRET } = process.env;

if (!TOKEN_SECRET) {
  throw new Error('TOKEN_SECRET is not defined in environment variables');
}

// Handler function for Index (Get All Users)
const index = async (_req: Request, res: Response) => {
  try {
    const users = await store.index();
    res.json(users);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

// Handler function for Show (Get One User)
const show = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.id;
    const user = await store.show(userId);
    res.json(user);
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

// Handler function for Create (New User)
const create = async (req: Request, res: Response) => {
  try {
    const u: User = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: req.body.password,
    };

    const newUser = await store.create(u);

    //Sign a new token for the new user
    const token = jwt.sign(
      { user: { id: newUser.id, firstName: newUser.firstname } }, // The payload
      TOKEN_SECRET
    );

    //Return the token to the client
    res.json({ token });
  } catch (err) {
    res.status(400).json((err as Error).message);
  }
};

// This function will group all our user routes
const userRoutes = (app: express.Application) => {
  app.get('/users', verifyAuthToken, index);
  app.get('/users/:id', verifyAuthToken, show);
  app.post('/users', create);
};

export default userRoutes;
