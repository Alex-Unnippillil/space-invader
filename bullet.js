export default class Bullet {
  constructor(width, height, speed, color) {
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.color = color;
    this.x = 0;
    this.y = 0;
    this.isFired = false;
  }

  fire(startX, startY) {
    this.isFired = true;
    this.x = startX - this.width / 2;
    this.y = startY - this.height;
  }

  update() {
    if (this.isFired) {
      this.y -= this.speed;
      if (this.y < 0) {
        this.isFired = false;
      }
    }
  }

  draw(context) {
    if (this.isFired) {
      context.fillStyle = this.color;
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
