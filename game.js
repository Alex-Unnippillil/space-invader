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
  const gameWidth = canvas.width;
  const gameHeight = canvas.height;
  const playerWidth = 40;
  const playerHeight = 30;
  const playerSpeed = 5;
  const bulletWidth = 5;
  const bulletHeight = 15;
  const bulletSpeed = 7;
  const enemyWidth = 30;
  const enemyHeight = 30;
  const enemyRowCount = 5;
  const enemyColumnCount = 10;
  const enemyPadding = 10;
  const enemyOffsetTop = 50;
  const enemyOffsetLeft = 50;
  const gameOverText = "Game Over";
  const scoreText = "Score: ";

  // Player object
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
    }
  }

  // Game variables
  let gameOver = false;
  let score = 0;
  let isPaused = false;
=======

  // Event listeners for player controls
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  document.addEventListener("keydown", handleSpacebar);
  document.addEventListener("keydown", handlePause);
=======


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

  function handleKeyUp(event) {
    if (event.key === "ArrowLeft") {
      player.isMovingLeft = false;
    } else if (event.key === "ArrowRight") {
      player.isMovingRight = false;
    }
  }

  function handlePause(event) {
    if (event.key === "p" || event.key === "P") {
      isPaused = !isPaused;
      pauseOverlay.style.display = isPaused ? "flex" : "none";
    }
  }

  // Check collision between two objects
  function checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  // Play sound effect
  function playSound(soundSrc) {
    const sound = new Audio(soundSrc);
    sound.play();
  }

  // Update enemy positions and check collision with player and bullet
  function updateEnemies() {
    let wallHit = false;
    let moveEnemiesDown = false;

    enemies.forEach((enemy) => {
      if (enemy.isAlive) {
        enemy.x += enemyDirection * enemySpeed;

        // Check collision with player
        if (checkCollision(player, enemy)) {
          gameOver = true;
        }

        // Check collision with bullet
        if (bullet.isFired && checkCollision(bullet, enemy)) {
          enemy.isAlive = false;
          bullet.isFired = false;
          score++;
          playSound("explosion.wav");
        }

        // Check if enemies hit the wall
        if (
          enemy.x <= 0 ||
          enemy.x + enemy.width >= gameWidth
        ) {
          wallHit = true;
        }

        // Check if enemies should move down
        if (enemy.y + enemy.height >= gameHeight) {
          moveEnemiesDown = true;
        }
      }
    });

    // Move enemies down if they hit the wall
    if (wallHit) {
      enemyDirection *= -1; // Reverse the direction
      enemies.forEach((enemy) => {
        enemy.y += enemy.height;
      });
    }

    // Move enemies down if any enemy reached the bottom
    if (moveEnemiesDown) {
      enemies.forEach((enemy) => {
        enemy.y += enemy.height;
      });
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

    // Clear the canvas
    context.clearRect(0, 0, gameWidth, gameHeight);

    // Draw player
    context.fillStyle = player.color;
    context.fillRect(player.x, player.y, player.width, player.height);

    // Draw bullet
    if (bullet.isFired) {
      context.fillStyle = bullet.color;
      context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

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
    context.fillText(scoreText + score, 10, 30);

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
        context.fillText(
          congratulatoryText,
          gameWidth / 2 - congratulatoryTextWidth / 2,
          gameHeight / 2 - 50
        );
        context.fillText(
          gameOverText,
          gameWidth / 2 - gameOverTextWidth / 2,
          gameHeight / 2 + 50
        );
      } else {
        context.fillText(
          gameOverText,
          gameWidth / 2 - gameOverTextWidth / 2,
          gameHeight / 2
        );
      }
    }

    // Request next animation frame
    requestAnimationFrame(gameLoop);
  }

  // Start the game loop
  gameLoop();
}

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

