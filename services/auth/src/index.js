// import Express framwork that handles requerst routing, middleware etc
const express = require("express");
// import Body-Parser middleware, parses incoming request into req.body
const bodyParser = require("body-parser");

const mysql = require('mysql2/promise');
// to hash password 
const bcrypt = require('bcrypt');
// jsonwebtoken, for create and verify JWT for stateless authentication
const jwt = require('jsonwebtoken');

// creates an Express app instance
const app = express();

app.use(bodyParser.json()); // register Body-parser JSON

// Create a MySQL connection pool
const pool = mysql.createPool({                          
  host:               process.env.DB_HOST,               
  port:               process.env.DB_PORT,               
  user:               process.env.DB_USER,              
  password:           process.env.DB_PASS,             
  database:           process.env.DB_NAME || 'ecom',    
  waitForConnections: true,                             
  connectionLimit:    10,                                
});

// Health check
app.get("/health", async(_req, res) => {
  try {
      await pool.query('SELECT 1');                        // Test DB connectivity
      res.send({ status: 'ok' });                          
    } catch {
      res.status(500).send({ status: 'db-error' });      
    }
});

// Stub register/login
app.post("/register", async(req, res) => {
  const { username, password } = req.body;  // pull the filed out of the JSON file
  if (!username || !password)                    
    return res.status(400).send({ error: 'username and password required' });

 try {
    const hash = await bcrypt.hash(password, 10);        // Hash the password
    const [result] = await pool.execute(                 // Insert new user into DB
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hash]
    );
    res.status(201).send({ userId: result.insertId, username }); // Return created user ID
  } catch {
    res.status(500).send({ error: 'registration_failed' });      // Handle insertion errors
  }
});

app.post("/login", async(req, res) => {
  const { username, password } = req.body;
  if (!username || !password)               
    return res.status(400).send({ error: 'username and password required' });

  try {
    const [rows] = await pool.execute(                  // Query user by username
      'SELECT id, password_hash FROM users WHERE username = ?',
      [username]
    );
    if (!rows.length)                                   // No such user
      return res.status(401).send({ error: 'invalid_credentials' });

    const user = rows[0];                               // Pull user record
    const match = await bcrypt.compare(password, user.password_hash); // Compare password hash
    if (!match)                                         // Password mismatch
      return res.status(401).send({ error: 'invalid_credentials' });

    const token = jwt.sign(                             // Sign and issue a JWT
      { sub: user.id, username },
      process.env.JWT_SECRET || 'ChangeThisSecret',
      { expiresIn: '1h' }
    );
    res.send({ token });                                // Return the token
  } catch {
    res.status(500).send({ error: 'login_failed' });    // Handle DB/query errors
  }
});

// eads the PORT environment variable, or defaults to 3000 if none is set
const PORT = process.env.PORT || 3000;
// starts HTTP server
app.listen(PORT, () => console.log(`Auth service on port ${PORT}`));
