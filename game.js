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
    this.ctx = this.canvas.getContext('2d');
    const bgCanvas = document.getElementById('bgCanvas');
    this.starfield = new Starfield(bgCanvas);

    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

    // Game stats
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
    this.lives = 3;
    this.level = 1;

    // Player and bullet
    this.player = new Player(
      this.gameWidth / 2 - 20,
      this.gameHeight - 40,
      40,
      30,
      5,
      '#00ff00'
    );
    this.bullet = new Bullet(5, 15, 7, '#ff0000');

    // Enemy settings
    this.enemyRows = 5;
    this.enemyColumns = 10;
    this.enemyWidth = 30;
    this.enemyHeight = 30;
    this.enemyPadding = 10;
    this.enemyOffsetTop = 50;
    this.enemyOffsetLeft = 50;
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.enemyDrop = 20;
    this.enemies = [];
    this.spawnEnemies();

    this.isRunning = false;

    // Bindings
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.gameLoop = this.gameLoop.bind(this);

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
  }

  // Start the game from scratch
  start() {
    this.reset();
  }

  // Reset game state and begin loop
  reset() {
    hideOverlay('startOverlay');
    hideOverlay('gameOverOverlay');
    hideOverlay('winOverlay');
    hideLeaderboard();

    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.enemies = [];
    this.spawnEnemies();
    this.bullet.isFired = false;

    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });

    this.isRunning = true;
    requestAnimationFrame(this.gameLoop);
  }

  handleKeyDown(e) {
    if (e.code === 'ArrowLeft') this.player.moveLeft();
    if (e.code === 'ArrowRight') this.player.moveRight();
    if (e.code === 'Space' || e.code === 'Enter') {
      if (!this.bullet.isFired) {
        this.bullet.fire(
          this.player.x + this.player.width / 2,
          this.player.y
        );
      }
    }
  }

  handleKeyUp(e) {
    if (e.code === 'ArrowLeft') this.player.stopLeft();
    if (e.code === 'ArrowRight') this.player.stopRight();
  }

  spawnEnemies() {
    for (let row = 0; row < this.enemyRows; row++) {
      for (let col = 0; col < this.enemyColumns; col++) {
        const x =
          this.enemyOffsetLeft + col * (this.enemyWidth + this.enemyPadding);
        const y =
          this.enemyOffsetTop + row * (this.enemyHeight + this.enemyPadding);
        this.enemies.push(
          new Enemy(x, y, this.enemyWidth, this.enemyHeight, '#ff0000')
        );
      }
    }
  }

  update() {
    this.starfield.update();
    this.player.update(this.gameWidth);
    this.bullet.update();

    // Bullet collisions
    if (this.bullet.isFired) {
      this.enemies.forEach((enemy) => {
        if (enemy.isAlive && this.checkCollision(this.bullet, enemy)) {
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
            level: this.level,
          });
        }
      });
    }

    // Enemy movement
    let hitEdge = false;
    this.enemies.forEach((enemy) => {
      if (!enemy.isAlive) return;
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (enemy.x + enemy.width > this.gameWidth || enemy.x < 0) {
        hitEdge = true;
      }
    });

    if (hitEdge) {
      this.enemyDirection *= -1;
      this.enemies.forEach((enemy) => {
        enemy.moveDown(this.enemyDrop);
        if (enemy.isAlive && enemy.y + enemy.height >= this.player.y) {
          this.endGame(false);
        }
      });
    }

    // Win condition
    if (this.enemies.every((e) => !e.isAlive)) {
      this.endGame(true);
    }
  }

  draw() {
    this.starfield.draw();
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.ctx);
    this.bullet.draw(this.ctx);
    this.enemies.forEach((enemy) => enemy.draw(this.ctx));
  }

  gameLoop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop);
  }

  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  endGame(win) {
    this.isRunning = false;
    const name = prompt('Enter your name') || 'Player';
    saveScore(name, this.score);
    showOverlay(win ? 'winOverlay' : 'gameOverOverlay');
  }
}

