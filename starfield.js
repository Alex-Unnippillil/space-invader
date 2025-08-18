export default class Starfield {
  constructor(canvas, numStars = 100) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.stars = [];
    for (let i = 0; i < numStars; i++) {
      this.stars.push(this.createStar());
    }
  }

  createStar() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2
    };
  }

  update() {
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    });
  }

  draw() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#fff';
    this.stars.forEach(star => {
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    });
  }
}
