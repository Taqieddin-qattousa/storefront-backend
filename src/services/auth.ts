// Auth middleware for verifying Bearer JWT tokens.
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { TOKEN_SECRET } = process.env;

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json('Access denied. Token is missing.');
    }

    jwt.verify(token, TOKEN_SECRET as string);
    next();
  } catch {
    res.status(401).json('Access denied. Invalid token.');
  }
};

export default verifyAuthToken;
