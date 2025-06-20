const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// In-memory store: { userId: [ { itemId, quantity, ... }, ... ] }
const carts = {};

// Health check
app.get("/health", (_req, res) => {
  res.send({ status: "ok" });
});

// Get a user's cart
app.get("/cart/:userId", (req, res) => {
  const { userId } = req.params;
  res.send({ items: carts[userId] || [] });
});

// Add an item to a user's cart
app.post("/cart/:userId/items", (req, res) => {
  const { userId } = req.params;
  const { itemId, quantity = 1 } = req.body;
  if (!carts[userId]) carts[userId] = [];
  carts[userId].push({ itemId, quantity });
  res.status(201).send({ items: carts[userId] });
});

// Remove an item from a user's cart
app.delete("/cart/:userId/items/:itemId", (req, res) => {
  const { userId, itemId } = req.params;
  if (!carts[userId]) return res.status(404).send({ error: "Cart not found" });
  carts[userId] = carts[userId].filter(i => i.itemId !== itemId);
  res.send({ items: carts[userId] });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Cart service listening on port ${PORT}`));
