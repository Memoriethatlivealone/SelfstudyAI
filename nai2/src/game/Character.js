// 角色类
import { Bullet } from './Bullet.js';

export class Character {
  constructor(row, col, type, config) {
    this.row = row;
    this.col = col;
    this.type = type;
    this.config = config;

    // 位置（会在放置时设置）
    this.x = 0;
    this.y = 0;

    // 属性
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.damage = config.damage;
    this.attackSpeed = config.attackSpeed;
    this.attackRange = config.attackRange;
    this.size = config.size;

    // 攻击状态
    this.lastAttackTime = 0;
    this.canAttack = config.damage > 0;

    // 动画状态
    this.animationFrame = 0;
    this.animationTime = 0;
    this.damageFlash = 0; // 受伤闪烁效果
  }

  // 更新角色状态
  update(deltaTime, gameState) {
    if (this.isDead()) return;

    // 更新动画
    this.animationTime += deltaTime;
    if (this.animationTime >= 200) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTime = 0;
    }

    // 更新受伤闪烁
    if (this.damageFlash > 0) {
      this.damageFlash -= deltaTime;
    }

    // 攻击逻辑
    if (this.canAttack) {
      const now = Date.now();
      if (now - this.lastAttackTime >= this.attackSpeed) {
        this.tryAttack(gameState);
      }
    }
  }

  // 尝试攻击
  tryAttack(gameState) {
    // 查找同一行的僵尸
    const zombiesInRow = gameState.getZombiesInRow(this.row);

    // 找到攻击范围内最近的僵尸
    let target = null;
    let minDistance = Infinity;

    for (const zombie of zombiesInRow) {
      const distance = zombie.x - this.x;
      if (distance > 0 && distance <= this.attackRange && distance < minDistance) {
        target = zombie;
        minDistance = distance;
      }
    }

    // 如果找到目标，发射子弹
    if (target) {
      const bullet = new Bullet(
        this.x + this.size,
        this.y,
        this.row,
        this.damage,
        this.config.bulletColor,
        this.config.effect
      );
      gameState.addBullet(bullet);
      this.lastAttackTime = Date.now();
    }
  }

  // 受到伤害
  takeDamage(damage) {
    this.hp -= damage;
    this.damageFlash = 300; // 闪烁300ms
    if (this.hp < 0) {
      this.hp = 0;
    }
  }

  // 是否死亡
  isDead() {
    return this.hp <= 0;
  }

  // 设置位置
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // 绘制角色
  draw(ctx) {
    if (this.isDead()) return;

    ctx.save();

    // 受伤闪烁效果
    if (this.damageFlash > 0) {
      ctx.globalAlpha = 0.5 + Math.sin(this.damageFlash * 0.05) * 0.5;
    }

    // 根据类型绘制不同的角色
    switch (this.type) {
      case 'normal':
        this.drawNormal(ctx);
        break;
      case 'ice':
        this.drawIce(ctx);
        break;
      case 'fire':
        this.drawFire(ctx);
        break;
      case 'wall':
        this.drawWall(ctx);
        break;
    }

    ctx.restore();

    // 绘制血条
    this.drawHealthBar(ctx);
  }

  // 绘制普通奶龙
  drawNormal(ctx) {
    // 身体 - 蓝色圆形
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x - 10, this.y - 8, 6, 0, Math.PI * 2);
    ctx.arc(this.x + 10, this.y - 8, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.x - 10, this.y - 8, 3, 0, Math.PI * 2);
    ctx.arc(this.x + 10, this.y - 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // 嘴巴
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y + 5, 8, 0, Math.PI);
    ctx.stroke();

    // 动画：轻微摇摆
    const wobble = Math.sin(this.animationFrame * 0.5) * 2;
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.8 + wobble, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 绘制冰霜奶龙
  drawIce(ctx) {
    // 身体 - 青色菱形
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.size);
    ctx.lineTo(this.x + this.size, this.y);
    ctx.lineTo(this.x, this.y + this.size);
    ctx.lineTo(this.x - this.size, this.y);
    ctx.closePath();
    ctx.fill();

    // 冰晶效果
    ctx.strokeStyle = '#E0FFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 冰晶装饰
    for (let i = 0; i < 3; i++) {
      const angle = (this.animationFrame * 0.2 + i * Math.PI * 2 / 3);
      const dx = Math.cos(angle) * 15;
      const dy = Math.sin(angle) * 15;
      ctx.fillStyle = '#B0E0E6';
      ctx.beginPath();
      ctx.arc(this.x + dx, this.y + dy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 绘制火焰奶龙
  drawFire(ctx) {
    // 身体 - 红色三角形
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.size);
    ctx.lineTo(this.x + this.size * 0.8, this.y + this.size * 0.6);
    ctx.lineTo(this.x - this.size * 0.8, this.y + this.size * 0.6);
    ctx.closePath();
    ctx.fill();

    // 火焰效果 - 动态闪烁
    const flameOffset = Math.sin(this.animationFrame) * 5;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.5 + flameOffset, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.5 + flameOffset, 6, 0, Math.PI * 2);
    ctx.fill();

    // 火花
    ctx.fillStyle = '#FFA500';
    for (let i = 0; i < 2; i++) {
      const sparkX = this.x + (Math.random() - 0.5) * 20;
      const sparkY = this.y - this.size * 0.3 + Math.random() * 10;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 绘制坚果奶龙
  drawWall(ctx) {
    // 身体 - 棕色方形
    ctx.fillStyle = this.config.color;
    ctx.fillRect(
      this.x - this.size * 0.8,
      this.y - this.size * 0.8,
      this.size * 1.6,
      this.size * 1.6
    );

    // 边框
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 4;
    ctx.strokeRect(
      this.x - this.size * 0.8,
      this.y - this.size * 0.8,
      this.size * 1.6,
      this.size * 1.6
    );

    // 盾牌标志
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // 盾牌细节
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 10);
    ctx.lineTo(this.x, this.y + 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x - 10, this.y);
    ctx.lineTo(this.x + 10, this.y);
    ctx.stroke();
  }

  // 绘制血条
  drawHealthBar(ctx) {
    const barWidth = this.size * 1.6;
    const barHeight = 6;
    const x = this.x - barWidth / 2;
    const y = this.y - this.size * 1.2 - 10;

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
