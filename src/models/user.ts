// User model: queries and password hashing.
import client from '../database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { BCRYPT_PASSWORD, SALT_ROUNDS } = process.env;

if (!BCRYPT_PASSWORD || !SALT_ROUNDS) {
  throw new Error(
    'Environment variables BCRYPT_PASSWORD and SALT_ROUNDS must be set.'
  );
}
export type User = {
  id?: number;
  firstName: string;
  lastName: string;
  password?: string;
};

export class UserStore {
  async index(): Promise<User[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT id, "firstName", "lastName" FROM users';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get users. Error: ${err}`);
    }
  }

  async show(id: string): Promise<User> {
    try {
      const sql = 'SELECT id, "firstName", "lastName" FROM users WHERE id=($1)';
      const conn = await client.connect();
      const result = await conn.query(sql, [parseInt(id)]);
      conn.release();
      if (!result.rows[0]) {
        throw new Error(`User with ID ${id} not found.`);
      }
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not find user ${id}. Error: ${err}`);
    }
  }

  async create(u: User): Promise<User> {
    try {
      if (!u.password) {
        throw new Error('User password is required.');
      }

      const conn = await client.connect();
      const sql =
        'INSERT INTO users ("firstName", "lastName", password) VALUES($1, $2, $3) RETURNING id, "firstName", "lastName"';

      const hash = bcrypt.hashSync(
        u.password + BCRYPT_PASSWORD,
        parseInt(SALT_ROUNDS as string)
      );

      const result = await conn.query(sql, [u.firstName, u.lastName, hash]);
      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not create new user ${u.firstName}. Error: ${err}`
      );
    }
  }

  async delete(id: string): Promise<User> {
    try {
      const conn = await client.connect();
      const sql =
        'DELETE FROM users WHERE id=($1) RETURNING id, "firstName", "lastName"';
      const result = await conn.query(sql, [parseInt(id)]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not delete user ${id}. Error: ${err}`);
    }
  }
}
