export const POWERUP_TYPES = {
  RAPID_FIRE: 'rapidFire',
  SHIELD: 'shield',
};

// Simple falling power-up entity
export default class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 20;
    this.height = 20;
    this.speed = 2;
    this.color =
      type === POWERUP_TYPES.RAPID_FIRE ? '#ffff00' : '#00ffff';
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }
}

