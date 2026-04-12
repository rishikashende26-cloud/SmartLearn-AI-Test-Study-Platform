import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
const db = new Database("database.sqlite");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    title TEXT,
    time TEXT,
    room TEXT,
    color TEXT,
    date TEXT,
    reminder BOOLEAN DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    score INTEGER,
    totalQuestions INTEGER,
    date TEXT,
    level TEXT,
    fileName TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SmartLearn Backend is running" });
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, email, password } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
      const result = stmt.run(username, email, password);
      res.json({ success: true, user: { id: result.lastInsertRowid, username, email } });
    } catch (error: any) {
      if (error.code === "SQLITE_CONSTRAINT") {
        res.status(400).json({ success: false, message: "Email already exists" });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  });

  app.get("/api/events/:userId", (req, res) => {
    const { userId } = req.params;
    const events = db.prepare("SELECT * FROM events WHERE userId = ?").all(userId);
    res.json({ success: true, events });
  });

  app.post("/api/events", (req, res) => {
    const { userId, title, time, room, color, date, reminder } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO events (userId, title, time, room, color, date, reminder) VALUES (?, ?, ?, ?, ?, ?, ?)");
      const result = stmt.run(userId, title, time, room, color, date, reminder ? 1 : 0);
      res.json({ success: true, event: { id: result.lastInsertRowid, userId, title, time, room, color, date, reminder } });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to add event" });
    }
  });

  app.delete("/api/events/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM events WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to delete event" });
    }
  });

  app.get("/api/results/:userId", (req, res) => {
    const { userId } = req.params;
    const results = db.prepare("SELECT * FROM test_results WHERE userId = ? ORDER BY date DESC").all(userId);
    res.json({ success: true, results });
  });

  app.post("/api/results", (req, res) => {
    const { userId, score, totalQuestions, date, level, fileName } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO test_results (userId, score, totalQuestions, date, level, fileName) VALUES (?, ?, ?, ?, ?, ?)");
      const result = stmt.run(userId, score, totalQuestions, date, level, fileName);
      res.json({ success: true, resultId: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to save test result" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
