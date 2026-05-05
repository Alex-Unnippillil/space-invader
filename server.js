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

  db.run('INSERT INTO scores (name, score) VALUES (?, ?)', [name, score], function (err) {
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

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
let isShuttingDown = false;
function shutdown(signal) {
  if (isShuttingDown) {
    console.log(`Shutdown already in progress (received ${signal}).`);
    return;
  }
  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  server.close((serverErr) => {
    if (serverErr) {
      console.error('HTTP server close error during shutdown', serverErr);
    } else {
      console.log('HTTP server closed.');
    }

    db.close((dbErr) => {
      if (dbErr) {
        console.error('Database close error during shutdown', dbErr);
        process.exit(1);
        return;
      }
      console.log('Database connection closed.');
      console.log('Graceful shutdown complete. Exiting process.');
      process.exit(serverErr ? 1 : 0);
    });
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
