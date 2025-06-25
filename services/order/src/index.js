const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const mysql      = require('mysql2/promise'); 


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

// Fetch all orders for a user
app.get("/orders/:userId", async(req, res) => {
  const userId = req.params.userId;
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ?', [userId]
  );
  res.send({ orders: rows });
});

// Create a new order
app.post("/orders", async(req, res) => {
   const { userId, items } = req.body;
  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send({ error: 'userId and non-empty items array required' });
  }

  const id = uuidv4();                            // Generate order UUID
  const status = 'PENDING';
  const createdAt = new Date().toISOString().slice(0,19).replace('T',' ');

  await pool.execute(
    'INSERT INTO orders (id, user_id, items, status, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, userId, JSON.stringify(items), status, createdAt]
  );

  res.status(201).send({
    order: { id, userId, items, status, createdAt }
  });
});

// Update order status (e.g. from PENDING → PAID → SHIPPED)
app.patch("/orders/:orderId/status", async(req, res) => {
const { orderId } = req.params;
  const { status }  = req.body;
  if (!status) return res.status(400).send({ error: 'status required' });

  const [result] = await pool.execute(
    'UPDATE orders SET status = ? WHERE id = ?', [status, orderId]
  );
  if (result.affectedRows === 0) {
    return res.status(404).send({ error: 'order_not_found' });
  }

  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE id = ?', [orderId]
  );
  res.send({ order: rows[0] });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Order service listening on port ${PORT}`));
