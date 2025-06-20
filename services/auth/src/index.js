// import Express framwork that handles requerst routing, middleware etc
const express = require("express");
// import Body-Parser middleware, parses incoming request into req.body
const bodyParser = require("body-parser");

// creates an Express app instance
const app = express();

app.use(bodyParser.json()); // register Body-parser JSON

// Health check
app.get("/health", (_req, res) => {
  res.send({ status: "ok" });
});

// Stub register/login
app.post("/register", (req, res) => {
  const { username, password } = req.body;  // pull the filed out of the JSON file
  // TODO: hook into a real user DB
  res.status(201).send({ userId: "generated-id", username });   // returns HTTP 201 created
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // TODO: validate credentials & issue JWT
  res.send({ token: "fake-jwt-token", user: { username } });    //  Responds with HTTP 200 OK 
});

// eads the PORT environment variable, or defaults to 3000 if none is set
const PORT = process.env.PORT || 3000;
// starts HTTP server
app.listen(PORT, () => console.log(`Auth service on port ${PORT}`));
