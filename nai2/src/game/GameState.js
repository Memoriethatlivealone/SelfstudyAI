// 游戏状态管理类
import { Character } from './Character.js';
import { Zombie } from './Zombie.js';
import { Bullet } from './Bullet.js';
import { SunResource } from './SunResource.js';
import { zombieTypes } from './ZombieTypes.js';

export class GameState {
  constructor(canvasWidth, canvasHeight) {
    // 画布尺寸
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // 游戏网格配置
    this.rows = 5;
    this.cols = 9;
    this.gridStartX = 200;
    this.gridStartY = 80;

    // 确保网格尺寸有效
    const availableWidth = Math.max(100, canvasWidth - this.gridStartX - 50);
    const availableHeight = Math.max(100, canvasHeight - this.gridStartY - 50);

    this.cellWidth = availableWidth / this.cols;
    this.cellHeight = availableHeight / this.rows;

    // 游戏资源
    this.resources = 150; // 增加初始资源，让玩家更容易开始
    this.resourceGenerateInterval = 5000; // 5秒生成一个阳光
    this.lastResourceGenerate = Date.now();

    // 游戏进度
    this.wave = 1;
    this.kills = 0;
    this.maxWaves = 10;

    // 游戏状态
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;

    // 游戏对象数组
    this.characters = [];
    this.zombies = [];
    this.bullets = [];
    this.sunResources = [];

    // 卡片冷却时间（type -> 剩余冷却时间ms）
    this.cardCooldowns = new Map();

    // 波次管理
    this.waveConfig = {
      zombiesPerWave: 10,
      spawnInterval: 3000, // 僵尸生成间隔
      waveDelay: 8000 // 波次间隔改为8秒
    };
    this.zombiesSpawnedThisWave = 0;
    this.zombiesKilledThisWave = 0;
    this.lastZombieSpawn = Date.now() - 2000; // 减去2秒，让第一个僵尸更快出现
    this.waveStartTime = Date.now();
    this.isWaveActive = true;

    // 游戏回调
    this.onGameOver = null;
    this.onVictory = null;

    // 上一帧时间
    this.lastUpdateTime = Date.now();
  }

  // 更新游戏状态
  update() {
    if (this.isPaused || this.isGameOver) return;

    const now = Date.now();
    const deltaTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    // 更新卡片冷却
    this.updateCardCooldowns(deltaTime);

    // 生成阳光资源
    this.generateSunResources(now);

    // 更新阳光资源
    this.updateSunResources(deltaTime);

    // 管理僵尸波次
    this.manageWaves(now);

    // 更新角色
    this.updateCharacters(deltaTime);

    // 更新僵尸
    this.updateZombies(deltaTime);

    // 更新子弹
    this.updateBullets(deltaTime);

    // 检测碰撞
    this.checkCollisions();

    // 检查游戏结束
    this.checkGameEnd();
  }

  // 更新卡片冷却
  updateCardCooldowns(deltaTime) {
    for (const [type, cooldown] of this.cardCooldowns.entries()) {
      const newCooldown = Math.max(0, cooldown - deltaTime);
      if (newCooldown === 0) {
        this.cardCooldowns.delete(type);
      } else {
        this.cardCooldowns.set(type, newCooldown);
      }
    }
  }

  // 生成阳光资源
  generateSunResources(now) {
    if (now - this.lastResourceGenerate >= this.resourceGenerateInterval) {
      // 随机位置生成阳光
      const x = this.gridStartX + Math.random() * (this.canvasWidth - this.gridStartX - 100);
      const y = 50;
      this.sunResources.push(new SunResource(x, y));
      this.lastResourceGenerate = now;
    }
  }

  // 更新阳光资源
  updateSunResources(deltaTime) {
    for (let i = this.sunResources.length - 1; i >= 0; i--) {
      const sun = this.sunResources[i];
      sun.update(deltaTime);

      // 移除过期的阳光
      if (sun.isExpired()) {
        this.sunResources.splice(i, 1);
      }
    }
  }

  // 管理僵尸波次
  manageWaves(now) {
    // 如果当前波次完成
    if (!this.isWaveActive) {
      // 等待一段时间后开始下一波
      if (now - this.waveStartTime >= this.waveConfig.waveDelay) {
        this.startNextWave();
      }
      return;
    }

    // 生成僵尸
    const zombiesNeeded = this.waveConfig.zombiesPerWave + Math.floor(this.wave * 1.5);
    if (
      this.zombiesSpawnedThisWave < zombiesNeeded &&
      now - this.lastZombieSpawn >= this.waveConfig.spawnInterval
    ) {
      this.spawnZombie();
      this.lastZombieSpawn = now;
    }

    // 检查波次是否完成
    if (
      this.zombiesSpawnedThisWave >= zombiesNeeded &&
      this.zombies.length === 0
    ) {
      this.completeWave();
    }
  }

  // 生成僵尸
  spawnZombie() {
    const row = Math.floor(Math.random() * this.rows);
    const x = this.canvasWidth + 50;
    const y = this.gridStartY + row * this.cellHeight + this.cellHeight / 2;

    // 根据波次选择僵尸类型
    let zombieType;
    const rand = Math.random();

    if (this.wave <= 2) {
      zombieType = zombieTypes[0]; // 只有普通僵尸
    } else if (this.wave <= 4) {
      zombieType = rand < 0.7 ? zombieTypes[0] : zombieTypes[1];
    } else if (this.wave <= 7) {
      const types = [zombieTypes[0], zombieTypes[1], zombieTypes[2]];
      zombieType = types[Math.floor(Math.random() * types.length)];
    } else {
      zombieType = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
    }

    this.zombies.push(new Zombie(x, y, row, zombieType));
    this.zombiesSpawnedThisWave++;
  }

  // 开始下一波
  startNextWave() {
    this.wave++;
    this.zombiesSpawnedThisWave = 0;
    this.zombiesKilledThisWave = 0;
    this.isWaveActive = true;
    this.waveStartTime = Date.now();
    this.lastZombieSpawn = Date.now() - 2000; // 让僵尸更快出现

    // 每波减少生成间隔，增加难度
    this.waveConfig.spawnInterval = Math.max(1500, 3000 - this.wave * 100);
  }

  // 完成当前波
  completeWave() {
    this.isWaveActive = false;
    this.waveStartTime = Date.now();

    // 检查是否胜利
    if (this.wave >= this.maxWaves) {
      this.isVictory = true;
      this.isGameOver = true;
      if (this.onVictory) {
        this.onVictory();
      }
    }
  }

  // 更新角色
  updateCharacters(deltaTime) {
    for (let i = this.characters.length - 1; i >= 0; i--) {
      const character = this.characters[i];
      character.update(deltaTime, this);

      // 移除死亡的角色
      if (character.isDead()) {
        this.characters.splice(i, 1);
      }
    }
  }

  // 更新僵尸
  updateZombies(deltaTime) {
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const zombie = this.zombies[i];
      zombie.update(deltaTime, this);

      // 移除死亡的僵尸
      if (zombie.isDead()) {
        this.zombies.splice(i, 1);
        this.kills++;
        this.zombiesKilledThisWave++;
      }

      // 检查僵尸是否到达左侧
      if (zombie.x < this.gridStartX - 50) {
        this.triggerGameOver();
      }
    }
  }

  // 更新子弹
  updateBullets(deltaTime) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(deltaTime);

      // 移除超出屏幕的子弹
      if (bullet.isOffScreen(this.canvasWidth, this.canvasHeight)) {
        this.bullets.splice(i, 1);
      }
    }
  }

  // 检测碰撞
  checkCollisions() {
    // 子弹与僵尸的碰撞
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (bullet.hasHit) continue;

      for (const zombie of this.zombies) {
        if (zombie.row === bullet.row && !zombie.isDead()) {
          const distance = Math.abs(zombie.x - bullet.x);
          if (distance < 30) {
            // 子弹击中僵尸
            zombie.takeDamage(bullet.damage);
            bullet.hit();

            // 应用特殊效果
            if (bullet.effect === 'slow') {
              zombie.applySlow(2000); // 减速2秒
            } else if (bullet.effect === 'splash') {
              // 范围伤害
              this.applySplashDamage(bullet.x, bullet.row, bullet.damage * 0.5);
            }

            break;
          }
        }
      }
    }

    // 僵尸与角色的碰撞
    for (const zombie of this.zombies) {
      if (zombie.isDead() || zombie.isAttacking) continue;

      for (const character of this.characters) {
        if (character.isDead()) continue;

        if (zombie.row === character.row) {
          const distance = Math.abs(zombie.x - character.x);
          if (distance < 40) {
            // 僵尸开始攻击角色
            zombie.startAttack(character);
            break;
          }
        }
      }
    }
  }

  // 范围伤害
  applySplashDamage(x, row, damage) {
    for (const zombie of this.zombies) {
      if (zombie.row === row && !zombie.isDead()) {
        const distance = Math.abs(zombie.x - x);
        if (distance < 80) {
          zombie.takeDamage(damage);
        }
      }
    }
  }

  // 检查游戏结束
  checkGameEnd() {
    // 游戏结束条件在 updateZombies 中检查
  }

  // 触发游戏失败
  triggerGameOver() {
    if (this.isGameOver) return;

    this.isGameOver = true;
    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  // 添加角色
  addCharacter(character) {
    this.characters.push(character);
  }

  // 添加子弹
  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  // 收集阳光资源
  collectSunResource(index) {
    if (index >= 0 && index < this.sunResources.length) {
      const sun = this.sunResources[index];
      this.resources = Math.floor(this.resources + sun.value); // 确保资源是整数
      this.sunResources.splice(index, 1);
      return true;
    }
    return false;
  }

  // 消耗资源
  spendResources(amount) {
    if (this.resources >= amount) {
      this.resources = Math.floor(this.resources - amount); // 确保资源是整数
      return true;
    }
    return false;
  }

  // 设置卡片冷却
  setCardCooldown(type, duration) {
    this.cardCooldowns.set(type, duration);
  }

  // 检查网格位置是否被占用
  isGridOccupied(row, col) {
    for (const character of this.characters) {
      if (character.row === row && character.col === col) {
        return true;
      }
    }
    return false;
  }

  // 获取指定行的僵尸
  getZombiesInRow(row) {
    return this.zombies.filter(z => z.row === row && !z.isDead());
  }

  // 网格坐标转换为像素坐标
  gridToPixel(row, col) {
    return {
      x: this.gridStartX + col * this.cellWidth + this.cellWidth / 2,
      y: this.gridStartY + row * this.cellHeight + this.cellHeight / 2
    };
  }

  // 像素坐标转换为网格坐标
  pixelToGrid(x, y) {
    const col = Math.floor((x - this.gridStartX) / this.cellWidth);
    const row = Math.floor((y - this.gridStartY) / this.cellHeight);

    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      return { row, col };
    }

    return null;
  }
}
