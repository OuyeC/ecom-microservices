const express = require("express");
const bodyParser = require("body-parser");
const mysql      = require('mysql2/promise');   
const { v4: uuidv4 } = require('uuid');          // UUID generator

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

// get all notifications for a user
app.get("/notifications/:userId", async(_req, res) => {
  const userId = req.params.userId;
  const [rows] = await pool.query(
    'SELECT id, message, status, created_at, sent_at FROM notifications WHERE user_id = ?',
    [userId]
  );
  res.send({ notifications: rows });
});

// Send a notification
app.post("/notifications", async(req, res) => {
    const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).send({ error: 'userId and message required' });
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString().slice(0,19).replace('T',' ');
  try {
    await pool.execute(
      'INSERT INTO notifications (id, user_id, message, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, userId, message, 'QUEUED', createdAt]
    );
    res.status(201).send({
      notification: { id, userId, message, status: 'QUEUED', createdAt, sentAt: null }
    });
  } catch (err) {
    console.error('Notification enqueue error:', err);
    res.status(500).send({ error: 'enqueue_failed' });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Notification service on port ${PORT}`));
