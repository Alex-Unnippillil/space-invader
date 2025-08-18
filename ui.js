import { initHUD } from './hud.js';

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
}

export { initGameUI };
