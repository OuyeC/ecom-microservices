const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

// In-memory payment records: { paymentId: { id, orderId, amount, status, createdAt } }
const payments = {};

// Health check
app.get("/health", (_req, res) => {
  res.send({ status: "ok" });
});

// Initiate a payment for an order
app.post("/payments", (req, res) => {
  const { orderId, amount } = req.body;
  if (!orderId || typeof amount !== "number") {
    return res.status(400).send({ error: "orderId (string) and amount (number) required" });
  }

  const id = uuidv4();
  const newPayment = {
    id,
    orderId,
    amount,
    status: "PENDING",                     // initial status
    createdAt: new Date().toISOString()
  };

  payments[id] = newPayment;

  // TODO: integrate with a real payment gateway (Stripe, etc.)
  console.log("Payment initiated:", newPayment);

  res.status(201).send({ payment: newPayment });
});

// Get payment status by payment ID
app.get("/payments/:paymentId", (req, res) => {
  const payment = payments[req.params.paymentId];
  if (!payment) {
    return res.status(404).send({ error: "Payment not found" });
  }
  res.send({ payment });
});

// (Optional) Update payment status (e.g. from PENDING → COMPLETED)
app.patch("/payments/:paymentId/status", (req, res) => {
  const { status } = req.body;
  const payment = payments[req.params.paymentId];
  if (!payment) {
    return res.status(404).send({ error: "Payment not found" });
  }
  payment.status = status || payment.status;
  res.send({ payment });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Payment service listening on port ${PORT}`));
