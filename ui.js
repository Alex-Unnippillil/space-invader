import { initHUD, showLeaderboard, hideLeaderboard } from './hud.js';
import { hideOverlay } from './game.js';

function initGameUI(game) {
  initHUD();

  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const playAgainButton = document.getElementById('playAgainButton');
  const leaderboardButton = document.getElementById('leaderboardButton');
  const closeLeaderboard = document.getElementById('closeLeaderboard');

  if (leaderboardButton)
    leaderboardButton.addEventListener('click', showLeaderboard);
  if (closeLeaderboard)
    closeLeaderboard.addEventListener('click', hideLeaderboard);

  if (startButton) {
    startButton.addEventListener('click', () => {
      game.start();
      hideOverlay('startOverlay');
    });
  }
  if (restartButton) {
    restartButton.addEventListener('click', () => {
      game.reset();
      hideOverlay('gameOverOverlay');
    });
  }
  if (playAgainButton) {
    playAgainButton.addEventListener('click', () => {
      game.reset();
      hideOverlay('winOverlay');
    });
  }

  // Mobile controls
  const leftButton = document.getElementById('leftButton');
  const rightButton = document.getElementById('rightButton');
  const shootButton = document.getElementById('shootButton');

  const bindMove = (btn, start, stop) => {
    const startHandler = (e) => {
      e.preventDefault();
      start();
    };
    const endHandler = (e) => {
      e.preventDefault();
      stop();
    };
    btn.addEventListener('touchstart', startHandler);
    btn.addEventListener('mousedown', startHandler);
    btn.addEventListener('touchend', endHandler);
    btn.addEventListener('touchcancel', endHandler);
    btn.addEventListener('mouseup', endHandler);
    btn.addEventListener('mouseleave', endHandler);
  };

  if (leftButton)
    bindMove(leftButton, () => game.player.moveLeft(), () => game.player.stopLeft());

  if (rightButton)
    bindMove(rightButton, () => game.player.moveRight(), () => game.player.stopRight());

  if (shootButton) {
    const fire = (e) => {
      e.preventDefault();
      if (!game.bullet.isFired) {
        game.bullet.fire(
          game.player.x + game.player.width / 2,
          game.player.y
        );
      }
    };
    shootButton.addEventListener('touchstart', fire);
    shootButton.addEventListener('click', fire);
  }

  // Responsive canvas sizing
  const resizeCanvas = () => {
    const container = document.getElementById('gameContainer');
    const bgCanvas = document.getElementById('bgCanvas');
    const gameCanvas = document.getElementById('gameCanvas');
    const aspect = 4 / 3;

    let width = window.innerWidth;
    let height = window.innerHeight;

    if (width / height > aspect) {
      width = height * aspect;
    } else {
      height = width / aspect;
    }

    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    bgCanvas.width = width;
    bgCanvas.height = height;
    gameCanvas.width = width;
    gameCanvas.height = height;

    game.gameWidth = width;
    game.gameHeight = height;
    if (game.starfield && typeof game.starfield.resize === 'function') {
      game.starfield.resize(width, height);
    }
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

export { initGameUI };
