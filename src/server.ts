// Express app setup and route wiring.
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import productRoutes from './handlers/products';
import userRoutes from './handlers/users';
import orderRoutes from './handlers/orders';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Store API!');
});

productRoutes(app);
userRoutes(app);
orderRoutes(app);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

export default app;
