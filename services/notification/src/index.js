const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// In-memory queue of notifications
const notifications = [];

// Health check
app.get("/health", (_req, res) => {
  res.send({ status: "ok" });
});

// Fetch all notifications
app.get("/notifications", (_req, res) => {
  res.send({ notifications });
});

// Send a notification
app.post("/notifications", (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).send({ error: "userId and message required" });
  }

  // builds a note object
  const note = { id: Date.now().toString(), userId, message, sentAt: new Date().toISOString() };
  notifications.push(note);

  // TODO: hook into real email/SMS/push here
  console.log("Notification queued:", note);

  res.status(201).send({ notification: note });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Notification service on port ${PORT}`));
