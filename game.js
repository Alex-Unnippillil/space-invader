
let animationId;


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

function saveScore(name, score) {
  const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  data.push({ name, score });
  data.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(data.slice(0, 5)));
}

function updateLeaderboard() {
  const list = document.getElementById("leaderboardList");
  if (!list) return;
  list.innerHTML = "";
  const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  data.slice(0, 5).forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}

function showLeaderboard() {
  updateLeaderboard();
  document.getElementById("leaderboardOverlay").classList.remove("hidden");
}

function hideLeaderboard() {
  document.getElementById("leaderboardOverlay").classList.add("hidden");
}


// Game initialization
function init() {
  // Set up the canvas and rendering context
  const canvas = document.getElementById("gameCanvas");
  const context = canvas.getContext("2d");


  // Set canvas size to match the window
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
=======
  const pauseOverlay = document.getElementById("pauseOverlay");

  const canvasContainer = document.getElementById("canvas-container");
  const startScreen = document.getElementById("start-screen");
  const pauseScreen = document.getElementById("pause-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const upgradeScreen = document.getElementById("upgrade-screen");
  const startButton = document.getElementById("start-button");
  const resumeButton = document.getElementById("resume-button");
  const restartButton = document.getElementById("restart-button");
  const upgradeClose = document.getElementById("upgrade-close");

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
  const scoreText = "Score: ";

  const highScoreText = "High Score: ";
=======
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
    color: "#ff0000",
    isFired: false
  };

  // Enemy bullets
  const enemyBullets = [];
  const enemyBulletSpeed = 3;

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
        color: "#00ffff",
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
=======

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

  // Game variables
  let gameOver = false;
  let score = 0;
  let highScore = parseInt(localStorage.getItem("highScore"), 10) || 0;

  let level = 1;

  spawnEnemies(level);

  let isPaused = false;


  // Event listeners for player controls
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  document.addEventListener("keydown", handleSpacebar);

  window.addEventListener("resize", handleResize);
=======
  document.addEventListener("keydown", handlePause);



  startButton.addEventListener("click", startGame);
  resumeButton.addEventListener("click", resumeGame);
  restartButton.addEventListener("click", () => location.reload());
  upgradeClose.addEventListener("click", hideUpgrade);

  function startGame() {
    startScreen.classList.remove("active");
    canvasContainer.classList.add("active");
    gameState = "playing";
  }

  function pauseGame() {
    if (gameState === "playing") {
      gameState = "paused";
      pauseScreen.classList.add("active");
    }
  }

  function resumeGame() {
    if (gameState === "paused") {
      gameState = "playing";
      pauseScreen.classList.remove("active");
    }
  }

  function showUpgrade() {
    if (gameState === "playing") {
      gameState = "upgrade";
      upgradeScreen.classList.add("active");
      upgradeScreen.classList.add("slide");
    }
  }

  function hideUpgrade() {
    if (gameState === "upgrade") {
      gameState = "playing";
      upgradeScreen.classList.remove("active");
      upgradeScreen.classList.remove("slide");
    }
  }

  function showGameOver() {
    canvasContainer.classList.remove("active");
    gameState = "gameOver";
    gameOverScreen.classList.add("active");
  }

  function handleKeyDown(event) {
    if (gameState === "playing") {
      if (event.key === "ArrowLeft") {
        player.isMovingLeft = true;
      } else if (event.key === "ArrowRight") {
        player.isMovingRight = true;
      } else if (event.key === " " && !bullet.isFired) {
        bullet.isFired = true;
        bullet.x = player.x + player.width / 2 - bullet.width / 2;
        bullet.y = player.y - bullet.height;
      } else if (event.key === "p") {
        pauseGame();
      } else if (event.key === "u") {
        showUpgrade();
      }
    } else if (gameState === "paused" && event.key === "p") {
      resumeGame();
    } else if (gameState === "upgrade" && event.key === "u") {
      hideUpgrade();

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

  function handlePause(event) {
    if (event.key === "p" || event.key === "P") {
      isPaused = !isPaused;
      pauseOverlay.style.display = isPaused ? "flex" : "none";

    }
  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameWidth = canvas.width;
    gameHeight = canvas.height;
    player.y = gameHeight - player.height - 10;
    if (player.x + player.width > gameWidth) {
      player.x = gameWidth - player.width;
    }
  }

  // Check collision between two objects
  function checkCollision(obj1, obj2) {
=======
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

        // Randomly shoot bullets
        if (Math.random() < 0.002) {
          enemyBullets.push({
            x: enemy.x + enemy.width / 2 - bulletWidth / 2,
            y: enemy.y + enemy.height,
            width: bulletWidth,
            height: bulletHeight,
            color: "#ffff00",
          });
        }

        // Check collision with player
        if (checkCollision(player, enemy)) {
          gameOver = true;

        if (this.checkCollision(this.player, enemy)) {
          this.gameOver = true;

        }

        if (this.bullet.isFired && this.checkCollision(this.bullet, enemy)) {
          enemy.isAlive = false;

          bullet.isFired = false;
          score++;
          if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
          }
          playSound("explosion.wav");

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
{
    if (!this.gameOver) {
      this.player.update(this.gameWidth);
      this.bullet.update();
      this.updateEnemies();
    }
  }

  // Game loop
  function gameLoop() {
    if (isPaused) {
      requestAnimationFrame(gameLoop);
      return;
    }

    // Update game state


        if (bullet.isFired) {
          bullet.y -= bulletSpeed;
          if (bullet.y < 0) {
            bullet.isFired = false;
          }
        }

        updateEnemies();
      } else if (!gameOverHandled) {
        gameOverHandled = true;
        setTimeout(() => {
          const name = prompt("Game over! Enter your name:");
          if (name) {
            saveScore(name, score);
          }
          showLeaderboard();
        }, 0);
      }


      updateEnemies();

      // Update enemy bullets
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eBullet = enemyBullets[i];
        eBullet.y += enemyBulletSpeed;
        if (checkCollision(eBullet, player)) {
          enemyBullets.splice(i, 1);
          player.lives--;
          if (player.lives <= 0) {
            gameOver = true;
          }
        } else if (eBullet.y > gameHeight) {
          enemyBullets.splice(i, 1);
        }

      if (enemies.every((enemy) => !enemy.isAlive)) {
        level++;
        spawnEnemies(level);

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


    // Draw enemy bullets
    enemyBullets.forEach((enemyBullet) => {
      context.fillStyle = enemyBullet.color;
      context.fillRect(
        enemyBullet.x,
        enemyBullet.y,
        enemyBullet.width,
        enemyBullet.height
      );
    });

    // Draw enemies
    enemies.forEach((enemy) => {
      if (enemy.isAlive) {
        // Draw enemy shape
        context.fillStyle = enemy.color;
        context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
    });

    // Draw score
    context.fillStyle = "#ffffff";
    context.font = "20px Arial";

    context.fillText(
      `${scoreText}${score} ${highScoreText}${highScore}`,
      10,
      30
    );

    context.fillText(scoreText + score, 10, 30);
    context.fillText(livesText + player.lives, 10, 55);

    if (this.gameOver) {
      this.context.fillStyle = '#ff0000';
      this.context.font = '50px Arial';
      const gameOverTextWidth = this.context.measureText(this.gameOverText).width;
      if (this.score >= 50) {
        const congratulatoryText = 'Congratulations!';
        const congratulatoryTextWidth = this.context.measureText(


    // Draw score and level
    context.fillStyle = "#ffffff";
    context.font = "20px Arial";
    context.fillText(`${scoreText}${score} Level: ${level}`, 10, 30);

    if (gameOver && gameState !== "gameOver") {
      showGameOver();
    }


    // Draw game over or congratulatory message
    if (gameState === "gameOver") {
      context.fillStyle = "#ff0000";
      context.font = "50px Arial";
      const gameOverTextWidth = context.measureText(gameOverText).width;
      if (score >= 50) {
        const congratulatoryText = "Congratulations!";
        const congratulatoryTextWidth = context.measureText(

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
      document.getElementById("gameOverOverlay").style.display = "flex";
      return;
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


function startGame() {
  document.getElementById("startOverlay").style.display = "none";
  document.getElementById("gameOverOverlay").style.display = "none";
  cancelAnimationFrame(animationId);
  init();
}

function resetGame() {
  document.getElementById("gameOverOverlay").style.display = "none";
  cancelAnimationFrame(animationId);
  init();
}

// Attach button handlers after page load
window.onload = function () {
  document
    .getElementById("startButton")
    .addEventListener("click", startGame);
  document
    .getElementById("restartButton")
    .addEventListener("click", resetGame);
=======
window.onload = function () {
  document.getElementById("startButton").addEventListener("click", () => {
    document.getElementById("startScreen").classList.add("hidden");
    init();
  });
  document
    .getElementById("leaderboardButton")
    .addEventListener("click", showLeaderboard);
  document
    .getElementById("closeLeaderboard")
    .addEventListener("click", hideLeaderboard);
  updateLeaderboard();

  
};

