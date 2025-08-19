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
    this.canvas = document.getElementById('gameCanvas');
    this.context = this.canvas.getContext('2d');
    const bgCanvas = document.getElementById('bgCanvas');
    if (bgCanvas) this.starfield = new Starfield(bgCanvas);

    // Game constants
    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;
    this.playerWidth = 40;
    this.playerHeight = 30;
    this.playerSpeed = 5;
    this.bulletWidth = 5;
    this.bulletHeight = 15;
    this.bulletSpeed = 7;
    this.enemyWidth = 30;
    this.enemyHeight = 30;
    // Canvas and starfield
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    const bgCanvas = document.getElementById('bgCanvas');
    this.starfield = new Starfield(bgCanvas);

    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

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
    // Colors
    const styles = getComputedStyle(document.documentElement);
    this.primaryColor =
      styles.getPropertyValue('--color-primary').trim() || '#00ff00';
    this.accentColor =
      styles.getPropertyValue('--color-accent').trim() || '#ff0000';

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
    this.bullet = new Bullet(5, 15, 7, this.accentColor);

    // Enemy configuration
    this.enemyCols = 10;
    this.enemyRows = 5;
    this.enemyWidth = 30;
    this.enemyHeight = 30;
    this.enemyPadding = 10;
    this.enemyOffsetTop = 50;
    this.enemyOffsetLeft = 50;

    // Entities
    this.player = new Player(
      this.gameWidth / 2 - this.playerWidth / 2,
      this.gameHeight - this.playerHeight - 10,
      this.playerWidth,
      this.playerHeight,
      this.playerSpeed,
      '#00ff00'
    );
    this.bullet = new Bullet(
      this.bulletWidth,
      this.bulletHeight,
      this.bulletSpeed,
      '#ff0000'
    );

    this.enemies = [];
    this.spawnEnemies();
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.enemies = [];

    // Particles
    this.particles = [];

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore'), 10) || 0;
    this.lives = 3;
    this.level = 1;

    this.gameLoop = this.gameLoop.bind(this);
    this.isPaused = false;
    this.gameOver = false;
    this.gameWon = false;
    this.isPaused = false;
    this.pausePressed = false;

    // Overlays
    this.startOverlay = document.getElementById('startOverlay');
    this.gameOverOverlay = document.getElementById('gameOverOverlay');
    this.pauseOverlay = document.getElementById('pauseOverlay');

    // Bind handlers
    this.paused = false;
    this.lastTime = 0;

    // Input
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

  start() {
    hideOverlay('startOverlay');
    hideOverlay('gameOverOverlay');
    hideOverlay('pauseOverlay');
    hideLeaderboard();
    this.resetState();
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    this.gameLoop();
  }

  reset() {
    hideOverlay('startOverlay');
    hideOverlay('gameOverOverlay');
    hideOverlay('pauseOverlay');
    hideLeaderboard();
    this.resetState();
    this.gameLoop();
  }

  // Game variables
  let gameOver = false;
  let score = 0;
  let flashOpacity = 0;
  resetState() {
    this.player.x = this.gameWidth / 2 - this.playerWidth / 2;
    this.player.y = this.gameHeight - this.playerHeight - 10;
    this.player.stopLeft();
    this.player.stopRight();
    this.bullet.isFired = false;
    this.enemies = [];
    this.enemyDirection = 1;
    this.enemySpeed = 1;
    this.spawnEnemies();
    this.spawnEnemies();
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
    requestAnimationFrame(this.gameLoop);
  }

  reset() {
    this.enemies = [];
    this.spawnEnemies();
    this.score = 0;
    this.level = 1;
    this.bullet.isFired = false;

  reset() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.enemies = [];
    this.enemyDirection = 1;
    this.enemySpeed = ENEMY_BASE_SPEED;
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
    this.isPaused = false;
    this.paused = false;

    this.spawnEnemies();
    hideOverlay('gameOverOverlay');
 
  
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
  }

  spawnEnemies() {
    for (let row = 0; row < this.enemyRowCount; row++) {
      for (let col = 0; col < this.enemyColumnCount; col++) {
        const x = col * (this.enemyWidth + this.enemyPadding) + this.enemyOffsetLeft;
        const y = row * (this.enemyHeight + this.enemyPadding) + this.enemyOffsetTop;
        this.enemies.push(new Enemy(x, y, this.enemyWidth, this.enemyHeight, '#00ffff'));
        const x = col * (30 + this.enemyPadding) + this.enemyOffsetLeft;
        const y = row * (30 + this.enemyPadding) + this.enemyOffsetTop;
        this.enemies.push(new Enemy(x, y, 30, 30, '#ff00ff'));
        const x =
          col * (this.enemyWidth + this.enemyPadding) + this.enemyOffsetLeft;
        const y =
          row * (this.enemyHeight + this.enemyPadding) + this.enemyOffsetTop;
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLUMNS; col++) {
        const x = col * (ENEMY_WIDTH + ENEMY_PADDING) + ENEMY_OFFSET_LEFT;
        const y = row * (ENEMY_HEIGHT + ENEMY_PADDING) + ENEMY_OFFSET_TOP;
        this.enemies.push(
          new Enemy(x, y, ENEMY_WIDTH, ENEMY_HEIGHT, '#00ffff')
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

  handleResize() {
    this.gameWidth = window.innerWidth;
    this.gameHeight = window.innerHeight;
    this.canvas.width = this.gameWidth;
    this.canvas.height = this.gameHeight;
    if (this.bgCanvas) {
      this.bgCanvas.width = this.gameWidth;
      this.bgCanvas.height = this.gameHeight;
      if (this.starfield) {
        this.starfield.resize(this.gameWidth, this.gameHeight);
      }
    }
  }

  update() {
    this.starfield.update();
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
      }
    } else if (event.key === 'p' || event.key === 'P') {
      if (!this.pausePressed) {
        this.togglePause();
        this.pausePressed = true;
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

  // Shake the screen by translating the canvas
  function screenShake(intensity, duration) {
    const start = performance.now();
    const originalTransform = canvas.style.transform;
    function shake() {
      const elapsed = performance.now() - start;
      if (elapsed < duration) {
        const dx = (Math.random() - 0.5) * intensity * 2;
        const dy = (Math.random() - 0.5) * intensity * 2;
        canvas.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(shake);
      } else {
        canvas.style.transform = originalTransform;
      }
    }
    requestAnimationFrame(shake);
  }

  // Flash the screen with a white overlay
  function flashScreen(duration) {
    flashOpacity = 0.5;
    setTimeout(() => {
      flashOpacity = 0;
    }, duration);
  }

  // Update enemy positions and check collision with player and bullet
  function updateEnemies() {
    let wallHit = false;
    let moveEnemiesDown = false;
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

  handleKeyUp(event) {
    if (event.key === 'ArrowLeft') {
      this.player.stopLeft();
    } else if (event.key === 'ArrowRight') {
      this.player.stopRight();
    } else if (event.key === 'p' || event.key === 'P') {
      this.pausePressed = false;
    }
  }

        // Check collision with player
        if (checkCollision(player, enemy)) {
          gameOver = true;
          screenShake(10, 300);
          flashScreen(100);
        }

        // Check collision with bullet
        if (bullet.isFired && checkCollision(bullet, enemy)) {
          enemy.isAlive = false;
          bullet.isFired = false;
          score++;
          playSound("explosion.wav");
          screenShake(5, 300);
          flashScreen(50);
        }
  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.pauseOverlay) {
      this.pauseOverlay.classList.toggle('show', this.isPaused);
    }
    if (!this.isPaused) {
      this.gameLoop();
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
      this.enemies.forEach((e) => e.moveDown(this.enemyHeight));
    }

    if (this.bullet.isFired) {
      this.enemies.forEach((enemy) => {
        if (!enemy.isAlive) return;
        const hit =
        if (
          enemy.isAlive &&
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
          this.emitBulletParticles(
            this.bullet.x + this.bullet.width / 2,
            this.bullet.y
          );
        }
      });
      });
    }
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
    this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.context);
    this.bullet.draw(this.context);
    for (const enemy of this.enemies) {
      enemy.draw(this.context);
    }
  }

  gameLoop() {
    if (this.starfield) {
      this.starfield.update();
      this.starfield.draw();
    }
    if (this.isPaused) {
      requestAnimationFrame(() => this.gameLoop());
      return;
    }

    this.update();
    this.draw();

    if (this.gameOver) {
    if (!this.isPaused) {
      this.update();
      this.draw();
    }
    this.update();
    this.draw();
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });
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
    if (!this.gameOver) {
      requestAnimationFrame(() => this.gameLoop());
    } else {
      const overlayId = this.gameWon ? 'winOverlay' : 'gameOverOverlay';
      showOverlay(overlayId);
      saveScore('Player', this.score);
      showLeaderboard();
    } else {
      requestAnimationFrame(() => this.gameLoop());
    }
  }
}
  }
}

let currentGame;
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
  }

  endGame() {
    this.gameOver = true;
    this.highScore = Math.max(this.highScore, this.score);
    localStorage.setItem('highScore', this.highScore);
    if (this.gameOverOverlay) this.gameOverOverlay.classList.add('show');
  }

  update() {
    this.player.update(this.gameWidth);
    if (this.player.isMovingLeft || this.player.isMovingRight) {
      this.emitPlayerParticles();
    }
    this.bullet.update();
    if (this.bullet.isFired) {
      this.emitBulletParticles();
    }

    if (this.bullet.isFired) {
      this.enemies.forEach((enemy) => {
        if (enemy.isAlive && this.checkCollision(this.bullet, enemy)) {
          enemy.isAlive = false;
          this.bullet.isFired = false;
          this.score += 10;
          if (this.score > this.highScore) {
            this.highScore = this.score;
          }
          this.updateHUD();
        }
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

    // Draw flash overlay
    if (flashOpacity > 0) {
      context.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
      context.fillRect(0, 0, gameWidth, gameHeight);
    }

    // Request next animation frame
    requestAnimationFrame(gameLoop);

    this.enemies.forEach((e) => e.draw(this.ctx));
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop);
  }
}

export { updateHUD, saveScore, showLeaderboard, hideLeaderboard };
