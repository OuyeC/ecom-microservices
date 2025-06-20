const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid"); // loads the UUID library v4

const app = express();
app.use(bodyParser.json());

// In-memory products store
let products = [
  { id: "1", name: "Widget", price: 9.99 },
  { id: "2", name: "Gadget", price: 14.99 },
];

// Health check
app.get("/health", (_req, res) => {
  res.send({ status: "ok" });
});

// List all products
app.get("/products", (_req, res) => {
  res.send({ products });
});

// Get a single product by ID
app.get("/products/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).send({ error: "Product not found" });
  }
  res.send({ product });
});

// Add a new product
app.post("/products", (req, res) => {
  const { name, price } = req.body;
  if (!name || price == null) {
    return res.status(400).send({ error: "Name and price are required" });
  }
  const newProduct = { id: uuidv4(), name, price };
  products.push(newProduct);
  res.status(201).send({ product: newProduct });
});

// Delete a product
app.delete("/products/:id", (req, res) => {
  const before = products.length;
  products = products.filter(p => p.id !== req.params.id);
  if (products.length === before) {
    return res.status(404).send({ error: "Product not found" });
  }
  res.send({ deleted: req.params.id });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Catalog service listening on port ${PORT}`));
