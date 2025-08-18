import Player from './player.js';
import Bullet from './bullet.js';
import Enemy from './enemy.js';
import Starfield from './starfield.js';
import { updateHUD, saveScore, showLeaderboard, hideLeaderboard } from './hud.js';

// Overlay helpers
export function showOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

export function hideOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

export default class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.context = this.canvas.getContext('2d');
    const bgCanvas = document.getElementById('bgCanvas');
    if (bgCanvas) this.starfield = new Starfield(bgCanvas);

    // Game constants
    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;
    this.playerWidth = 40;
    this.playerHeight = 30;
    this.playerSpeed = 5;
    this.bulletWidth = 5;
    this.bulletHeight = 15;
    this.bulletSpeed = 7;
    this.enemyWidth = 30;
    this.enemyHeight = 30;
    this.enemyRowCount = 5;
    this.enemyColumnCount = 10;
    this.enemyPadding = 10;
    this.enemyOffsetTop = 50;
    this.enemyOffsetLeft = 50;

    // Entities
    this.player = new Player(
      this.gameWidth / 2 - this.playerWidth / 2,
      this.gameHeight - this.playerHeight - 10,
      this.playerWidth,
      this.playerHeight,
      this.playerSpeed,
      '#00ff00'
    );
    this.bullet = new Bullet(
      this.bulletWidth,
      this.bulletHeight,
      this.bulletSpeed,
      '#ff0000'
    );

    this.enemies = [];
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.spawnEnemies();

    // Game state
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore'), 10) || 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.gameWon = false;

    // Input handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  start() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level
    });
    this.gameLoop();
  }

  reset() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.enemies = [];
    this.enemyDirection = 1;
    this.enemySpeed = 1;
    this.bullet.isFired = false;
    this.spawnEnemies();
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level
    });
  }

  spawnEnemies() {
    for (let row = 0; row < this.enemyRowCount; row++) {
      for (let col = 0; col < this.enemyColumnCount; col++) {
        const x = col * (this.enemyWidth + this.enemyPadding) + this.enemyOffsetLeft;
        const y = row * (this.enemyHeight + this.enemyPadding) + this.enemyOffsetTop;
        this.enemies.push(
          new Enemy(x, y, this.enemyWidth, this.enemyHeight, '#00ffff')
        );
      }
    }
  }

  handleKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      this.player.moveLeft();
    } else if (event.key === 'ArrowRight') {
      this.player.moveRight();
    } else if (event.key === ' ' || event.key === 'Spacebar') {
      if (!this.bullet.isFired) {
        const startX = this.player.x + this.player.width / 2;
        const startY = this.player.y;
        this.bullet.fire(startX, startY);
      }
    }
  }

  handleKeyUp(event) {
    if (event.key === 'ArrowLeft') {
      this.player.stopLeft();
    } else if (event.key === 'ArrowRight') {
      this.player.stopRight();
    }
  }

  update() {
    if (this.starfield) this.starfield.update();
    this.player.update(this.gameWidth);
    this.bullet.update();

    let moveDown = false;
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (enemy.x <= 0 || enemy.x + enemy.width >= this.gameWidth) {
        moveDown = true;
      }
    }
    if (moveDown) {
      this.enemyDirection *= -1;
      for (const enemy of this.enemies) {
        enemy.moveDown(this.enemyHeight);
      }
    }

    if (this.bullet.isFired) {
      for (const enemy of this.enemies) {
        if (
          enemy.isAlive &&
          this.bullet.x < enemy.x + enemy.width &&
          this.bullet.x + this.bullet.width > enemy.x &&
          this.bullet.y < enemy.y + enemy.height &&
          this.bullet.y + this.bullet.height > enemy.y
        ) {
          enemy.isAlive = false;
          this.bullet.isFired = false;
          this.score += 10;
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
          }
          updateHUD({
            score: this.score,
            highScore: this.highScore,
            lives: this.lives,
            level: this.level
          });
        }
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.isAlive && enemy.y + enemy.height >= this.player.y) {
        this.gameOver = true;
        this.gameWon = false;
      }
    }

    if (this.enemies.every((e) => !e.isAlive)) {
      this.gameOver = true;
      this.gameWon = true;
    }
  }

  draw() {
    if (this.starfield) this.starfield.draw();
    this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.context);
    this.bullet.draw(this.context);
    for (const enemy of this.enemies) {
      enemy.draw(this.context);
    }
  }

  gameLoop() {
    this.update();
    this.draw();
    if (!this.gameOver) {
      requestAnimationFrame(() => this.gameLoop());
    } else {
      const overlayId = this.gameWon ? 'winOverlay' : 'gameOverOverlay';
      showOverlay(overlayId);
      saveScore('Player', this.score);
      showLeaderboard();
    }
  }
}

let currentGame;

function startGame() {
  hideOverlay('startOverlay');
  hideOverlay('gameOverOverlay');
  hideOverlay('winOverlay');
  hideLeaderboard();
  if (!currentGame) {
    currentGame = new Game();
  } else {
    currentGame.reset();
  }
  currentGame.start();
}

function resetGame() {
  startGame();
}

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const playAgainButton = document.getElementById('playAgainButton');
  if (startButton) startButton.addEventListener('click', startGame);
  if (restartButton) restartButton.addEventListener('click', resetGame);
  if (playAgainButton) playAgainButton.addEventListener('click', resetGame);
});

