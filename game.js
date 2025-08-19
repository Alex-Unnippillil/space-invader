import Player from './player.js';
import Bullet from './bullet.js';
import Enemy from './enemy.js';
import Starfield from './starfield.js';
import {
  updateHUD,
  saveScore,
  showLeaderboard,
  hideLeaderboard,
} from './hud.js';
=======

export function showOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

export function hideOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

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

export function showOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

export function hideOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

function allEnemiesDefeated(enemies) {
  return enemies.every((enemy) => !enemy.isAlive);
}

export default class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.context = this.canvas.getContext('2d');

    const bgCanvas = document.getElementById('bgCanvas');
    this.starfield = bgCanvas ? new Starfield(bgCanvas) : null;
=======
export default class Game {
  constructor() {
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
    this.enemyDirection = 1;
    this.spawnEnemies();
=======
    this.enemyDirection = 1;
    this.enemySpeed = ENEMY_BASE_SPEED;

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore'), 10) || 0;
    this.lives = 3;
    this.level = 1;

    this.isPaused = false;
    this.gameOver = false;
    this.gameWon = false;
    this.lastTime = 0;

    this.startOverlay = document.getElementById('startOverlay');
    this.gameOverOverlay = document.getElementById('gameOverOverlay');
    this.winOverlay = document.getElementById('winOverlay');
    this.pauseOverlay = document.getElementById('pauseOverlay');
=======

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.gameLoop = this.gameLoop.bind(this);

    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
  }

  start() {
    hideOverlay('startOverlay');
    hideOverlay('gameOverOverlay');
    hideOverlay('winOverlay');
    hideOverlay('pauseOverlay');
    this.isPaused = false;
    this.gameOver = false;
    this.gameWon = false;
    this.lastTime = 0;
    requestAnimationFrame(this.gameLoop);
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.bullet.isFired = false;
    this.enemySpeed = ENEMY_BASE_SPEED;
    this.enemyDirection = 1;
=======
    this.spawnEnemies();
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
  }

  start() {
    hideOverlay('startOverlay');
    hideOverlay('gameOverOverlay');
    hideOverlay('winOverlay');
    hideOverlay('pauseOverlay');
    hideLeaderboard();
    this.resetState();
    requestAnimationFrame(() => this.gameLoop());
  }

  resetState() {
    this.player.x = this.gameWidth / 2 - PLAYER_WIDTH / 2;
    this.player.y = this.gameHeight - PLAYER_HEIGHT - 10;
    this.player.stopLeft();
    this.player.stopRight();
    this.bullet.isFired = false;
    this.enemies = [];
    this.enemyDirection = 1;
    this.enemySpeed = ENEMY_BASE_SPEED;
    this.spawnEnemies();
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
    this.start();
  }

  spawnEnemies() {
    this.enemies = [];
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLUMNS; col++) {
        const x =
          ENEMY_OFFSET_LEFT + col * (ENEMY_WIDTH + ENEMY_PADDING);
        const y =
          ENEMY_OFFSET_TOP + row * (ENEMY_HEIGHT + ENEMY_PADDING);
        this.enemies.push(
          new Enemy(x, y, ENEMY_WIDTH, ENEMY_HEIGHT, '#ffffff')
        );
      }
    }
  }

  update(delta) {
    if (this.starfield) {
      this.starfield.update();
      this.starfield.draw();
=======
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLUMNS; col++) {
        const x = col * (ENEMY_WIDTH + ENEMY_PADDING) + ENEMY_OFFSET_LEFT;
        const y = row * (ENEMY_HEIGHT + ENEMY_PADDING) + ENEMY_OFFSET_TOP;
        this.enemies.push(new Enemy(x, y, ENEMY_WIDTH, ENEMY_HEIGHT, '#00ffff'));
      }
    }
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') this.player.moveLeft();
    if (e.key === 'ArrowRight' || e.key === 'd') this.player.moveRight();
    if (e.key === ' ' || e.code === 'Space') {
      if (!this.bullet.isFired) {
        this.bullet.fire(
          this.player.x + this.player.width / 2,
          this.player.y
        );
      }
    }
    if (e.key === 'p' || e.key === 'P') this.togglePause();
  }

  handleKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') this.player.stopLeft();
    if (e.key === 'ArrowRight' || e.key === 'd') this.player.stopRight();
  }

  togglePause() {
    if (this.gameOver) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      showOverlay('pauseOverlay');
    } else {
      hideOverlay('pauseOverlay');
      requestAnimationFrame(() => this.gameLoop());
    }

=======
  gameLoop() {
    if (this.gameOver || this.isPaused) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    this.starfield.update();
    this.player.update(this.gameWidth);
    this.bullet.update();

    // Enemy movement
    let hitEdge = false;
    this.enemies.forEach((enemy) => {
      if (!enemy.isAlive) return;
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (
        enemy.x <= 0 ||
        enemy.x + enemy.width >= this.gameWidth
      ) {
        hitEdge = true;
      }
    });
    if (hitEdge) {
      this.enemyDirection *= -1;
      this.enemies.forEach((enemy) => enemy.moveDown(10));
    }

    // Bullet collisions
    if (this.bullet.isFired) {
      this.enemies.forEach((enemy) => {
        if (
          enemy.isAlive &&
          this.bullet.x < enemy.x + enemy.width &&
          this.bullet.x + this.bullet.width > enemy.x &&
          this.bullet.y < enemy.y + enemy.height &&
          this.bullet.y + this.bullet.height > enemy.y
=======
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (enemy.x + enemy.width > this.gameWidth || enemy.x < 0) hitEdge = true;

      if (this.bullet.isFired) {
        const bx = this.bullet.x;
        const by = this.bullet.y;
        const bw = this.bullet.width;
        const bh = this.bullet.height;
        if (
          bx < enemy.x + enemy.width &&
          bx + bw > enemy.x &&
          by < enemy.y + enemy.height &&
          by + bh > enemy.y
        ) {
          enemy.isAlive = false;
          this.bullet.isFired = false;
          this.score += 10;
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
          }
=======
          updateHUD({
            score: this.score,
            highScore: this.highScore,
            lives: this.lives,
            level: this.level,
          });
        }
      });
    }

    // Check for win
    if (allEnemiesDefeated(this.enemies)) {
      this.endGame(true);
    }

    // Enemy reaches player
    this.enemies.forEach((enemy) => {
      if (!enemy.isAlive) return;
      if (enemy.y + enemy.height >= this.player.y) {
        this.lives -= 1;
        enemy.isAlive = false;
        if (this.lives <= 0) {
          this.endGame(false);
        }
        updateHUD({
          score: this.score,
          highScore: this.highScore,
          lives: this.lives,
          level: this.level,
        });
      }
    });
  }

  draw() {
    this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.context);
    this.bullet.draw(this.context);
    this.enemies.forEach((enemy) => enemy.draw(this.context));
  }

  gameLoop(timestamp) {
    if (this.isPaused || this.gameOver || this.gameWon) return;
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.update(delta);
    this.draw();
    requestAnimationFrame(this.gameLoop);
  }

  handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        this.player.moveLeft();
        break;
      case 'ArrowRight':
      case 'd':
        this.player.moveRight();
        break;
      case ' ': // space
        if (!this.bullet.isFired) {
          this.bullet.fire(
            this.player.x + this.player.width / 2,
            this.player.y
          );
        }
        break;
      case 'p':
      case 'P':
        this.togglePause();
        break;
      default:
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        this.player.stopLeft();
        break;
      case 'ArrowRight':
      case 'd':
        this.player.stopRight();
        break;
      default:
        break;
    }
  }

  togglePause() {
    if (this.gameOver || this.gameWon) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      showOverlay('pauseOverlay');
    } else {
      hideOverlay('pauseOverlay');
      requestAnimationFrame(this.gameLoop);
    }
  }

  endGame(won) {
    this.gameOver = !won;
    this.gameWon = won;
    this.isPaused = true;
    const name = prompt('Enter your name:', 'Player');
    if (name) saveScore(name, this.score);
    if (won) {
      showOverlay('winOverlay');
    } else {
      showOverlay('gameOverOverlay');
=======
      }

      if (enemy.y + enemy.height >= this.player.y) {
        this.lives -= 1;
        if (this.lives <= 0) {
          this.endGame();
        } else {
          this.resetState();
        }
        return;
      }
    }

    if (hitEdge) {
      this.enemyDirection *= -1;
      for (const enemy of this.enemies) {
        enemy.moveDown(10);
      }
    }

    if (this.enemies.every((e) => !e.isAlive)) {
      this.level += 1;
      this.enemySpeed += 0.2;
      this.spawnEnemies();
      updateHUD({
        score: this.score,
        highScore: this.highScore,
        lives: this.lives,
        level: this.level,
      });
    }
  }

  draw() {
    this.starfield.draw();
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.ctx);
    this.bullet.draw(this.ctx);
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }
  }

  endGame() {
    this.gameOver = true;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('highScore', this.highScore);
    }
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
    showOverlay('gameOverOverlay');
    saveScore('Player', this.score);
  }
}
export { showLeaderboard, hideLeaderboard };
=======

