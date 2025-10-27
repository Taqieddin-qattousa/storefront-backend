import client from '../database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Get the BCRYPT_PASSWORD (pepper) and SALT_ROUNDS from .env
const { BCRYPT_PASSWORD, SALT_ROUNDS } = process.env;

if (!BCRYPT_PASSWORD || !SALT_ROUNDS) {
  throw new Error(
    'Environment variables BCRYPT_PASSWORD and SALT_ROUNDS must be set.'
  );
}

// We exclude the password when returning user data
export type User = {
    id?: number;
    firstname: string;
    lastname: string;
    password?: string; // password is optional when we return a user
    };

export class UserStore {
    // Method to get all users (Index)
    async index(): Promise<User[]> {
        try {
            const conn = await client.connect();
            const sql = "SELECT id, firstname, lastname FROM users";
            const result = await conn.query(sql);
            conn.release();
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get users. Error: ${err}`);
        }
    }

// Method to get a single user (show)
async show(id: number): Promise<User> {
    try {
        const sql="SELECT id, firstname, lastname FROM users WHERE id=($1)";
        const conn = await client.connect();
        const result = await conn.query(sql, [id]);
        conn.release();
        return result.rows[0];
    } catch (err) {
        throw new Error(`Could not find user ${id}. Error: ${err}`);
    }
}

// Method to create a new user (create)
async create(u: User): Promise<User> {
try {
    if (!u.password) {
    throw new Error('User password is required.');
    }
        const conn = await client.connect();
        const sql =
            "INSERT INTO users (firstname, lastname, password) VALUES($1, $2, $3) RETURNING id, firstname, lastname";

        // Hash the password + pepper
        const hash = bcrypt.hashSync(
            u.password + BCRYPT_PASSWORD,
            parseInt(SALT_ROUNDS as string)
        );
        const result = await conn.query(sql, [u.firstname, u.lastname, hash]);
        conn.release();
        return result.rows[0];
} catch (err) {
        throw new Error(`Could not create user. Error: ${err}`);
    }
}

// method to delete a user (delete)
async delete(id: number): Promise<User> {
    try {
        const conn = await client.connect();
        const sql = "DELETE FROM users WHERE id=($1) RETURNING id, firstname, lastname";
        const result = await conn.query(sql, [id]);
        conn.release();
        return result.rows[0];
    } catch (err) {
        throw new Error(`Could not delete user ${id}. Error: ${err}`);
    }
}
}
