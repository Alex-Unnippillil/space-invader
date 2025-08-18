import Player from './player.js';
import Bullet from './bullet.js';
import Enemy from './enemy.js';
import Starfield from './starfield.js';
import {
  updateHUD,
  saveScore,
  showLeaderboard,
  hideLeaderboard
} from './hud.js';

// Game configuration constants
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const PLAYER_SPEED = 5;

const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 15;
const BULLET_SPEED = 7;

const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 30;
const ENEMY_ROWS = 5;
const ENEMY_COLUMNS = 10;
const ENEMY_PADDING = 10;
const ENEMY_OFFSET_TOP = 50;
const ENEMY_OFFSET_LEFT = 50;
const ENEMY_BASE_SPEED = 1;

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
=======
    // Canvas and starfield
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    const bgCanvas = document.getElementById('bgCanvas');
    this.starfield = new Starfield(bgCanvas);

    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

    this.player = new Player(
      this.gameWidth / 2 - PLAYER_WIDTH / 2,
      this.gameHeight - PLAYER_HEIGHT - 10,
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      PLAYER_SPEED,
      '#00ff00'
    );

    this.bullet = new Bullet(
      BULLET_WIDTH,
      BULLET_HEIGHT,
      BULLET_SPEED,
      '#ff0000'
    );

    this.enemies = [];
    this.enemySpeed = ENEMY_BASE_SPEED;
=======
    // Colors
    const styles = getComputedStyle(document.documentElement);
    this.primaryColor =
      styles.getPropertyValue('--color-primary').trim() || '#00ff00';
    this.accentColor =
      styles.getPropertyValue('--color-accent').trim() || '#ff0000';

    // Entities
    this.player = new Player(
      this.gameWidth / 2 - 20,
      this.gameHeight - 40,
      40,
      30,
      5,
      this.primaryColor
    );
    this.bullet = new Bullet(5, 15, 7, this.accentColor);

    // Enemy configuration
    this.enemyCols = 10;
    this.enemyRows = 5;
    this.enemyWidth = 30;
    this.enemyHeight = 30;
    this.enemyPadding = 10;
    this.enemyOffsetTop = 50;
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.enemies = [];

    // Particles
    this.particles = [];

    // Game state
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore'), 10) || 0;
    this.lives = 3;
    this.level = 1;
    this.isPaused = false;
    this.gameOver = false;
    this.paused = false;
    this.lastTime = 0;

    // Input
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.spawnEnemies();
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
    this.enemySpeed = ENEMY_BASE_SPEED;
=======
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  reset() {
    this.enemies = [];
    this.particles = [];
    this.bullet.isFired = false;
    this.player.x = this.gameWidth / 2 - this.player.width / 2;
    this.player.y = this.gameHeight - this.player.height - 10;

    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.gameWon = false;
=======
    this.paused = false;

    this.spawnEnemies();
    hideOverlay('gameOverOverlay');
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level
    });
  }

  spawnEnemies() {
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLUMNS; col++) {
        const x = col * (ENEMY_WIDTH + ENEMY_PADDING) + ENEMY_OFFSET_LEFT;
        const y = row * (ENEMY_HEIGHT + ENEMY_PADDING) + ENEMY_OFFSET_TOP;
        this.enemies.push(
          new Enemy(x, y, ENEMY_WIDTH, ENEMY_HEIGHT, '#00ffff')
=======
    this.start();
  }

  handleKeyDown(e) {
    if (e.code === 'ArrowLeft') this.player.moveLeft();
    if (e.code === 'ArrowRight') this.player.moveRight();
    if (e.code === 'Space') {
      if (!this.bullet.isFired) {
        this.bullet.fire(
          this.player.x + this.player.width / 2,
          this.player.y
        );
        this.emitBulletParticles(
          this.bullet.x + this.bullet.width / 2,
          this.bullet.y
        );
      }
    }
    if (e.code === 'KeyP') this.togglePause();
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
=======
  handleKeyUp(e) {
    if (e.code === 'ArrowLeft') this.player.stopLeft();
    if (e.code === 'ArrowRight') this.player.stopRight();
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      showOverlay('pauseOverlay');
    } else {
      hideOverlay('pauseOverlay');
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  emitPlayerParticles() {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        life: 30,
        color: this.primaryColor
      });
    }
  }

  emitBulletParticles(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 20,
        color: this.accentColor
      });
    }
  }

  spawnEnemies() {
    for (let row = 0; row < this.enemyRows; row++) {
      for (let col = 0; col < this.enemyCols; col++) {
        const x =
          col * (this.enemyWidth + this.enemyPadding) + this.enemyPadding;
        const y =
          row * (this.enemyHeight + this.enemyPadding) + this.enemyOffsetTop;
        this.enemies.push(
          new Enemy(x, y, this.enemyWidth, this.enemyHeight, '#00ffff')
        );
      }
    } else if (event.key.toLowerCase() === 'p') {
      this.togglePause();
    }
  }

  update(delta) {
    this.starfield.update();

    if (this.paused || this.gameOver) return;

    if (this.player.isMovingLeft || this.player.isMovingRight) {
      this.emitPlayerParticles();
    }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      showOverlay('pauseOverlay');
    } else {
      hideOverlay('pauseOverlay');
    }
  }

  update() {
    if (this.starfield) this.starfield.update();
=======
    this.player.update(this.gameWidth);
    this.bullet.update();

    let hitEdge = false;
    this.enemies.forEach((enemy) => {
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (enemy.x <= 0 || enemy.x + enemy.width >= this.gameWidth) {
        hitEdge = true;
      }
    });

    if (hitEdge) {
      this.enemyDirection *= -1;
      for (const enemy of this.enemies) {
        enemy.moveDown(ENEMY_HEIGHT);
      }
=======
      this.enemies.forEach((e) => e.moveDown(this.enemyHeight));
    }

    if (this.bullet.isFired) {
      this.enemies.forEach((enemy) => {
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
          this.emitBulletParticles(
            this.bullet.x + this.bullet.width / 2,
            this.bullet.y
          );
        }
      });
    }
=======
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
    if (!this.isPaused) {
      this.update();
      this.draw();
    }
=======
    this.update();
    this.draw();
      if (!this.gameOver) {
        requestAnimationFrame(() => this.gameLoop());
      } else {
        if (this.enemies.every((e) => !e.isAlive)) {
          showOverlay('winOverlay');
        } else {
          showOverlay('gameOverOverlay');
        }
        saveScore('Player', this.score);
        showLeaderboard();
      }
=======
=======
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
=======
=======
      updateLeaderboard();
    }
  }

    this.enemies = this.enemies.filter((e) => e.isAlive);

    if (this.enemies.length === 0) {
      this.level++;
      this.enemySpeed += 0.2;
      this.enemyRows++;
      this.spawnEnemies();
      updateHUD({
        score: this.score,
        highScore: this.highScore,
        lives: this.lives,
        level: this.level
      });
    }

    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    this.particles = this.particles.filter((p) => p.life > 0);

    const reachedBottom = this.enemies.some(
      (e) => e.y + e.height >= this.player.y
    );
    if (reachedBottom) {
      this.lives--;
      updateHUD({
        score: this.score,
        highScore: this.highScore,
        lives: this.lives,
        level: this.level
      });
      if (this.lives <= 0) {
        this.gameOver = true;
        saveScore('Player', this.score);
        showLeaderboard();
        showOverlay('gameOverOverlay');
      } else {
        this.enemies = [];
        this.spawnEnemies();
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.ctx);
    this.bullet.draw(this.ctx);
    this.enemies.forEach((enemy) => enemy.draw(this.ctx));
    this.particles.forEach((p) => {
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, 2, 2);
    });
  }
=======
  // Start the game loop
  updateHUD({ score, highScore, lives, level });
  gameLoop();
}


function startGame() {
  hideOverlay('startOverlay');
  hideOverlay('gameOverOverlay');
  hideOverlay('winOverlay');
  hideOverlay('pauseOverlay');
=======
  init();
}

function resetGame() {
  startGame();
}
=======
=======
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
  const leaderboardButton = document.getElementById('leaderboardButton');
  const closeLeaderboard = document.getElementById('closeLeaderboard');
  if (startButton) startButton.addEventListener('click', startGame);
  if (restartButton) restartButton.addEventListener('click', resetGame);
  if (playAgainButton) playAgainButton.addEventListener('click', resetGame);
  if (leaderboardButton)
    leaderboardButton.addEventListener('click', showLeaderboard);
  if (closeLeaderboard)
    closeLeaderboard.addEventListener('click', hideLeaderboard);
});

=======
  loop(timestamp) {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(delta);
    this.starfield.draw();
    this.draw();

    if (!this.paused && !this.gameOver) {
      requestAnimationFrame((t) => this.loop(t));
    }
  }
}

=======

=======
=======
// Attach button handlers after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startButton')?.addEventListener('click', startGame);
  document.getElementById('restartButton')?.addEventListener('click', resetGame);
});
=======
=======


=======
// Attach button handlers after page load
window.onload = function () {
  document
    .getElementById("startButton")
    .addEventListener("click", startGame);
  document
    .getElementById("restartButton")
    .addEventListener("click", resetGame);
};


