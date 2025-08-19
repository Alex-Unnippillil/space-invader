const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing and CORS
app.use(cors());
app.use(express.json());

// Initialise SQLite database
const dbPath = path.join(__dirname, 'scores.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, score INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)'
  );
});

// Route to submit a score
app.post('/scores', (req, res) => {
  const { name, score } = req.body;
  if (typeof name !== 'string' || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const stmt = db.prepare('INSERT INTO scores (name, score) VALUES (?, ?)');
  stmt.run(name, score, function (err) {
    if (err) {
      console.error('DB insert error', err);
      return res.status(500).json({ error: 'Failed to save score' });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Route to get leaderboard
app.get('/leaderboard', (req, res) => {
  db.all('SELECT name, score FROM scores ORDER BY score DESC LIMIT 5', [], (err, rows) => {
    if (err) {
      console.error('DB query error', err);
      return res.status(500).json({ error: 'Failed to load leaderboard' });
    }
    res.json(rows);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit();
});
