import { initHUD } from './hud.js';
import { hideOverlay } from './game.js';

function initGameUI(game) {
  initHUD();

  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const playAgainButton = document.getElementById('playAgainButton');

=======
  if (startButton) startButton.addEventListener('click', () => game.start());
  if (restartButton) restartButton.addEventListener('click', () => game.reset());
  if (playAgainButton)
    playAgainButton.addEventListener('click', () => game.reset());
=======

  const leftButton = document.getElementById('leftButton');
  const rightButton = document.getElementById('rightButton');
  const shootButton = document.getElementById('shootButton');

  const bindMove = (btn, start, stop) => {
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointerleave', stop);
  };

  if (leftButton)
    bindMove(
      leftButton,
      () => game.player.moveLeft(),
      () => game.player.stopLeft()
    );

  if (rightButton)
    bindMove(
      rightButton,
      () => game.player.moveRight(),
      () => game.player.stopRight()
    );

  if (shootButton) {
    shootButton.addEventListener('click', () => {
      if (!game.bullet.isFired) {
        game.bullet.fire(
          game.player.x + game.player.width / 2,
          game.player.y
        );
      }
    });
  }

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
}

export { initGameUI };

