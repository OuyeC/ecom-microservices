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

// Initiate a payment for an order
app.post("/payments", async(req, res) => {
  const { orderId, amount } = req.body;
  if (!orderId || typeof amount !== 'number') {
    return res.status(400).send({ error: 'orderId (string) and amount (number) required' });
  }

  const id = uuidv4();
  const status = 'PENDING';
  const createdAt = new Date().toISOString().slice(0,19).replace('T',' ');

  try {
    await pool.execute(
      'INSERT INTO payments (id, order_id, amount, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, orderId, amount, status, createdAt]
    );
    res.status(201).send({ payment: { id, orderId, amount, status, createdAt } });
  } catch (err) {
    console.error('Payment creation error:', err);
    res.status(500).send({ error: 'payment_failed' });
  }
});

// Get payment status by payment ID
app.get("/payments/:paymentId", async(req, res) => {
  const { paymentId } = req.params;
  const [rows] = await pool.query(
    'SELECT * FROM payments WHERE id = ?', [paymentId]
  );
  if (!rows.length) return res.status(404).send({ error: 'not_found' });
  res.send({ payment: rows[0] });
});

// Update payment status (e.g. from PENDING to COMPLETED)
app.patch("/payments/:paymentId/status", async(req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).send({ error: 'status required' });

  const [result] = await pool.execute(
    'UPDATE payments SET status = ? WHERE id = ?', [status, paymentId]
  );
  if (result.affectedRows === 0) return res.status(404).send({ error: 'not_found' });

  const [rows] = await pool.query(
    'SELECT * FROM payments WHERE id = ?', [paymentId]
  );
  res.send({ payment: rows[0] });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Payment service listening on port ${PORT}`));
