import Player from './player.js';
import Bullet from './bullet.js';
import Enemy from './enemy.js';
import Starfield from './starfield.js';
import { updateHUD, saveScore, showLeaderboard, hideLeaderboard } from './hud.js';

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

    this.player = new Player(
      this.gameWidth / 2 - 20,
      this.gameHeight - 40,
      40,
      30,
      5,
      '#00ff00'
    );
    this.bullet = new Bullet(5, 15, 7, '#ff0000');

    this.enemyRowCount = 5;
    this.enemyColumnCount = 10;
    this.enemyPadding = 10;
    this.enemyOffsetTop = 50;
    this.enemyOffsetLeft = 50;
    this.enemies = [];
    this.enemyDirection = 1;
    this.enemySpeed = 1;
    this.spawnEnemies();

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore'), 10) || 0;
    this.lives = 3;
    this.level = 1;

    this.gameLoop = this.gameLoop.bind(this);
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
    requestAnimationFrame(this.gameLoop);
  }

  reset() {
    this.enemies = [];
    this.spawnEnemies();
    this.score = 0;
    this.level = 1;
    this.bullet.isFired = false;
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
        const x = col * (30 + this.enemyPadding) + this.enemyOffsetLeft;
        const y = row * (30 + this.enemyPadding) + this.enemyOffsetTop;
        this.enemies.push(new Enemy(x, y, 30, 30, '#ff00ff'));
      }
    }
  }

  handleKeyDown(e) {
    if (e.code === 'ArrowLeft') this.player.moveLeft();
    if (e.code === 'ArrowRight') this.player.moveRight();
    if (e.code === 'Space') {
      if (!this.bullet.isFired)
        this.bullet.fire(
          this.player.x + this.player.width / 2,
          this.player.y
        );
    }
  }

  handleKeyUp(e) {
    if (e.code === 'ArrowLeft') this.player.stopLeft();
    if (e.code === 'ArrowRight') this.player.stopRight();
  }

  update() {
    this.starfield.update();
    this.player.update(this.gameWidth);
    this.bullet.update();

    let hitEdge = false;
    this.enemies.forEach((enemy) => {
      if (!enemy.isAlive) return;
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (
        (this.enemyDirection === 1 &&
          enemy.x + enemy.width >= this.gameWidth) ||
        (this.enemyDirection === -1 && enemy.x <= 0)
      ) {
        hitEdge = true;
      }
    });
    if (hitEdge) {
      this.enemyDirection *= -1;
      this.enemies.forEach((e) => e.moveDown(20));
    }

    if (this.bullet.isFired) {
      this.enemies.forEach((enemy) => {
        if (!enemy.isAlive) return;
        const hit =
          this.bullet.x < enemy.x + enemy.width &&
          this.bullet.x + this.bullet.width > enemy.x &&
          this.bullet.y < enemy.y + enemy.height &&
          this.bullet.y + this.bullet.height > enemy.y;
        if (hit) {
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
      });
    }
  }

  draw() {
    this.starfield.draw();
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.ctx);
    this.bullet.draw(this.ctx);
    this.enemies.forEach((e) => e.draw(this.ctx));
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop);
  }
}

export { updateHUD, saveScore, showLeaderboard, hideLeaderboard };
