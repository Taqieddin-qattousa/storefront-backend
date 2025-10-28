# Storefront Backend API

A RESTful API for an online storefront built with Node.js, Express, TypeScript, and PostgreSQL. Features JWT authentication, bcrypt password hashing, and comprehensive test coverage.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 13+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt with pepper
- **Migrations**: db-migrate
- **Testing**: Jasmine + Supertest
- **Container**: Docker Compose

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (recommended)
- PostgreSQL 13+ (if not using Docker)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server
PORT=3000

# Database - Development
POSTGRES_HOST=127.0.0.1
POSTGRES_DB=store_dev
POSTGRES_USER=store_user
POSTGRES_PASSWORD=store_password

# Database - Test
POSTGRES_DB_TEST=store_test
POSTGRES_USER_TEST=store_user_test
POSTGRES_PASSWORD_TEST=store_password_test

# Authentication
TOKEN_SECRET=your-super-secret-jwt-token-change-this-in-production
BCRYPT_PASSWORD=your-pepper-string-for-extra-security
SALT_ROUNDS=10
```

**Note**: The `.env` file is gitignored for security. For project reviewers, the environment variables are documented here.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Taqieddin-qattousa/storefront-backend.git
cd storefront-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker compose up -d

# The database will be available on port 5432
```

#### Option B: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Connect as postgres user
psql -U postgres

# Create databases and users
CREATE DATABASE store_dev;
CREATE DATABASE store_test;
CREATE USER store_user WITH PASSWORD 'store_password';
CREATE USER store_user_test WITH PASSWORD 'store_password_test';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE store_dev TO store_user;
GRANT ALL PRIVILEGES ON DATABASE store_test TO store_user_test;

# Exit psql
\q
```

### 4. Run Migrations

```bash
# Development database
npm run db:up

# Test database (optional, runs automatically before tests)
cross-env NODE_ENV=test npm run db:up -- --env test
```

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Production Mode

```bash
# Build TypeScript to JavaScript
npm run build

# Start the server
npm start
```

## Testing

```bash
# Run all tests (migrates test DB automatically)
npm test

# Run linter
npm run lint

# Format code
npm run format
```

## API Endpoints

See [REQUIREMENTS.md](REQUIREMENTS.md) for detailed endpoint documentation with HTTP verbs and request/response formats.

### Products

- `GET /products` - List all products (public)
- `GET /products/:id` - Get product by ID (public)
- `GET /products?category=Books` - Filter products by category (public)
- `GET /products/popular` - Get top 5 most ordered products (public)
- `POST /products` - Create product **[Token Required]**
- `PUT /products/:id` - Update product **[Token Required]**
- `DELETE /products/:id` - Delete product **[Token Required]**

### Users

- `POST /users` - Create user and get JWT token (public)
- `GET /users` - List all users **[Token Required]**
- `GET /users/:id` - Get user by ID with recent purchases **[Token Required]**
- `DELETE /users/:id` - Delete user **[Token Required]**

### Orders

- `POST /orders` - Create new order **[Token Required]**
- `POST /orders/:id/products` - Add product to order **[Token Required]**
- `GET /orders/current/:userId` - Get active order for user **[Token Required]**
- `GET /orders/completed/:userId` - Get completed orders for user **[Token Required]**

**Authentication**: Protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get a token by creating a user via `POST /users`.

## Database Schema

See [REQUIREMENTS.md](REQUIREMENTS.md) for detailed schema with column types and relationships.

**Tables:**
- `users` - User accounts with hashed passwords
- `products` - Product catalog
- `orders` - User orders with status tracking
- `order_products` - Junction table for order items

## Project Structure

```
.
├── migrations/              # Database migrations
│   ├── sqls/               # SQL files for up/down migrations
│   └── *.js                # Migration runner files
├── spec/                   # Tests
│   ├── handlers/           # Endpoint tests
│   ├── models/             # Model unit tests
│   └── support/            # Jasmine configuration
├── src/
│   ├── handlers/           # Route handlers (controllers)
│   ├── models/             # Database models
│   ├── services/           # Auth middleware
│   ├── database.ts         # PostgreSQL connection pool
│   └── server.ts           # Express app & server
├── .env                    # Environment variables (gitignored)
├── database.json           # db-migrate configuration
├── docker-compose.yml      # PostgreSQL container setup
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

```bash
npm start          # Build and start production server
npm run dev        # Start with nodemon (hot reload)
npm run build      # Compile TypeScript to dist/
npm test           # Run test suite with Jasmine
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
npm run db:create  # Create a new migration file
npm run db:up      # Run pending migrations
npm run db:down    # Rollback last migration
```

## Ports

- **API Server**: `3000` (configurable via `PORT` in `.env`)
- **PostgreSQL**: `5432` (Docker default)

## Security Features

- JWT-based authentication
- Bcrypt password hashing with configurable salt rounds
- Pepper (additional secret) added to passwords before hashing
- Environment variables for sensitive data
- Password fields excluded from API responses
- Token validation middleware for protected routes

## Database Migrations

Migrations are managed with `db-migrate`. Each migration has an `up` (apply) and `down` (rollback) file.

```bash
# Create a new migration
npm run db:create my-migration-name

# Apply all pending migrations
npm run db:up

# Rollback the last migration
npm run db:down

# Rollback multiple migrations
npm run db:down -- -c 3
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `docker ps` or `pg_isready`
- Check `.env` credentials match your database setup
- Ensure databases exist: `psql -U postgres -l`

### Test Failures

- Ensure test database exists and migrations have run
- Check `NODE_ENV=test` is set during test execution
- Verify test database credentials in `.env`

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>
```

## Stand-Out Features Implemented

- Complete CRUD operations for all resources
- Category filtering for products
- Top 5 most popular products endpoint
- User's 5 most recent purchases included in user show endpoint
- Comprehensive test coverage (57 passing tests)

## License

ISC
