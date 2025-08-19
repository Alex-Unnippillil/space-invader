import Player from './player.js';
import Bullet from './bullet.js';
import Enemy from './enemy.js';
import Starfield from './starfield.js';
import { updateHUD } from './hud.js';
import { initGameUI } from './ui.js';

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
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    const bgCanvas = document.getElementById('bgCanvas');
    this.starfield = bgCanvas ? new Starfield(bgCanvas) : null;

    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

    // Player
    this.player = new Player(
      this.gameWidth / 2 - 20,
      this.gameHeight - 40,
      40,
      30,
      5,
      '#00ff00'
    );

    // Bullet
    this.bullet = new Bullet(5, 15, 7, '#ff0000');

    // Enemy configuration
    this.enemyRows = 5;
    this.enemyCols = 10;
    this.enemyWidth = 30;
    this.enemyHeight = 30;
    this.enemyPadding = 10;
    this.enemyOffsetTop = 50;
    this.enemyOffsetLeft = 50;
    this.enemyDirection = 1;
    this.enemySpeed = 1;
    this.enemies = [];

    // Game state
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore'), 10) || 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;

    // Bindings
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.gameLoop = this.gameLoop.bind(this);

    this.spawnEnemies();
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
  }

  spawnEnemies() {
    this.enemies = [];
    for (let row = 0; row < this.enemyRows; row++) {
      for (let col = 0; col < this.enemyCols; col++) {
        const x =
          col * (this.enemyWidth + this.enemyPadding) + this.enemyOffsetLeft;
        const y =
          row * (this.enemyHeight + this.enemyPadding) + this.enemyOffsetTop;
        this.enemies.push(
          new Enemy(x, y, this.enemyWidth, this.enemyHeight, '#00ffff')
        );
      }
    }
  }

  start() {
    hideOverlay('startOverlay');
    hideOverlay('gameOverOverlay');
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    this.gameOver = false;
    this.gameLoop();
  }

  reset() {
    hideOverlay('gameOverOverlay');
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.bullet.isFired = false;
    this.player.x = this.gameWidth / 2 - this.player.width / 2;
    this.spawnEnemies();
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
    this.gameOver = false;
    this.gameLoop();
  }

  handleKeyDown(e) {
    if (e.code === 'ArrowLeft') this.player.moveLeft();
    if (e.code === 'ArrowRight') this.player.moveRight();
    if (e.code === 'Space' && !this.bullet.isFired) {
      this.bullet.fire(this.player.x + this.player.width / 2, this.player.y);
    }
  }

  handleKeyUp(e) {
    if (e.code === 'ArrowLeft') this.player.stopLeft();
    if (e.code === 'ArrowRight') this.player.stopRight();
  }

  update() {
    if (this.starfield) {
      this.starfield.update();
      this.starfield.draw();
    }

    this.player.update(this.gameWidth);
    this.bullet.update();

    let hitEdge = false;
    for (const enemy of this.enemies) {
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (enemy.x + enemy.width > this.gameWidth || enemy.x < 0) {
        hitEdge = true;
      }
    }
    if (hitEdge) {
      this.enemyDirection *= -1;
      this.enemies.forEach((e) => e.moveDown(this.enemyHeight));
    }

    for (const enemy of this.enemies) {
      if (
        enemy.isAlive &&
        this.bullet.isFired &&
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
          level: this.level,
        });
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
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.ctx);
    this.bullet.draw(this.ctx);
    for (const enemy of this.enemies) enemy.draw(this.ctx);
  }

  gameLoop() {
    if (this.gameOver) return;
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop);
  }
}

const game = new Game();
document.addEventListener('DOMContentLoaded', () => initGameUI(game));

