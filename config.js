export const PLAYER = {
  WIDTH: 40,
  HEIGHT: 30,
  SPEED: 5,
};

export const BULLET = {
  WIDTH: 5,
  HEIGHT: 15,
  SPEED: 7,
};

export const ENEMY = {
  WIDTH: 30,
  HEIGHT: 30,
  ROWS: 5,
  COLUMNS: 10,
  PADDING: 10,
  OFFSET_TOP: 50,
  OFFSET_LEFT: 50,
  BASE_SPEED: 1,
  SPEED_INCREMENT: 0.2,
};

export function getLevelConfig(level) {
  return {
    playerSpeed: PLAYER.SPEED,
    bulletSpeed: BULLET.SPEED,
    enemySpeed: ENEMY.BASE_SPEED + (level - 1) * ENEMY.SPEED_INCREMENT,
  };
}
