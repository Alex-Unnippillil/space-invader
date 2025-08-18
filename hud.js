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

function saveScore(name, score) {
  const data = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  data.push({ name, score });
  data.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(data.slice(0, 5)));
}

function updateLeaderboard() {
  if (!leaderboardList) return;
  leaderboardList.innerHTML = '';
  const data = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  data.slice(0, 5).forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

function showLeaderboard() {
  updateLeaderboard();
  if (leaderboardOverlay) leaderboardOverlay.classList.add('show');
}

function hideLeaderboard() {
  if (leaderboardOverlay) leaderboardOverlay.classList.remove('show');
}

export { initHUD, updateHUD, saveScore, showLeaderboard, hideLeaderboard };
