import Player from './player.js';
import Bullet from './bullet.js';
import Enemy from './enemy.js';

export default class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.context = this.canvas.getContext('2d');

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

    // Game variables
    this.gameOver = false;
    this.score = 0;

    // Event listeners
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSpacebar = this.handleSpacebar.bind(this);

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('keydown', this.handleSpacebar);
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

  handleSpacebar(event) {
    if (event.key === ' ' && !this.bullet.isFired) {
      this.bullet.fire(
        this.player.x + this.player.width / 2,
        this.player.y
      );
    }
  }

  checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  playSound(soundSrc) {
    const sound = new Audio(soundSrc);
    sound.play();
  }

  updateEnemies() {
    let wallHit = false;
    let moveEnemiesDown = false;

    this.enemies.forEach((enemy) => {
      if (enemy.isAlive) {
        enemy.update(this.enemyDirection, this.enemySpeed);

        if (this.checkCollision(this.player, enemy)) {
          this.gameOver = true;
        }

        if (this.bullet.isFired && this.checkCollision(this.bullet, enemy)) {
          enemy.isAlive = false;
          this.bullet.isFired = false;
          this.score++;
          this.playSound('explosion.wav');
        }

        if (enemy.x <= 0 || enemy.x + enemy.width >= this.gameWidth) {
          wallHit = true;
        }

        if (enemy.y + enemy.height >= this.gameHeight) {
          moveEnemiesDown = true;
        }
      }
    });

    if (wallHit) {
      this.enemyDirection *= -1;
      this.enemies.forEach((enemy) => enemy.moveDown(enemy.height));
    }

    if (moveEnemiesDown) {
      this.enemies.forEach((enemy) => enemy.moveDown(enemy.height));
    }
  }

  update() {
    if (!this.gameOver) {
      this.player.update(this.gameWidth);
      this.bullet.update();
      this.updateEnemies();
    }
  }

  draw() {
    this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);

    this.player.draw(this.context);
    this.bullet.draw(this.context);
    this.enemies.forEach((enemy) => enemy.draw(this.context));

    this.context.fillStyle = '#ffffff';
    this.context.font = '20px Arial';
    this.context.fillText(this.scoreText + this.score, 10, 30);

    if (this.gameOver) {
      this.context.fillStyle = '#ff0000';
      this.context.font = '50px Arial';
      const gameOverTextWidth = this.context.measureText(this.gameOverText).width;
      if (this.score >= 50) {
        const congratulatoryText = 'Congratulations!';
        const congratulatoryTextWidth = this.context.measureText(
          congratulatoryText
        ).width;
        this.context.fillText(
          congratulatoryText,
          this.gameWidth / 2 - congratulatoryTextWidth / 2,
          this.gameHeight / 2 - 50
        );
        this.context.fillText(
          this.gameOverText,
          this.gameWidth / 2 - gameOverTextWidth / 2,
          this.gameHeight / 2 + 50
        );
      } else {
        this.context.fillText(
          this.gameOverText,
          this.gameWidth / 2 - gameOverTextWidth / 2,
          this.gameHeight / 2
        );
      }
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
