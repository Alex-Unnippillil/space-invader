// Game initialization
function init() {
  // Set up the canvas and rendering context
  const canvas = document.getElementById("gameCanvas");
  const context = canvas.getContext("2d");

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
    isMovingRight: false,
  };

  // Bullet state
  const bullets = [];
  let lastShotTime = 0;

  // Weapon state
  let currentWeapon = "single";
  const fireRates = { single: 500, spread: 500, rapid: 100, laser: 1000 };
  const weaponCosts = { spread: 50, rapid: 75, laser: 100 };
  const unlockedWeapons = {
    single: true,
    spread: false,
    rapid: false,
    laser: false,
  };

  // Enemy objects
  let enemies = [];
  const enemySpeed = 1; // Speed of enemy movement
  let enemyDirection = 1; // Direction of enemy movement

  // Game variables
  let gameOver = false;
  let gamePaused = false;
  let score = 0;

  // Upgrade screen elements
  const upgradeScreen = document.getElementById("upgradeScreen");
  const currentScoreEl = document.getElementById("currentScore");
  document.querySelectorAll(".weapon-option").forEach((option) => {
    option.addEventListener("click", () => {
      const weapon = option.dataset.weapon;
      const cost = weaponCosts[weapon];
      if (unlockedWeapons[weapon] || score >= cost) {
        if (!unlockedWeapons[weapon]) {
          score -= cost;
          unlockedWeapons[weapon] = true;
        }
        currentWeapon = weapon;
        bullets.length = 0;
        upgradeScreen.classList.add("hidden");
        gamePaused = false;
        spawnEnemies();
      }
    });
  });

  // Spawn a new wave of enemies
  function spawnEnemies() {
    enemies = [];
    enemyDirection = 1;
    for (let row = 0; row < enemyRowCount; row++) {
      for (let col = 0; col < enemyColumnCount; col++) {
        const enemy = {
          x: col * (enemyWidth + enemyPadding) + enemyOffsetLeft,
          y: row * (enemyHeight + enemyPadding) + enemyOffsetTop,
          width: enemyWidth,
          height: enemyHeight,
          color: "#00ffff",
          isAlive: true,
        };
        enemies.push(enemy);
      }
    }
  }

  // Start first wave
  spawnEnemies();

  // Event listeners for player controls
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  document.addEventListener("keydown", handleSpacebar);

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
      const now = Date.now();
      if (now - lastShotTime >= fireRates[currentWeapon]) {
        fireWeapon();
        lastShotTime = now;
      }
    }
  }

  function fireWeapon() {
    if (currentWeapon === "spread") {
      [-2, 0, 2].forEach((dx) => bullets.push(createBullet(dx)));
    } else if (currentWeapon === "rapid") {
      bullets.push(createBullet(0));
    } else if (currentWeapon === "laser") {
      bullets.push({
        x: player.x + player.width / 2 - bulletWidth / 2,
        y: 0,
        width: bulletWidth,
        height: gameHeight,
        dx: 0,
        dy: 0,
        life: 20,
        color: "#ffff00",
      });
    } else {
      bullets.push(createBullet(0));
    }
  }

  function createBullet(dx) {
    return {
      x: player.x + player.width / 2 - bulletWidth / 2,
      y: player.y - bulletHeight,
      width: bulletWidth,
      height: bulletHeight,
      dx: dx,
      dy: -bulletSpeed,
      color: "#ff0000",
    };
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

  // Update enemy positions and check collisions
  function updateEnemies() {
    let wallHit = false;
    let moveEnemiesDown = false;

    enemies.forEach((enemy) => {
      if (enemy.isAlive) {
        enemy.x += enemySpeed * enemyDirection;

        // Check collision with player
        if (checkCollision(enemy, player)) {
          gameOver = true;
          playSound("explosion.wav");
        }

        // Bullet collisions
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          if (checkCollision(b, enemy)) {
            enemy.isAlive = false;
            bullets.splice(i, 1);
            score++;
            playSound("explosion.wav");
            break;
          }
        }

        if (enemy.x <= 0 || enemy.x + enemy.width >= gameWidth) {
          wallHit = true;
        }

        if (enemy.y + enemy.height >= gameHeight) {
          moveEnemiesDown = true;
        }
      }
    });

    if (wallHit) {
      enemyDirection *= -1;
      enemies.forEach((enemy) => {
        enemy.y += enemy.height;
      });
    }

    if (moveEnemiesDown) {
      enemies.forEach((enemy) => {
        enemy.y += enemy.height;
      });
    }

    if (enemies.every((enemy) => !enemy.isAlive)) {
      gamePaused = true;
      currentScoreEl.textContent = scoreText + score;
      upgradeScreen.classList.remove("hidden");
    }
  }

  // Game loop
  function gameLoop() {
    if (!gameOver && !gamePaused) {
      if (player.isMovingLeft) {
        player.x -= playerSpeed;
      } else if (player.isMovingRight) {
        player.x += playerSpeed;
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.dx;
        b.y += b.dy;
        if (b.life !== undefined) {
          b.life--;
          if (b.life <= 0) {
            bullets.splice(i, 1);
            continue;
          }
        }
        if (b.y + b.height < 0 || b.x < 0 || b.x > gameWidth) {
          bullets.splice(i, 1);
        }
      }

      updateEnemies();
    }

    // Clear the canvas
    context.clearRect(0, 0, gameWidth, gameHeight);

    // Draw player
    context.fillStyle = player.color;
    context.fillRect(player.x, player.y, player.width, player.height);

    // Draw bullets
    bullets.forEach((b) => {
      context.fillStyle = b.color;
      context.fillRect(b.x, b.y, b.width, b.height);
    });

    // Draw enemies
    enemies.forEach((enemy) => {
      if (enemy.isAlive) {
        context.fillStyle = enemy.color;
        context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
    });

    // Draw score
    context.fillStyle = "#ffffff";
    context.font = "20px Arial";
    context.fillText(scoreText + score, 10, 30);

    // Draw game over message
    if (gameOver) {
      context.fillStyle = "#ff0000";
      context.font = "50px Arial";
      const gameOverTextWidth = context.measureText(gameOverText).width;
      context.fillText(
        gameOverText,
        gameWidth / 2 - gameOverTextWidth / 2,
        gameHeight / 2
      );
    }

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}

// Start the game after the page has loaded
window.onload = function () {
  init();
};
