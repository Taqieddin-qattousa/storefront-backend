import client from "../database";

export type Product = {
    id?: number;
    name: string;
    price: number; //stored in cents to avoid floating point issues
    category?: string;
    };

export class ProductStore {
    // Method to get all products (Index)
    async index(): Promise<Product[]> {
        try {
            const conn = await client.connect();
            const sql = "SELECT * FROM products";
            const result = await conn.query(sql);
            conn.release();
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get products. Error: ${err}`);
        }
    }

// Method to get a single product (show)
async show(id: number): Promise<Product> {
    try {
        const sql="SELECT * FROM products WHERE id=($1)";
        const conn = await client.connect();
        const result = await conn.query(sql, [id]);
        conn.release();
        return result.rows[0];
    } catch (err) {
        throw new Error(`Could not find product ${id}. Error: ${err}`);
    }
}

// Method to create a new product (create)
async create(p: Product): Promise<Product> {
    try {
        const conn = await client.connect();
        const sql =
            "INSERT INTO products (name, price, category) VALUES($1, $2, $3) RETURNING *";
        const result = await conn.query(sql, [p.name, p.price, p.category]);
        conn.release();
        return result.rows[0];
    } catch (err) {
        throw new Error(`Could not create product. Error: ${err}`);
    }
}

// method to delete a product (delete)
async delete(id: number): Promise<Product> {
    try {
        const sql = "DELETE FROM products WHERE id=($1) RETURNING *";
        const conn = await client.connect();
        const result = await conn.query(sql, [id]);
        conn.release();
        return result.rows[0];
    } catch (err) {
        throw new Error(`Could not delete product ${id}. Error: ${err}`);
    }
}
}
