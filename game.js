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

function showOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function hideOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

export default class Game {
  constructor() {
    // canvases
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    const bgCanvas = document.getElementById('bgCanvas');
    this.starfield = bgCanvas ? new Starfield(bgCanvas) : null;

    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

    // entities
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

    // enemy movement
    this.enemyDirection = 1;
    this.enemySpeed = ENEMY_BASE_SPEED;

    // game state
    this.score = 0;
    this.highScore =
      parseInt(localStorage.getItem('highScore'), 10) || 0;
    this.lives = 3;
    this.level = 1;
    this.isPaused = false;
    this.gameOver = false;

    // overlays
    this.startOverlay = document.getElementById('startOverlay');
    this.gameOverOverlay = document.getElementById('gameOverOverlay');
    this.pauseOverlay = document.getElementById('pauseOverlay');

    // bind methods
    this.gameLoop = this.gameLoop.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    // input listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.resetState();
  }

  resetState() {
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
  }

  start() {
    hideOverlay('startOverlay');
    hideOverlay('gameOverOverlay');
    hideOverlay('pauseOverlay');
    hideLeaderboard();

    this.gameOver = false;
    this.isPaused = false;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.highScore =
      parseInt(localStorage.getItem('highScore'), 10) || 0;
    this.resetState();
    requestAnimationFrame(this.gameLoop);
  }

  reset() {
    this.start();
  }

  spawnEnemies() {
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLUMNS; col++) {
        const x =
          col * (ENEMY_WIDTH + ENEMY_PADDING) + ENEMY_OFFSET_LEFT;
        const y =
          row * (ENEMY_HEIGHT + ENEMY_PADDING) + ENEMY_OFFSET_TOP;
        this.enemies.push(
          new Enemy(x, y, ENEMY_WIDTH, ENEMY_HEIGHT, '#00ffff')
        );
      }
    }
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
      }
    }
    if (e.code === 'KeyP') this.togglePause();
  }

  handleKeyUp(e) {
    if (e.code === 'ArrowLeft') this.player.stopLeft();
    if (e.code === 'ArrowRight') this.player.stopRight();
  }

  togglePause() {
    if (this.gameOver) return;
    this.isPaused = !this.isPaused;
    if (this.pauseOverlay)
      this.pauseOverlay.classList.toggle('show', this.isPaused);
    if (!this.isPaused) requestAnimationFrame(this.gameLoop);
  }

  update() {
    if (this.starfield) {
      this.starfield.update();
      this.starfield.draw();
    }

    if (this.isPaused || this.gameOver) return;

    this.player.update(this.gameWidth);
    this.bullet.update();

    // move enemies
    this.enemies.forEach((enemy) => {
      enemy.update(this.enemyDirection, this.enemySpeed);
    });

    // change direction on wall hit
    const hitWall = this.enemies.some(
      (e) => e.x + e.width >= this.gameWidth || e.x <= 0
    );
    if (hitWall) {
      this.enemyDirection *= -1;
      this.enemies.forEach((e) => e.moveDown(ENEMY_HEIGHT / 2));
    }

    // bullet collision
    if (this.bullet.isFired) {
      this.enemies.forEach((enemy) => {
        if (enemy.isAlive && this.checkCollision(this.bullet, enemy)) {
          enemy.isAlive = false;
          this.bullet.isFired = false;
          this.score += 10;
        }
      });
    }

    // remove dead enemies
    this.enemies = this.enemies.filter((e) => e.isAlive);

    // next level if all dead
    if (this.enemies.length === 0) {
      this.level++;
      this.enemySpeed += 0.2;
      this.spawnEnemies();
    }

    // check collisions with player or bottom
    const reachedBottom = this.enemies.some(
      (e) => e.y + e.height >= this.player.y
    );
    const hitPlayer = this.enemies.some((e) => this.checkCollision(e, this.player));

    if (reachedBottom || hitPlayer) {
      this.lives--;
      if (this.lives <= 0) {
        this.endGame();
      } else {
        this.resetState();
      }
    }

    updateHUD({
      score: this.score,
      highScore: Math.max(this.highScore, this.score),
      lives: this.lives,
      level: this.level,
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.ctx);
    this.bullet.draw(this.ctx);
    this.enemies.forEach((e) => e.draw(this.ctx));
  }

  gameLoop() {
    this.update();
    this.draw();
    if (!this.isPaused && !this.gameOver) {
      requestAnimationFrame(this.gameLoop);
    }
  }

  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  endGame() {
    this.gameOver = true;
    this.highScore = Math.max(this.highScore, this.score);
    localStorage.setItem('highScore', this.highScore);
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
    showOverlay('gameOverOverlay');
    saveScore('Player', this.score);
    showLeaderboard();
  }
}

