import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB_TEST, // Test database
  NODE_ENV, // To check if we are in 'dev' or 'test'
} = process.env;

let client: Pool;

console.log(`Current environment: ${NODE_ENV}`);

// use the NODE_ENV to switch between the dev and test databases
if (NODE_ENV === 'test') {
  console.log('Connecting to test database');
  client = new Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_DB_TEST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
  });
} else {
  console.log('Connecting to dev database ...');
  client = new Pool({
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
  });
}
export default client;
