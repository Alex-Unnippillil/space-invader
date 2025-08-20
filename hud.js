const API_BASE = 'http://localhost:3000';

let scoreEl;
let highScoreEl;
let livesEl;
let levelEl;
let leaderboardOverlay;
let leaderboardList;

function initHUD() {
  scoreEl = document.getElementById('score');
  highScoreEl = document.getElementById('highScore');
  livesEl = document.getElementById('lives');
  levelEl = document.getElementById('level');
  leaderboardOverlay = document.getElementById('leaderboardOverlay');
  leaderboardList = document.getElementById('leaderboardList');

  const leaderboardButton = document.getElementById('leaderboardButton');
  const closeLeaderboard = document.getElementById('closeLeaderboard');
  if (leaderboardButton)
    leaderboardButton.addEventListener('click', showLeaderboard);
  if (closeLeaderboard)
    closeLeaderboard.addEventListener('click', hideLeaderboard);

  updateLeaderboard();
}

function updateHUD({ score, highScore, lives, level }) {
  if (scoreEl) scoreEl.textContent = score;
  if (highScoreEl) highScoreEl.textContent = highScore;
  if (livesEl) livesEl.textContent = lives;
  if (levelEl) levelEl.textContent = level;
}

async function saveScore(name, score) {
  try {
    await fetch(`${API_BASE}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score }),
    });
  } catch (err) {
    console.error('Failed to save score', err);
  }
}

async function updateLeaderboard() {
  if (!leaderboardList) return;
  leaderboardList.innerHTML = '';
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    data.forEach((entry) => {
      const li = document.createElement('li');
      li.textContent = `${entry.name}: ${entry.score}`;
      leaderboardList.appendChild(li);
    });
  } catch (err) {
    const li = document.createElement('li');
    li.textContent = 'Unable to load leaderboard';
    leaderboardList.appendChild(li);
    console.error('Failed to load leaderboard', err);
  }
}

function showLeaderboard() {
  updateLeaderboard();
  if (leaderboardOverlay) leaderboardOverlay.classList.add('show');
}

function hideLeaderboard() {
  if (leaderboardOverlay) leaderboardOverlay.classList.remove('show');
}

export {
  initHUD,
  updateHUD,
  saveScore,
  showLeaderboard,
  hideLeaderboard,
};
