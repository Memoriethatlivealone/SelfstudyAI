// 僵尸类
export class Zombie {
  constructor(x, y, row, config) {
    this.x = x;
    this.y = y;
    this.row = row;
    this.config = config;

    // 属性
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.attackSpeed = config.attackSpeed;
    this.size = config.size;
    this.reward = config.reward;

    // 状态
    this.isAttacking = false;
    this.target = null;
    this.lastAttackTime = 0;

    // 减速效果
    this.slowEffect = 0;
    this.slowMultiplier = 1;

    // 动画状态
    this.animationFrame = 0;
    this.animationTime = 0;
    this.damageFlash = 0;
  }

  // 更新僵尸状态
  update(deltaTime, gameState) {
    if (this.isDead()) return;

    // 更新动画
    this.animationTime += deltaTime;
    if (this.animationTime >= 150) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTime = 0;
    }

    // 更新受伤闪烁
    if (this.damageFlash > 0) {
      this.damageFlash -= deltaTime;
    }

    // 更新减速效果
    if (this.slowEffect > 0) {
      this.slowEffect -= deltaTime;
      this.slowMultiplier = 0.5;
    } else {
      this.slowMultiplier = 1;
    }

    // 攻击逻辑
    if (this.isAttacking && this.target) {
      // 检查目标是否还存在
      if (this.target.isDead()) {
        this.stopAttack();
        return;
      }

      // 攻击目标
      const now = Date.now();
      if (now - this.lastAttackTime >= this.attackSpeed) {
        this.target.takeDamage(this.damage);
        this.lastAttackTime = now;
      }
    } else {
      // 移动
      const moveSpeed = this.speed * this.slowMultiplier * (deltaTime / 1000);
      this.x -= moveSpeed;
    }
  }

  // 受到伤害
  takeDamage(damage) {
    this.hp -= damage;
    this.damageFlash = 300;
    if (this.hp < 0) {
      this.hp = 0;
    }
  }

  // 应用减速效果
  applySlow(duration) {
    this.slowEffect = Math.max(this.slowEffect, duration);
  }

  // 开始攻击
  startAttack(target) {
    this.isAttacking = true;
    this.target = target;
    this.lastAttackTime = Date.now();
  }

  // 停止攻击
  stopAttack() {
    this.isAttacking = false;
    this.target = null;
  }

  // 是否死亡
  isDead() {
    return this.hp <= 0;
  }

  // 绘制僵尸
  draw(ctx) {
    if (this.isDead()) return;

    ctx.save();

    // 受伤闪烁效果
    if (this.damageFlash > 0) {
      ctx.globalAlpha = 0.5 + Math.sin(this.damageFlash * 0.05) * 0.5;
    }

    // 减速效果 - 蓝色光晕
    if (this.slowEffect > 0) {
      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 根据类型绘制不同的僵尸
    switch (this.config.type) {
      case 'normal':
        this.drawNormal(ctx);
        break;
      case 'fast':
        this.drawFast(ctx);
        break;
      case 'tank':
        this.drawTank(ctx);
        break;
      case 'giant':
        this.drawGiant(ctx);
        break;
    }

    ctx.restore();

    // 绘制血条
    this.drawHealthBar(ctx);
  }

  // 绘制普通僵尸
  drawNormal(ctx) {
    // 身体 - 绿色
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 僵尸特征 - X眼睛
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x - 12, this.y - 12);
    ctx.lineTo(this.x - 6, this.y - 6);
    ctx.moveTo(this.x - 6, this.y - 12);
    ctx.lineTo(this.x - 12, this.y - 6);
    ctx.moveTo(this.x + 6, this.y - 12);
    ctx.lineTo(this.x + 12, this.y - 6);
    ctx.moveTo(this.x + 12, this.y - 12);
    ctx.lineTo(this.x + 6, this.y - 6);
    ctx.stroke();

    // 嘴巴 - 锯齿状
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(this.x - 10, this.y + 8);
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(this.x - 10 + i * 5, this.y + (i % 2 === 0 ? 8 : 12));
    }
    ctx.lineTo(this.x - 10, this.y + 12);
    ctx.closePath();
    ctx.fill();

    // 手臂（攻击时摆动）
    const armAngle = this.isAttacking ? Math.sin(this.animationFrame) * 0.5 : 0;
    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(this.x - this.size * 0.5, this.y);
    ctx.lineTo(this.x - this.size * 1.2, this.y + Math.sin(armAngle) * 20);
    ctx.stroke();
  }

  // 绘制快速僵尸
  drawFast(ctx) {
    // 身体 - 粉色流线型
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 1.2, this.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 速度线条
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + this.size + i * 10, this.y - 10 + i * 10);
      ctx.lineTo(this.x + this.size + 20 + i * 10, this.y - 10 + i * 10);
      ctx.stroke();
    }

    // 眼睛 - 愤怒
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(this.x - 8, this.y - 5, 5, 0, Math.PI * 2);
    ctx.arc(this.x + 8, this.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 绘制防御僵尸
  drawTank(ctx) {
    // 身体 - 灰色装甲
    ctx.fillStyle = this.config.color;
    ctx.fillRect(
      this.x - this.size,
      this.y - this.size * 0.9,
      this.size * 2,
      this.size * 1.8
    );

    // 装甲板
    ctx.strokeStyle = '#505050';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      this.x - this.size,
      this.y - this.size * 0.9,
      this.size * 2,
      this.size * 1.8
    );

    // 装甲细节
    ctx.beginPath();
    ctx.moveTo(this.x - this.size, this.y);
    ctx.lineTo(this.x + this.size, this.y);
    ctx.stroke();

    // 盾牌标志
    ctx.fillStyle = '#A9A9A9';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 15);
    ctx.lineTo(this.x - 10, this.y);
    ctx.lineTo(this.x - 10, this.y + 15);
    ctx.lineTo(this.x, this.y + 20);
    ctx.lineTo(this.x + 10, this.y + 15);
    ctx.lineTo(this.x + 10, this.y);
    ctx.closePath();
    ctx.fill();
  }

  // 绘制巨型僵尸
  drawGiant(ctx) {
    // 身体 - 紫色巨大
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // 外圈光晕
    ctx.strokeStyle = '#9932CC';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.9, 0, Math.PI * 2);
    ctx.stroke();

    // 恐怖眼睛
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(this.x - 12, this.y - 10, 8, 0, Math.PI * 2);
    ctx.arc(this.x + 12, this.y - 10, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x - 12, this.y - 10, 4, 0, Math.PI * 2);
    ctx.arc(this.x + 12, this.y - 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // 大嘴巴
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x, this.y + 10, 15, 0, Math.PI);
    ctx.fill();

    // 角
    ctx.fillStyle = '#4B0082';
    ctx.beginPath();
    ctx.moveTo(this.x - 20, this.y - this.size * 0.8);
    ctx.lineTo(this.x - 25, this.y - this.size * 1.2);
    ctx.lineTo(this.x - 15, this.y - this.size * 0.8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.x + 20, this.y - this.size * 0.8);
    ctx.lineTo(this.x + 25, this.y - this.size * 1.2);
    ctx.lineTo(this.x + 15, this.y - this.size * 0.8);
    ctx.fill();
  }

  // 绘制血条
  drawHealthBar(ctx) {
    const barWidth = this.size * 2;
    const barHeight = 6;
    const x = this.x - barWidth / 2;
    const y = this.y - this.size * 1.3 - 10;

    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, barWidth, barHeight);

    // 血量
    const hpPercent = this.hp / this.maxHp;
    let hpColor;
    if (hpPercent > 0.6) {
      hpColor = '#4CAF50';
    } else if (hpPercent > 0.3) {
      hpColor = '#FFC107';
    } else {
      hpColor = '#F44336';
    }

    ctx.fillStyle = hpColor;
    ctx.fillRect(x, y, barWidth * hpPercent, barHeight);

    // 边框
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);
  }
}
