const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const API_URL = "http://localhost:3000";

const app = express();

// CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "myuser",
  password: "mypassword",
  database: "myfinance",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    setTimeout(() => db.connect(), 2000);
  } else {
    console.log('✓ Connected to MySQL database');
  }
});

db.on('error', (err) => {
  console.error('✗ Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    db.connect();
  }
});

app.post("/transactions", (req, res) => {
  const {
    user_id,
    account_id,
    category_id,
    type,
    amount,
    description,
    date,
    payment_method,
    note
  } = req.body;

  const sql = `
    INSERT INTO transactions 
    (user_id, account_id, category_id, type, amount, description, date, payment_method, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql,
    [user_id, account_id, category_id, type, amount, description, date, payment_method, note],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error saving transaction");
      }
      res.send("Transaction saved!");
    }
  );
});

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Register
app.post("/register", (req, res) => {
  console.log("REGISTER HIT", req.body);

  const { name, email, password, currency } = req.body;

  const sql = "INSERT INTO users (name, email, password, currency) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, password, currency], (err, result) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).send("Error creating user");
    }

    console.log("USER CREATED:", result);
    res.send("User created!");
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=? AND password=?";

  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).send("Server error");

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(401).send("Invalid credentials");
    }
  });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("✓ Server running on all interfaces on port 3000");
  console.log("✓ Ready to accept requests from anywhere");
});

app.get("/accounts/:userId", (req, res) => {
  const userId = req.params.userId;

  db.query(
    "SELECT * FROM accounts WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

app.get("/categories/:userId", (req, res) => {
  const userId = req.params.userId;

  db.query(
    "SELECT * FROM categories WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});