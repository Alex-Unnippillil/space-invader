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
    this.enemyDirection = 1;
    this.enemySpeed = ENEMY_BASE_SPEED;

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore'), 10) || 0;
    this.lives = 3;
    this.level = 1;

    this.isPaused = false;
    this.gameOver = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

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
  }

  spawnEnemies() {
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
  }

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

    let hitEdge = false;
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
          updateHUD({
            score: this.score,
            highScore: this.highScore,
            lives: this.lives,
            level: this.level,
          });
        }
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

