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

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 20;
const SCORE_MIN = 0;
const SCORE_MAX = 1_000_000;

function validateScorePayload(payload) {
  const fieldErrors = {};
  const result = {};
  const { name, score } = payload ?? {};

  if (typeof name !== 'string') {
    fieldErrors.name = 'Name must be a string.';
  } else {
    const normalizedName = name.replace(/[\x00-\x1F\x7F]/g, '').trim();
    if (normalizedName.length < NAME_MIN_LENGTH || normalizedName.length > NAME_MAX_LENGTH) {
      fieldErrors.name = `Name length must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`;
    } else {
      result.name = normalizedName;
    }
  }

  if (!Number.isInteger(score)) {
    fieldErrors.score = 'Score must be an integer.';
  } else if (score < SCORE_MIN || score > SCORE_MAX) {
    fieldErrors.score = `Score must be between ${SCORE_MIN} and ${SCORE_MAX}.`;
  } else {
    result.score = score;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: {
        message: 'Validation failed',
        fields: fieldErrors
      }
    };
  }

  return { ok: true, value: result };
}

// Route to submit a score
app.post('/scores', (req, res) => {
  const validation = validateScorePayload(req.body);
  if (!validation.ok) {
    return res.status(400).json(validation.error);
  }
  const { name, score } = validation.value;

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
