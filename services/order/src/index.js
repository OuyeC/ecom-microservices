const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

// In-memory store of orders: { orderId: { id, userId, items, status, createdAt } }
const orders = {};

// Health check
app.get("/health", (_req, res) => {
  res.send({ status: "ok" });
});

// Fetch all orders for a user
app.get("/orders/:userId", (req, res) => {
  const { userId } = req.params;
  const userOrders = Object.values(orders).filter(o => o.userId === userId);
  res.send({ orders: userOrders });
});

// Create a new order
app.post("/orders", (req, res) => {
  const { userId, items } = req.body;
  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send({ error: "userId and non-empty items array required" });
  }

  const id = uuidv4();
  const newOrder = {
    id,
    userId,
    items,                // e.g. [ { itemId, quantity }, … ]
    status: "PENDING",    // initial status
    createdAt: new Date().toISOString()
  };

  orders[id] = newOrder;
  // TODO: integrate with payment, cart-cleanup, notification
  res.status(201).send({ order: newOrder });
});

// Update order status (e.g. from PENDING → PAID → SHIPPED)
app.patch("/orders/:orderId/status", (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const order = orders[orderId];
  if (!order) {
    return res.status(404).send({ error: "Order not found" });
  }
  order.status = status || order.status;
  res.send({ order });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Order service listening on port ${PORT}`));
