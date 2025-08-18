export default class Enemy {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.isAlive = true;
  }

  update(direction, speed) {
    this.x += direction * speed;
  }

  moveDown(amount) {
    this.y += amount;
  }

  draw(context) {
    if (this.isAlive) {
      context.fillStyle = this.color;
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
