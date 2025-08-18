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
    // Canvas and starfield
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    const bgCanvas = document.getElementById('bgCanvas');
    this.starfield = new Starfield(bgCanvas);

    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

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
    this.paused = false;

    this.spawnEnemies();
    hideOverlay('gameOverOverlay');
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level
    });
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
    }
  }

  update(delta) {
    this.starfield.update();

    if (this.paused || this.gameOver) return;

    if (this.player.isMovingLeft || this.player.isMovingRight) {
      this.emitPlayerParticles();
    }

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

