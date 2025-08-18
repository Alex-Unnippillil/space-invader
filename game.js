import Player from './player.js';
import Bullet from './bullet.js';
import Enemy from './enemy.js';
import Starfield from './starfield.js';

// Particle class for thruster and bullet trails
class Particle {
  constructor(x, y, vx, vy, lifespan, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.lifespan = lifespan;
    this.remaining = lifespan;
    this.color = color; // string in the form "r,g,b"
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.remaining -= 1;
  }

  draw(ctx) {
    const alpha = this.remaining / this.lifespan;
    ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
    ctx.fillRect(this.x, this.y, 2, 2);
  }

  isAlive() {
    return this.remaining > 0;
  }
}

export default class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    const bgCanvas = document.getElementById('bgCanvas');
    this.starfield = bgCanvas ? new Starfield(bgCanvas) : null;

    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

    // HUD elements
    this.scoreElement = document.getElementById('score');
    this.highScoreElement = document.getElementById('highScore');
    this.livesElement = document.getElementById('lives');
    this.levelElement = document.getElementById('level');

    this.highScore = parseInt(localStorage.getItem('highScore') || '0', 10);

    this.loop = this.loop.bind(this);
    this.attachEventHandlers();
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.enemyDirection = 1;
    this.enemySpeed = 1;

    this.player = new Player(
      this.gameWidth / 2 - 20,
      this.gameHeight - 40,
      40,
      30,
      5,
      '#0f0'
    );

    this.bullet = new Bullet(5, 15, 7, '#f00');
    this.enemies = [];
    this.particles = [];
    this.spawnEnemies();
    this.updateHUD();
  }

  attachEventHandlers() {
    window.addEventListener('keydown', (e) => {
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
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft') this.player.stopLeft();
      if (e.code === 'ArrowRight') this.player.stopRight();
    });
  }

  spawnEnemies() {
    const rows = 5;
    const cols = 10;
    const padding = 10;
    const offsetTop = 50;
    const offsetLeft = 50;

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = offsetLeft + c * (30 + padding);
        const y = offsetTop + r * (30 + padding);
        this.enemies.push(new Enemy(x, y, 30, 30, '#ff0'));
      }
    }
  }

  start() {
    this.running = true;
    requestAnimationFrame(this.loop);
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }

  update() {
    if (this.starfield) this.starfield.update();
    this.player.update(this.gameWidth);
    this.bullet.update();

    // Bullet trail particles
    if (this.bullet.isFired) {
      this.particles.push(
        new Particle(
          this.bullet.x + this.bullet.width / 2,
          this.bullet.y + this.bullet.height,
          0,
          1,
          30,
          '255,0,0'
        )
      );
    }

    // Update particles
    this.particles.forEach((p) => p.update());
    this.particles = this.particles.filter((p) => p.isAlive());

    // Update enemies
    let changeDir = false;
    this.enemies.forEach((enemy) => {
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (enemy.x + enemy.width > this.gameWidth || enemy.x < 0) {
        changeDir = true;
      }
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
        this.updateHUD();
      }
    });
    if (changeDir) {
      this.enemyDirection *= -1;
      this.enemies.forEach((enemy) => enemy.moveDown(20));
    }
    this.enemies = this.enemies.filter((e) => e.isAlive);

    if (this.enemies.length === 0) {
      this.level += 1;
      this.enemySpeed += 0.5;
      this.spawnEnemies();
      this.updateHUD();
    }
  }

  draw() {
    if (this.starfield) this.starfield.draw();
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.ctx);
    this.bullet.draw(this.ctx);
    this.enemies.forEach((enemy) => enemy.draw(this.ctx));
    this.particles.forEach((p) => p.draw(this.ctx));
  }

  updateHUD() {
    if (this.scoreElement) this.scoreElement.textContent = this.score;
    this.highScore = Math.max(this.highScore, this.score);
    if (this.highScoreElement) {
      this.highScoreElement.textContent = this.highScore;
    }
    if (this.livesElement) this.livesElement.textContent = this.lives;
    if (this.levelElement) this.levelElement.textContent = this.level;
    localStorage.setItem('highScore', this.highScore);
  }
}

