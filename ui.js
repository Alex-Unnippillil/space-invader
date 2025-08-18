import { initHUD, showLeaderboard, hideLeaderboard } from './hud.js';

function initGameUI(game) {
  initHUD();

  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const playAgainButton = document.getElementById('playAgainButton');
  const leaderboardButton = document.getElementById('leaderboardButton');
  const closeLeaderboard = document.getElementById('closeLeaderboard');
  const leftButton = document.getElementById('leftButton');
  const rightButton = document.getElementById('rightButton');
  const shootButton = document.getElementById('shootButton');

  if (startButton) startButton.addEventListener('click', () => game.start());
  if (restartButton) restartButton.addEventListener('click', () => game.reset());
  if (playAgainButton)
    playAgainButton.addEventListener('click', () => game.reset());
  if (leaderboardButton)
    leaderboardButton.addEventListener('click', showLeaderboard);
  if (closeLeaderboard)
    closeLeaderboard.addEventListener('click', hideLeaderboard);

  const addPressEvents = (button, onPress, onRelease) => {
    if (!button) return;
    ['mousedown', 'touchstart'].forEach((evt) => {
      button.addEventListener(evt, (e) => {
        e.preventDefault();
        onPress();
      });
    });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((evt) => {
      button.addEventListener(evt, (e) => {
        e.preventDefault();
        onRelease();
      });
    });
  };

  addPressEvents(leftButton, () => game.player.moveLeft(), () => game.player.stopLeft());
  addPressEvents(
    rightButton,
    () => game.player.moveRight(),
    () => game.player.stopRight()
  );

  if (shootButton) {
    const fire = (e) => {
      e.preventDefault();
      if (!game.bullet.isFired) {
        const startX = game.player.x + game.player.width / 2;
        const startY = game.player.y;
        game.bullet.fire(startX, startY);
      }
    };
    shootButton.addEventListener('click', fire);
    shootButton.addEventListener('touchstart', fire);
  }
}

export { initGameUI };
