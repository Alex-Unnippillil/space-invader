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

export default class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.context = this.canvas.getContext('2d');
    const bgCanvas = document.getElementById('bgCanvas');
    this.starfield = bgCanvas ? new Starfield(bgCanvas) : null;

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

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore') || '0', 10);
    this.lives = 3;
    this.level = 1;

    this.gameLoop = this.gameLoop.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.resetState();
  }

  resetState() {
    this.player.x = this.gameWidth / 2 - this.player.width / 2;
    this.player.y = this.gameHeight - this.player.height - 10;
    this.player.stopLeft();
    this.player.stopRight();
    this.bullet.isFired = false;
    this.enemies = [];
    this.enemyDirection = 1;
    this.enemySpeed = 1;

    for (let r = 0; r < this.enemyRowCount; r++) {
      for (let c = 0; c < this.enemyColumnCount; c++) {
        const x = c * (30 + this.enemyPadding) + this.enemyOffsetLeft;
        const y = r * (30 + this.enemyPadding) + this.enemyOffsetTop;
        this.enemies.push(new Enemy(x, y, 30, 30, '#00ffff'));
      }
    }

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

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    requestAnimationFrame(this.gameLoop);
  }

  reset() {
    hideOverlay('startOverlay');
    hideOverlay('gameOverOverlay');
    hideOverlay('pauseOverlay');
    hideLeaderboard();

    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.resetState();
    requestAnimationFrame(this.gameLoop);
  }

  handleKeyDown(e) {
    if (e.code === 'ArrowLeft') this.player.moveLeft();
    if (e.code === 'ArrowRight') this.player.moveRight();
    if (e.code === 'Space') {
      if (!this.bullet.isFired) {
        const startX = this.player.x + this.player.width / 2;
        const startY = this.player.y;
        this.bullet.fire(startX, startY);
      }
    }
  }

  handleKeyUp(e) {
    if (e.code === 'ArrowLeft') this.player.stopLeft();
    if (e.code === 'ArrowRight') this.player.stopRight();
  }

  update() {
    this.starfield?.update();
    this.player.update(this.gameWidth);
    this.bullet.update();

    let edge = false;
    this.enemies.forEach((enemy) => {
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (enemy.x < 0 || enemy.x + enemy.width > this.gameWidth) edge = true;
    });

    if (edge) {
      this.enemyDirection *= -1;
      this.enemies.forEach((enemy) => enemy.moveDown(20));
    }

    this.enemies.forEach((enemy) => {
      if (
        this.bullet.isFired &&
        enemy.isAlive &&
        this.bullet.x < enemy.x + enemy.width &&
        this.bullet.x + this.bullet.width > enemy.x &&
        this.bullet.y < enemy.y + enemy.height &&
        this.bullet.y + this.bullet.height > enemy.y
      ) {
        enemy.isAlive = false;
        this.bullet.isFired = false;
        this.score += 10;
      }
    });

    updateHUD({
      score: this.score,
      highScore: Math.max(this.highScore, this.score),
      lives: this.lives,
      level: this.level,
    });
  }

  draw() {
    this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.starfield?.draw();
    this.player.draw(this.context);
    this.bullet.draw(this.context);
    this.enemies.forEach((enemy) => enemy.draw(this.context));
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop);
  }
}

export { updateHUD, saveScore, showLeaderboard, hideLeaderboard };
