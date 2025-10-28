// Database connection pool: switches between dev and test by NODE_ENV.
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB_TEST,
  POSTGRES_USER_TEST,
  POSTGRES_PASSWORD_TEST,
  NODE_ENV,
} = process.env;

let client: Pool;

if (NODE_ENV === 'test') {
  client = new Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_DB_TEST,
    user: POSTGRES_USER_TEST || POSTGRES_USER,
    password: POSTGRES_PASSWORD_TEST || POSTGRES_PASSWORD,
  });
} else {
  client = new Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
  });
}

export default client;
