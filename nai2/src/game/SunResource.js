// 阳光资源类
export class SunResource {
  constructor(x, y, value = 25) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.size = 25;
    this.lifetime = 10000; // 10秒后消失
    this.createdAt = Date.now();
    this.collected = false;

    // 下落动画
    this.targetY = y + 100 + Math.random() * 200;
    this.fallSpeed = 50; // 像素/秒
    this.isFalling = true;

    // 闪烁动画
    this.pulseTime = 0;
  }

  // 更新阳光
  update(deltaTime) {
    if (this.collected) return;

    // 下落
    if (this.isFalling) {
      this.y += this.fallSpeed * (deltaTime / 1000);
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.isFalling = false;
      }
    }

    // 脉冲动画
    this.pulseTime += deltaTime;
  }

  // 检查是否过期
  isExpired() {
    return this.collected || (Date.now() - this.createdAt >= this.lifetime);
  }

  // 检查点击
  isClicked(mouseX, mouseY) {
    if (this.collected) return false;

    const distance = Math.sqrt(
      Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)
    );

    return distance <= this.size;
  }

  // 收集
  collect() {
    this.collected = true;
  }

  // 绘制阳光
  draw(ctx) {
    if (this.collected) return;

    ctx.save();

    // 脉冲效果
    const pulse = Math.sin(this.pulseTime * 0.005) * 0.15 + 1;
    const currentSize = this.size * pulse;

    // 外圈光晕
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, currentSize * 1.5
    );
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, currentSize * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 主体
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
    ctx.fill();

    // 光芒
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + this.pulseTime * 0.001;
      const startDist = currentSize;
      const endDist = currentSize * 1.4;
      ctx.beginPath();
      ctx.moveTo(
        this.x + Math.cos(angle) * startDist,
        this.y + Math.sin(angle) * startDist
      );
      ctx.lineTo(
        this.x + Math.cos(angle) * endDist,
        this.y + Math.sin(angle) * endDist
      );
      ctx.stroke();
    }

    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(this.x - 8, this.y - 8, currentSize * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 数值
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(this.value.toString(), this.x, this.y);
    ctx.fillText(this.value.toString(), this.x, this.y);

    ctx.restore();
  }
}
