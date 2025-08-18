// Game initialization
function init() {
  // Set up the canvas and rendering context
  const canvas = document.getElementById("gameCanvas");
  const context = canvas.getContext("2d");
  const pauseOverlay = document.getElementById("pauseOverlay");

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

  // Event listeners for player controls
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  document.addEventListener("keydown", handleSpacebar);
  document.addEventListener("keydown", handlePause);

  function handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      player.isMovingLeft = true;
    } else if (event.key === "ArrowRight") {
      player.isMovingRight = true;
    }
  }

  function handleKeyUp(event) {
    if (event.key === "ArrowLeft") {
      player.isMovingLeft = false;
    } else if (event.key === "ArrowRight") {
      player.isMovingRight = false;
    }
  }

  function handleSpacebar(event) {
    if (event.key === " ") {
      if (!bullet.isFired) {
        bullet.isFired = true;
        bullet.x = player.x + player.width / 2 - bullet.width / 2;
        bullet.y = player.y - bullet.height;
      }
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
    if (!gameOver) {
      if (player.isMovingLeft) {
        player.x -= playerSpeed;
      } else if (player.isMovingRight) {
        player.x += playerSpeed;
      }

      if (bullet.isFired) {
        bullet.y -= bulletSpeed;
        if (bullet.y < 0) {
          bullet.isFired = false;
        }
      }

      updateEnemies();
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

    // Draw game over or congratulatory message
    if (gameOver) {
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

// Start the game after the page has loaded
window.onload = function () {
  init();
};

