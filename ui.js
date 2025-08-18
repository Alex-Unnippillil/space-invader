import { initHUD, showLeaderboard, hideLeaderboard } from './hud.js';

function initGameUI(game) {
  initHUD();

  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const playAgainButton = document.getElementById('playAgainButton');
  const leaderboardButton = document.getElementById('leaderboardButton');
  const closeLeaderboard = document.getElementById('closeLeaderboard');

  if (startButton) startButton.addEventListener('click', () => game.start());
  if (restartButton) restartButton.addEventListener('click', () => game.reset());
  if (playAgainButton)
    playAgainButton.addEventListener('click', () => game.reset());
  if (leaderboardButton)
    leaderboardButton.addEventListener('click', showLeaderboard);
  if (closeLeaderboard)
    closeLeaderboard.addEventListener('click', hideLeaderboard);
}

export { initGameUI };
