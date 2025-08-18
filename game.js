import Player from './player.js';
import Bullet from './bullet.js';
import Enemy from './enemy.js';
import PowerUp, { POWERUP_TYPES } from './powerup.js';

// Core game logic controlling entities and rendering
export default class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.context = this.canvas.getContext('2d');

    // Dimensions
    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

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
    this.defaultBulletSpeed = this.bullet.speed;

    // Enemy setup
    this.enemies = [];
    this.enemyRows = 5;
    this.enemyCols = 10;
    this.enemyWidth = 30;
    this.enemyHeight = 30;
    this.enemyPadding = 10;
    this.enemyOffsetTop = 50;
    this.enemyOffsetLeft = 50;
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.spawnEnemies();

    // Enemy bullets
    this.enemyBullets = [];
    this.enemyBulletSpeed = 3;

    // Power-ups
    this.powerUps = [];
    this.activePowerUps = [];

    // Game state
    this.score = 0;
    this.gameOver = false;

    // HUD element for active power ups
    this.powerUpDisplay = document.getElementById('powerUpDisplay');

    // Input handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSpace = this.handleSpace.bind(this);

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('keydown', this.handleSpace);
  }

  spawnEnemies() {
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

  handleKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      this.player.moveLeft();
    } else if (event.key === 'ArrowRight') {
      this.player.moveRight();
    }
  }

  handleKeyUp(event) {
    if (event.key === 'ArrowLeft') {
      this.player.stopLeft();
    } else if (event.key === 'ArrowRight') {
      this.player.stopRight();
    }
  }

  handleSpace(event) {
    if (event.code === 'Space') {
      if (!this.bullet.isFired) {
        this.bullet.fire(
          this.player.x + this.player.width / 2,
          this.player.y
        );
      }
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

  spawnPowerUp(x, y) {
    const types = Object.values(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerUps.push(new PowerUp(x, y, type));
  }

  applyPowerUp(powerUp) {
    if (powerUp.type === POWERUP_TYPES.RAPID_FIRE) {
      this.bullet.speed *= 2;
      const expires = Date.now() + 5000;
      this.activePowerUps.push({
        label: 'Rapid Fire',
        expires,
        onExpire: () => (this.bullet.speed = this.defaultBulletSpeed),
      });
    } else if (powerUp.type === POWERUP_TYPES.SHIELD) {
      this.player.shield = true;
      const expires = Date.now() + 5000;
      this.activePowerUps.push({
        label: 'Shield',
        expires,
        onExpire: () => (this.player.shield = false),
      });
    }
    this.updatePowerUpHUD();
  }

  updatePowerUps() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.update();
      if (p.y > this.gameHeight) {
        this.powerUps.splice(i, 1);
        continue;
      }
      if (this.checkCollision(this.player, p)) {
        this.applyPowerUp(p);
        this.powerUps.splice(i, 1);
      }
    }
  }

  updateActivePowerUps() {
    const now = Date.now();
    this.activePowerUps = this.activePowerUps.filter((p) => {
      if (now >= p.expires) {
        if (p.onExpire) p.onExpire();
        return false;
      }
      return true;
    });
  }

  updatePowerUpHUD() {
    if (!this.powerUpDisplay) return;
    const now = Date.now();
    const text = this.activePowerUps
      .map((p) => `${p.label} ${Math.ceil((p.expires - now) / 1000)}s`)
      .join(', ');
    this.powerUpDisplay.textContent = text;
  }

  updateEnemyBullets() {
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      b.y += this.enemyBulletSpeed;
      if (this.checkCollision(b, this.player)) {
        this.enemyBullets.splice(i, 1);
        if (!this.player.shield) {
          this.gameOver = true;
        }
      } else if (b.y > this.gameHeight) {
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  updateEnemies() {
    let wallHit = false;
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      enemy.update(this.enemyDirection, this.enemySpeed);

      if (enemy.x <= 0 || enemy.x + enemy.width >= this.gameWidth) {
        wallHit = true;
      }

      if (
        this.bullet.isFired &&
        this.checkCollision(this.bullet, enemy) &&
        enemy.isAlive
      ) {
        enemy.isAlive = false;
        this.bullet.isFired = false;
        this.score++;
        if (Math.random() < 0.2) {
          this.spawnPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        }
      }

      if (Math.random() < 0.002) {
        this.enemyBullets.push({
          x: enemy.x + enemy.width / 2 - 2,
          y: enemy.y + enemy.height,
          width: 4,
          height: 10,
        });
      }
    }

    if (wallHit) {
      this.enemyDirection *= -1;
      this.enemies.forEach((enemy) => enemy.moveDown(enemy.height));
    }
  }

  update() {
    if (this.gameOver) return;

    this.player.update(this.gameWidth);
    this.bullet.update();
    this.updateEnemies();
    this.updateEnemyBullets();
    this.updatePowerUps();
    this.updateActivePowerUps();
    this.updatePowerUpHUD();
  }

  draw() {
    this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);

    this.player.draw(this.context);
    this.bullet.draw(this.context);
    this.enemies.forEach((e) => e.draw(this.context));

    // Enemy bullets
    this.context.fillStyle = '#ffff00';
    this.enemyBullets.forEach((b) => {
      this.context.fillRect(b.x, b.y, b.width, b.height);
    });

    // Power-ups
    this.powerUps.forEach((p) => p.draw(this.context));

    // Score
    this.context.fillStyle = '#ffffff';
    this.context.font = '20px Arial';
    this.context.fillText('Score: ' + this.score, 10, 30);

    if (this.gameOver) {
      this.context.fillStyle = '#ff0000';
      this.context.font = '40px Arial';
      const text = 'Game Over';
      const width = this.context.measureText(text).width;
      this.context.fillText(text, this.gameWidth / 2 - width / 2, this.gameHeight / 2);
    }
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  start() {
    this.gameLoop();
  }
}

