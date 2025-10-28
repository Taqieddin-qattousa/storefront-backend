# API Requirements

## Meeting Notes from Frontend Developer

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application.

---

## API Endpoints

### Products

#### Index
- **HTTP Verb**: `GET`
- **Route**: `/products`
- **Description**: Returns a list of all products
- **Authentication**: Not required
- **Query Parameters**: 
  - `category` (optional) - Filter products by category
  - Example: `/products?category=Books`
- **Response**: Array of product objects

#### Show
- **HTTP Verb**: `GET`
- **Route**: `/products/:id`
- **Description**: Returns a single product by ID
- **Authentication**: Not required
- **URL Parameters**: `id` - Product ID (integer)
- **Response**: Product object
- **Error Responses**: 404 if product not found

#### Create
- **HTTP Verb**: `POST`
- **Route**: `/products`
- **Description**: Creates a new product
- **Authentication**: **Bearer Token Required**
- **Request Body**:
  ```json
  {
    "name": "Product Name",
    "price": 1999,
    "category": "Category Name"
  }
  ```
- **Response**: Created product object

#### Update
- **HTTP Verb**: `PUT`
- **Route**: `/products/:id`
- **Description**: Updates an existing product
- **Authentication**: **Bearer Token Required**
- **URL Parameters**: `id` - Product ID (integer)
- **Request Body**: Partial product object (any combination of name, price, category)
- **Response**: Updated product object
- **Error Responses**: 404 if product not found, 401 if token missing/invalid

#### Delete
- **HTTP Verb**: `DELETE`
- **Route**: `/products/:id`
- **Description**: Deletes a product
- **Authentication**: **Bearer Token Required**
- **URL Parameters**: `id` - Product ID (integer)
- **Response**: Deleted product object
- **Error Responses**: 401 if token missing/invalid

#### [OPTIONAL] Top 5 Most Popular Products
- **HTTP Verb**: `GET`
- **Route**: `/products/popular`
- **Description**: Returns the 5 most commonly ordered products
- **Authentication**: Not required
- **Response**: Array of product objects with order quantity

#### [OPTIONAL] Products by Category
- **HTTP Verb**: `GET`
- **Route**: `/products?category=<category>`
- **Description**: Returns products filtered by category
- **Authentication**: Not required
- **Query Parameters**: `category` - Category name (string)
- **Response**: Array of product objects

---

### Users

#### Index
- **HTTP Verb**: `GET`
- **Route**: `/users`
- **Description**: Returns a list of all users (passwords excluded)
- **Authentication**: **Bearer Token Required**
- **Response**: Array of user objects

#### Show
- **HTTP Verb**: `GET`
- **Route**: `/users/:id`
- **Description**: Returns a single user by ID (password excluded) with recent purchases
- **Authentication**: **Bearer Token Required**
- **URL Parameters**: `id` - User ID (integer)
- **Response**: User object with `recentPurchases` array
- **Error Responses**: 404 if user not found, 401 if token missing/invalid

#### Create
- **HTTP Verb**: `POST`
- **Route**: `/users`
- **Description**: Creates a new user and returns a JWT token
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "password": "secure-password"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Delete
- **HTTP Verb**: `DELETE`
- **Route**: `/users/:id`
- **Description**: Deletes a user
- **Authentication**: **Bearer Token Required**
- **URL Parameters**: `id` - User ID (integer)
- **Response**: Deleted user object
- **Error Responses**: 401 if token missing/invalid

---

### Orders

#### Current Order by User
- **HTTP Verb**: `GET`
- **Route**: `/orders/current/:userId`
- **Description**: Returns the active order for a specific user
- **Authentication**: **Bearer Token Required**
- **URL Parameters**: `userId` - User ID (integer)
- **Response**: Order object or null if no active order
- **Error Responses**: 401 if token missing/invalid

#### [OPTIONAL] Completed Orders by User
- **HTTP Verb**: `GET`
- **Route**: `/orders/completed/:userId`
- **Description**: Returns all completed orders for a specific user
- **Authentication**: **Bearer Token Required**
- **URL Parameters**: `userId` - User ID (integer)
- **Response**: Array of order objects
- **Error Responses**: 401 if token missing/invalid

#### Create Order
- **HTTP Verb**: `POST`
- **Route**: `/orders`
- **Description**: Creates a new active order for a user
- **Authentication**: **Bearer Token Required**
- **Request Body**:
  ```json
  {
    "userId": "1"
  }
  ```
- **Response**: Created order object
- **Error Responses**: 401 if token missing/invalid

#### Add Product to Order
- **HTTP Verb**: `POST`
- **Route**: `/orders/:id/products`
- **Description**: Adds a product to an existing order
- **Authentication**: **Bearer Token Required**
- **URL Parameters**: `id` - Order ID (integer)
- **Request Body**:
  ```json
  {
    "productId": "5",
    "quantity": 3
  }
  ```
- **Response**: OrderProduct object
- **Error Responses**: 401 if token missing/invalid

---

## Data Shapes

### Product

**API Response Shape**:
```typescript
{
  id: number;          // Auto-generated primary key
  name: string;        // Product name
  price: number;       // Price in cents
  category?: string;   // Product category (optional)
}
```

**Example**:
```json
{
  "id": 1,
  "name": "Wireless Mouse",
  "price": 2999,
  "category": "Electronics"
}
```

---

### User

**API Response Shape**:
```typescript
{
  id: number;             // Auto-generated primary key
  firstName: string;      // User's first name
  lastName: string;       // User's last name
  recentPurchases?: [];   // Array of recent purchases (only in show endpoint)
}
```

**Example** (from GET /users/:id):
```json
{
  "id": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "recentPurchases": []
}
```

**Note**: Passwords are hashed using bcrypt with a pepper before storage and never returned in API responses.

---

### Order

**API Response Shape**:
```typescript
{
  id: number;          // Auto-generated primary key
  user_id: string;     // Foreign key to users table
  status: string;      // 'active' or 'complete'
}
```

**Example**:
```json
{
  "id": 1,
  "user_id": "1",
  "status": "active"
}
```

---

### OrderProduct (Order Items)

**API Response Shape**:
```typescript
{
  id: number;          // Auto-generated primary key
  quantity: number;    // Number of items
  order_id: string;    // Foreign key to orders table
  product_id: string;  // Foreign key to products table
}
```

**Example**:
```json
{
  "id": 1,
  "quantity": 2,
  "order_id": "1",
  "product_id": "5"
}
```

---

## Database Schema

### Table: `users`

| Column     | Type         | Constraints           |
|------------|--------------|-----------------------|
| id         | SERIAL       | PRIMARY KEY           |
| firstName  | VARCHAR(100) | NOT NULL              |
| lastName   | VARCHAR(100) | NOT NULL              |
| password   | VARCHAR(255) | NOT NULL (bcrypt hash)|

**DDL**:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

---

### Table: `products`

| Column   | Type         | Constraints    |
|----------|--------------|----------------|
| id       | SERIAL       | PRIMARY KEY    |
| name     | VARCHAR(255) | NOT NULL       |
| price    | INTEGER      | NOT NULL       |
| category | VARCHAR(100) | NULL           |

**DDL**:
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    category VARCHAR(100)
);
```

---

### Enum Type: `order_status`

```sql
CREATE TYPE order_status AS ENUM ('active', 'complete');
```

---

### Table: `orders`

| Column   | Type         | Constraints                      |
|----------|--------------|----------------------------------|
| id       | SERIAL       | PRIMARY KEY                      |
| user_id  | BIGINT       | NOT NULL, REFERENCES users(id)   |
| status   | order_status | NOT NULL                         |

**DDL**:
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    status order_status NOT NULL
);
```

---

### Table: `order_products`

| Column     | Type   | Constraints                         |
|------------|--------|-------------------------------------|
| id         | SERIAL | PRIMARY KEY                         |
| quantity   | INTEGER| NOT NULL                            |
| order_id   | BIGINT | NOT NULL, REFERENCES orders(id)     |
| product_id | BIGINT | NOT NULL, REFERENCES products(id)   |

**DDL**:
```sql
CREATE TABLE order_products (
    id SERIAL PRIMARY KEY,
    quantity INTEGER NOT NULL,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    product_id BIGINT NOT NULL REFERENCES products(id)
);
```

---

## Database Relationships

- **users → orders**: One-to-Many (a user can have multiple orders)
- **orders → order_products**: One-to-Many (an order can contain multiple products)
- **products → order_products**: One-to-Many (a product can appear in multiple orders)
- **orders + products → order_products**: Many-to-Many (through junction table)

---

## SQL Query Examples (Required by Rubric)

### SELECT: Get all products
```sql
SELECT * FROM products;
```

### SELECT with WHERE: Get product by ID
```sql
SELECT * FROM products WHERE id = 5;
```

### INSERT: Create a new user
```sql
INSERT INTO users ("firstName", "lastName", password) 
VALUES ('Jane', 'Smith', '$2b$10$hashed_password_here') 
RETURNING id, "firstName", "lastName";
```

### UPDATE: Change product price
```sql
UPDATE products 
SET price = COALESCE($1, price), 
    name = COALESCE($2, name),
    category = COALESCE($3, category)
WHERE id = $4 
RETURNING *;
```

### DELETE: Remove a product
```sql
DELETE FROM products 
WHERE id = 7 
RETURNING *;
```

### JOIN: Get top 5 popular products
```sql
SELECT p.id, p.name, p.price, p.category, SUM(op.quantity) as total_quantity
FROM products p
INNER JOIN order_products op ON p.id = op.product_id
GROUP BY p.id
ORDER BY total_quantity DESC
LIMIT 5;
```

### JOIN: Get user's recent purchases
```sql
SELECT op.id, op.quantity, op.order_id, op.product_id, 
       p.name, p.price, p.category, o.status
FROM order_products op
INNER JOIN orders o ON op.order_id = o.id
INNER JOIN products p ON op.product_id = p.id
WHERE o.user_id = $1 AND o.status = 'complete'
ORDER BY o.id DESC
LIMIT 5;
```

---

## Authentication

Protected endpoints require a **Bearer Token** in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### How to Authenticate:

1. **Create a user** via `POST /users` with firstName, lastName, and password
2. **Receive a JWT token** in the response
3. **Include the token** in the Authorization header for protected routes

**Example**:
```bash
# Create user and get token
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","password":"secret123"}'

# Response: {"token":"eyJhbGci..."}

# Use token for protected endpoint
curl http://localhost:3000/users \
  -H "Authorization: Bearer eyJhbGci..."
```

---

## Notes

- All prices are stored as **integers** (cents) to avoid floating-point precision issues
- Passwords are hashed with **bcrypt** and a **pepper** (additional secret key) before storage
- **Cascading deletes**: Deleting a user removes their orders; deleting an order removes its order_products
- **order_status** is an enum type with only two valid values: `'active'` or `'complete'`
- Protected endpoints return **401 Unauthorized** if token is missing or invalid
- Show endpoints return **404 Not Found** if resource doesn't exist
- All migrations have matching up/down files for proper rollback support

