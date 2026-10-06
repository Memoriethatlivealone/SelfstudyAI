// 子弹类
export class Bullet {
  constructor(x, y, row, damage, color, effect = null) {
    this.x = x;
    this.y = y;
    this.row = row;
    this.damage = damage;
    this.color = color;
    this.effect = effect; // 'slow', 'splash', null
    this.speed = 300; // 像素/秒
    this.size = 8;
    this.hasHit = false;

    // 动画
    this.trailPositions = [];
  }

  // 更新子弹
  update(deltaTime) {
    if (this.hasHit) return;

    // 保存轨迹
    this.trailPositions.push({ x: this.x, y: this.y });
    if (this.trailPositions.length > 5) {
      this.trailPositions.shift();
    }

    // 移动
    this.x += this.speed * (deltaTime / 1000);
  }

  // 击中目标
  hit() {
    this.hasHit = true;
  }

  // 是否超出屏幕
  isOffScreen(canvasWidth, canvasHeight) {
    return this.x > canvasWidth || this.hasHit;
  }

  // 绘制子弹
  draw(ctx) {
    if (this.hasHit) return;

    ctx.save();

    // 绘制轨迹
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < this.trailPositions.length; i++) {
      const pos = this.trailPositions[i];
      const alpha = i / this.trailPositions.length;
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.size * (0.5 + alpha * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // 绘制子弹主体
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // 根据效果添加特殊外观
    if (this.effect === 'slow') {
      // 冰霜效果 - 蓝色光晕
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.effect === 'splash') {
      // 火焰效果 - 橙色光晕
      ctx.fillStyle = '#FFA500';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - 2, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
