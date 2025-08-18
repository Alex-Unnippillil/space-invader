import Player from './player.js';
import Bullet from './bullet.js';
import Enemy from './enemy.js';

=======

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

=======
export function updateLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;
  list.innerHTML = '';
  const data = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  data.slice(0, 5).forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}

export function showLeaderboard() {
  updateLeaderboard();
  const overlay = document.getElementById('leaderboardOverlay');
  if (overlay) {
    overlay.classList.add('show');
  }
}

export function hideLeaderboard() {
  const overlay = document.getElementById('leaderboardOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
}

export default class Game {
  constructor() {
    // Canvas and background starfield
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.bgCanvas = document.getElementById('bgCanvas');
    this.starfield = new Starfield(this.bgCanvas);

    // Handle initial sizing
    this.handleResize();

    // Colors from CSS variables with fallbacks
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
import { updateHUD, saveScore, showLeaderboard } from './hud.js';
import Starfield from './starfield.js';



export default class Game {
  constructor() {
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
    this.enemyRowCount = 5;
    this.enemyColumnCount = 10;
    this.enemyPadding = 10;
    this.enemyOffsetTop = 50;
    this.enemyOffsetLeft = 50;


=======

    this.enemyColumns = 10;
    this.baseEnemyRows = 5;
    this.gameOverText = 'Game Over';
    this.scoreText = 'Score: ';

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
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.spawnEnemies();

    // Game state
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore'), 10) || 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.gameWon = false;

    // Input handlers
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
    this.gameLoop();
  }
  reset() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
=======
  spawnEnemies() {
    for (let row = 0; row < this.enemyRowCount; row++) {
      for (let col = 0; col < this.enemyColumnCount; col++) {
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

// Game initialization
function init() {
  // Set up the canvas and rendering context
  const canvas = document.getElementById("gameCanvas");
  const context = canvas.getContext("2d");
  const bgCanvas = document.getElementById("bgCanvas");
  const starfield = new Starfield(bgCanvas);

  const styles = getComputedStyle(document.documentElement);
  const COLOR_PRIMARY = styles.getPropertyValue("--color-primary").trim();
  const COLOR_ACCENT = styles.getPropertyValue("--color-accent").trim();
  const COLOR_BACKGROUND = styles
    .getPropertyValue("--color-background")
  .trim();

  // Set canvas size to match the window
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

=======
  const pauseOverlay = document.getElementById("pauseOverlay");
=======

  // Define game constants
  let gameWidth = canvas.width;
  let gameHeight = canvas.height;
  const playerWidth = 40;
  const playerHeight = 30;
  const playerSpeed = 5;
  const bulletWidth = 5;
  const bulletHeight = 15;
  const bulletSpeed = 7;
  const enemyWidth = 30;
  const enemyHeight = 30;
  const baseEnemyRowCount = 5;
  const enemyColumnCount = 10;
  const enemyPadding = 10;
  const enemyOffsetTop = 50;
  const enemyOffsetLeft = 50;
  const gameOverText = "Game Over";

  // Player object
    const player = {
      x: gameWidth / 2 - playerWidth / 2,
      y: gameHeight - playerHeight - 10,
      width: playerWidth,
      height: playerHeight,
      color: COLOR_PRIMARY,
      isMovingLeft: false,
      isMovingRight: false
    };
  const highScoreText = "High Score: ";
  const livesText = "Lives: ";



  const player = {
    x: gameWidth / 2 - playerWidth / 2,
    y: gameHeight - playerHeight - 10,
    width: playerWidth,
    height: playerHeight,
    color: "#00ff00",
    isMovingLeft: false,
    isMovingRight: false,
    lives: 3
  };

  // Bullet object
    const bullet = {
      x: 0,
      y: 0,
      width: bulletWidth,
      height: bulletHeight,
      color: COLOR_ACCENT,
      isFired: false
    };

  // Enemy bullets
  const enemyBullets = [];
  const enemyBulletSpeed = 3;

  // Active particle effects
  const particles = [];

  // Enemy objects
  const enemies = [];
  const enemySpeed = 1; // Speed of enemy movement
  let enemyDirection = 1; // Direction of enemy movement
  let enemyMoveDown = false; // Flag to indicate whether enemies should move down

  for (let row = 0; row < enemyRowCount; row++) {
    for (let col = 0; col < enemyColumnCount; col++) {
      const enemy = {
        x: col * (enemyWidth + enemyPadding) + enemyOffsetLeft,
        y: row * (enemyHeight + enemyPadding) + enemyOffsetTop,
        width: enemyWidth,
        height: enemyHeight,
          color: COLOR_ACCENT,
        isAlive: true
      };
      enemies.push(enemy);

  const player = {
    x: gameWidth / 2 - playerWidth / 2,
    y: gameHeight - playerHeight - 10,
    width: playerWidth,
    height: playerHeight,
    color: "#00ff00",
    isMovingLeft: false,
    isMovingRight: false
  };

  // Bullet object
  const bullet = {
    x: 0,
    y: 0,
    width: bulletWidth,
    height: bulletHeight,
    color: "#ff0000",
    isFired: false
  };

  // Enemy objects
  const enemies = [];
  let enemySpeed = 1; // Speed of enemy movement
  let enemyDirection = 1; // Direction of enemy movement
  let enemyMoveDown = false; // Flag to indicate whether enemies should move down

  function spawnEnemies(level) {
    enemySpeed = 1 + (level - 1) * 0.5;
    enemyDirection = 1;
    enemies.length = 0;
    const rows = baseEnemyRowCount + level - 1;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < enemyColumnCount; col++) {
        const enemy = {
          x: col * (enemyWidth + enemyPadding) + enemyOffsetLeft,
          y: row * (enemyHeight + enemyPadding) + enemyOffsetTop,
          width: enemyWidth,
          height: enemyHeight,
          color: "#00ffff",
          isAlive: true
        };
        enemies.push(enemy);

    this.enemies = [];
    this.enemyDirection = 1;
    this.enemySpeed = 1;
    this.bullet.isFired = false;
    this.spawnEnemies();
    this.score = 0;
    this.gameOver = false;

    this.gameWon = false;
    updateHUD({
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level
    });
=======

    // HUD elements
    this.scoreEl = document.getElementById('score');
    this.highScoreEl = document.getElementById('highScore');
    this.livesEl = document.getElementById('lives');
    this.levelEl = document.getElementById('level');

    // Overlays
    this.startOverlay = document.getElementById('startOverlay');
    this.gameOverOverlay = document.getElementById('gameOverOverlay');
    this.pauseOverlay = document.getElementById('pauseOverlay');

    // Method bindings
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

  }

  spawnEnemies() {
    for (let row = 0; row < this.enemyRowCount; row++) {
      for (let col = 0; col < this.enemyColumnCount; col++) {
        const x = col * (this.enemyWidth + this.enemyPadding) + this.enemyOffsetLeft;
        const y = row * (this.enemyHeight + this.enemyPadding) + this.enemyOffsetTop;
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
    } else if (event.key === ' ' || event.key === 'Spacebar') {
      if (!this.bullet.isFired) {
        const startX = this.player.x + this.player.width / 2;
        const startY = this.player.y;
        this.bullet.fire(startX, startY);

=======

  // Game variables
  let gameOver = false;
  let score = 0;
  let highScore = 0;
  let lives = 3;
  let level = 1;

  window.gameState = { score, highScore, lives, level };

  let highScore = parseInt(localStorage.getItem("highScore"), 10) || 0;

  start() {
    this.spawnEnemies();
    this.updateHUD();
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('keydown', this.handlePause);
    this.startOverlay?.classList.remove('show');
    this.loop();
  }

  reset() {
    window.location.reload();
  }

  handlePause(e) {
    if (e.key === 'p' || e.key === 'P') {
      this.isPaused = !this.isPaused;
      if (this.pauseOverlay) {
        this.pauseOverlay.style.display = this.isPaused ? 'flex' : 'none';

        
      }
    }
  }

  handleKeyUp(event) {
    if (event.key === 'ArrowLeft') {
      this.player.stopLeft();
    } else if (event.key === 'ArrowRight') {
      this.player.stopRight();
    }
  }

  update() {
    if (this.starfield) this.starfield.update();
    this.player.update(this.gameWidth);
    this.bullet.update();

    let moveDown = false;
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (enemy.x <= 0 || enemy.x + enemy.width >= this.gameWidth) {
        moveDown = true;
      }
    }
    if (moveDown) {
      this.enemyDirection *= -1;
      for (const enemy of this.enemies) {
        enemy.moveDown(this.enemyHeight);
      }
    }

    if (this.bullet.isFired) {
      for (const enemy of this.enemies) {
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
    if (this.starfield) this.starfield.draw();
    this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.player.draw(this.context);
    this.bullet.draw(this.context);
    for (const enemy of this.enemies) {
      enemy.draw(this.context);
    }
  }

  gameLoop() {
    this.update();
    this.draw();
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
=======
    if (!this.gameOver) {
      requestAnimationFrame(() => this.gameLoop());
    } else {
      const overlayId = this.gameWon ? 'winOverlay' : 'gameOverOverlay';
      showOverlay(overlayId);
      saveScore('Player', this.score);

      showLeaderboard();
    }
=======
      updateLeaderboard();
    }
  }

  emitPlayerParticles() {
    const color = '0,255,0';
    for (let i = 0; i < 3; i++) {
      this.particles.push(
        new Particle(
          this.player.x + this.player.width / 2,
          this.player.y + this.player.height,
          (Math.random() - 0.5) * 2,
          Math.random() * 2 + 1,
          30,
          color
        )
      );
    }
  }

  emitBulletParticles() {
    const color = '255,0,0';
    for (let i = 0; i < 3; i++) {
      this.particles.push(
        new Particle(
          this.bullet.x + this.bullet.width / 2,
          this.bullet.y + this.bullet.height,
          (Math.random() - 0.5) * 2,
          (Math.random() + 0.5) * 2,
          30,
          color
        )
      );
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (!p.isAlive()) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateEnemies() {
    let hitEdge = false;
    this.enemies.forEach((enemy) => {
      enemy.update(this.enemyDirection, this.enemySpeed);
      if (enemy.x <= 0 || enemy.x + enemy.width >= this.gameWidth) {
        hitEdge = true;
      }
    });
    if (hitEdge) {
      this.enemyDirection *= -1;
      this.enemies.forEach((enemy) => enemy.moveDown(this.enemyHeight / 2));
    }

    if (Math.random() < 0.02) {
      const shooters = this.enemies.filter((e) => e.isAlive);
      if (shooters.length) {
        const shooter = shooters[Math.floor(Math.random() * shooters.length)];
        this.enemyBullets.push({
          x: shooter.x + shooter.width / 2 - 2,
          y: shooter.y + shooter.height,
          width: 4,
          height: 10,
          color: '#ffffff'
        });
      }
    }

    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      b.y += this.enemyBulletSpeed;
      if (this.checkCollision(b, this.player)) {
        this.enemyBullets.splice(i, 1);
        this.lives--;
        this.updateHUD();
        if (this.lives <= 0) this.endGame();
      } else if (b.y > this.gameHeight) {
        this.enemyBullets.splice(i, 1);
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

  endGame() {
    this.gameOver = true;
    this.highScore = Math.max(this.highScore, this.score);
    localStorage.setItem('highScore', this.highScore);
    if (this.gameOverOverlay) this.gameOverOverlay.classList.add('show');
  }

  update() {
    this.starfield.update();
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
      });
    }

    this.enemies.forEach((enemy) => {
      if (enemy.isAlive && enemy.y + enemy.height >= this.player.y) {
        this.endGame();
      }
    });

    if (this.enemies.every((e) => !e.isAlive)) {
      this.level++;
      this.spawnEnemies();
      this.updateHUD();
    }

    this.updateEnemies();
    this.updateParticles();
  }

  draw() {
    this.starfield.draw();
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    this.particles.forEach((p) => p.draw(this.ctx));
    this.ctx.restore();


    this.player.draw(this.ctx);
    this.bullet.draw(this.ctx);
    // Request next animation frame
    updateHUD({ score, highScore, lives, level });
    requestAnimationFrame(gameLoop);
  start() {
    this.gameLoop();

  }
}

let currentGame;


=======
    this.enemyBullets.forEach((b) => {
      this.ctx.fillStyle = b.color;
      this.ctx.fillRect(b.x, b.y, b.width, b.height);
    });


    this.enemies.forEach((enemy) => enemy.draw(this.ctx));
  }
  // Start the game loop
  updateHUD({ score, highScore, lives, level });
  gameLoop();
}


function startGame() {
  hideOverlay('startOverlay');
  hideOverlay('gameOverOverlay');
  hideOverlay('winOverlay');
  init();
}

function resetGame() {
  startGame();
}
=======
  hideLeaderboard();
  if (!currentGame) {
    currentGame = new Game();
  } else {
    currentGame.reset();
  }
  currentGame.start();
}


function resetGame() {
  startGame();
}

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const playAgainButton = document.getElementById('playAgainButton');
  if (startButton) startButton.addEventListener('click', startGame);
  if (restartButton) restartButton.addEventListener('click', resetGame);
  if (playAgainButton) playAgainButton.addEventListener('click', resetGame);
});

=======


  loop() {
    if (!this.isPaused && !this.gameOver) {
      this.update();
      this.draw();
    }
    requestAnimationFrame(() => this.loop());
  }
}


=======
// Attach button handlers after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startButton')?.addEventListener('click', startGame);
  document.getElementById('restartButton')?.addEventListener('click', resetGame);
});
=======


=======
// Attach button handlers after page load
window.onload = function () {
  document
    .getElementById("startButton")
    .addEventListener("click", startGame);
  document
    .getElementById("restartButton")
    .addEventListener("click", resetGame);
};


