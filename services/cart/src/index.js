const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql2/promise');


const app = express();
app.use(bodyParser.json());

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'ecom',
  waitForConnections: true,
  connectionLimit:    10,
});

// Health check
app.get("/health", async(_req, res) => {
    try {
    await pool.query('SELECT 1');
    res.send({ status: 'ok' });
  } catch {
    res.status(500).send({ status: 'db-error' });
  }
});

// Get a user's cart
app.get("/cart/:userId", async(req, res) => {
 const userId = req.params.userId;
  const [rows] = await pool.query(
    'SELECT product_id, quantity FROM cart_items WHERE user_id = ?',
    [userId]
  );
  res.send({ items: rows });
});

// Add/update cart
app.post("/cart/:userId/items", async(req, res) => {
const userId = req.params.userId;
  const { product_id, quantity = 1 } = req.body;
  // upsert: if exists, update quantity; else insert
  await pool.execute(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [userId, product_id, quantity]
  );
  const [items] = await pool.query(
    'SELECT product_id, quantity FROM cart_items WHERE user_id = ?',
    [userId]
  );
  res.status(201).send({ items });
});

// Remove item
app.delete("/cart/:userId/items/:itemId", async(req, res) => {
  const { userId, productId } = req.params;
  await pool.execute(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
  const [items] = await pool.query(
    'SELECT product_id, quantity FROM cart_items WHERE user_id = ?',
    [userId]
  );
  res.send({ items });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Cart service listening on port ${PORT}`));
