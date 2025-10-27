import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { TOKEN_SECRET } = process.env;

// This is our middleware function
const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;
    // Check for "Bearer <token>" format
    const token = authorizationHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json('Access denied. Token is missing.');
    }

    // Verify the token
    // This will throw an error if the token is invalid or expired
    jwt.verify(token, TOKEN_SECRET as string);

    // Token is valid, proceed to the next handler
    next();
    // The 'error' variable is intentionally unused in this block,
    // but ESLint requires explicit handling.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    res.status(401).json('Access denied. Invalid token.');
  }
};

export default verifyAuthToken;
