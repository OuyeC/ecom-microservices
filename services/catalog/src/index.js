const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require("uuid"); // loads the UUID library v4

const app = express();
app.use(bodyParser.json());

// connect through the same RDS 
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

// List all products
app.get("/products", async(_req, res) => {
  const [rows] = await pool.query('SELECT * FROM products');
  res.send({ products: rows });
});

// Get a single product by ID
app.get("/products/:id", async(req, res) => {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).send({ error: 'not_found' });
  res.send({ product: rows[0] });
});

// Add a new product
app.post("/products", async(req, res) => {
const { name, description = '', price } = req.body;
  if (!name || price == null) {
    return res.status(400).send({ error: 'name and price required' });
  }
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO products (id, name, description, price) VALUES (?, ?, ?, ?)', 
    [id, name, description, price]
  );
  res.status(201).send({ product: { id, name, description, price } });
});

// Delete a product
app.delete("/products/:id", async(req, res) => {
  const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).send({ error: 'not_found' });
  res.send({ deleted: req.params.id });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Catalog service listening on port ${PORT}`));
