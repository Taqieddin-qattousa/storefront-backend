-- First, create a new ENUM type for the order status
CREATE TYPE order_status AS ENUM ('active', 'complete');

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id bigint REFERENCES users(id) NOT NULL,
    status order_status NOT NULL
);