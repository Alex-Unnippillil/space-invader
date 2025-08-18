export default class Player {
  constructor(x, y, width, height, speed, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.color = color;
    this.isMovingLeft = false;
    this.isMovingRight = false;
  }

  moveLeft() {
    this.isMovingLeft = true;
  }

  moveRight() {
    this.isMovingRight = true;
  }

  stopLeft() {
    this.isMovingLeft = false;
  }

  stopRight() {
    this.isMovingRight = false;
  }

  update(gameWidth) {
    if (this.isMovingLeft) {
      this.x -= this.speed;
    }
    if (this.isMovingRight) {
      this.x += this.speed;
    }
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x + this.width > gameWidth) {
      this.x = gameWidth - this.width;
    }
  }

  draw(context) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}
