// 渲染器类
export class Renderer {
  constructor(canvas, gameState) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gameState = gameState;
    this.inputHandler = null; // 将由main.js设置
  }

  // 更新画布尺寸
  updateCanvasSize() {
    // 画布尺寸由外部管理，这里只需要更新游戏状态的尺寸信息
    this.gameState.canvasWidth = this.canvas.width;
    this.gameState.canvasHeight = this.canvas.height;
  }

  // 渲染游戏
  render() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制背景
    this.drawBackground();

    // 绘制网格
    this.drawGrid();

    // 绘制阳光资源
    this.drawSunResources();

    // 绘制角色
    this.drawCharacters();

    // 绘制僵尸
    this.drawZombies();

    // 绘制子弹
    this.drawBullets();

    // 绘制角色放置预览
    if (this.inputHandler) {
      const preview = this.inputHandler.getPlacementPreview();
      if (preview) {
        this.drawCharacterPreview(preview.x, preview.y, preview.charType, preview.isValid);
      }
    }

    // 绘制暂停遮罩
    if (this.gameState.isPaused) {
      this.drawPausedOverlay();
    }
  }

  // 绘制背景
  drawBackground() {
    const ctx = this.ctx;

    // 天空渐变
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.4);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.4);

    // 草地渐变
    const grassGradient = ctx.createLinearGradient(0, this.canvas.height * 0.4, 0, this.canvas.height);
    grassGradient.addColorStop(0, '#90EE90');
    grassGradient.addColorStop(1, '#228B22');
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, this.canvas.height * 0.4, this.canvas.width, this.canvas.height * 0.6);

    // 装饰云朵
    this.drawClouds();

    // 装饰草丛
    this.drawGrass();
  }

  // 绘制云朵
  drawClouds() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    const clouds = [
      { x: 100, y: 50, size: 40 },
      { x: 300, y: 80, size: 50 },
      { x: 600, y: 40, size: 45 },
      { x: 900, y: 70, size: 38 }
    ];

    clouds.forEach(cloud => {
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 1.5, cloud.y, cloud.size * 0.9, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 绘制草丛
  drawGrass() {
    const ctx = this.ctx;
    const startY = this.canvas.height * 0.4;

    for (let i = 0; i < 30; i++) {
      const x = Math.random() * this.canvas.width;
      const y = startY + Math.random() * (this.canvas.height - startY);
      const height = 10 + Math.random() * 20;

      ctx.fillStyle = `rgba(34, 139, 34, ${0.3 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y - height);
      ctx.lineTo(x, y - height * 0.8);
      ctx.lineTo(x + 3, y - height);
      ctx.lineTo(x, y);
      ctx.fill();
    }
  }

  // 绘制网格
  drawGrid() {
    const ctx = this.ctx;
    const { rows, cols, gridStartX, gridStartY, cellWidth, cellHeight } = this.gameState;

    // 绘制网格背景
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = gridStartX + col * cellWidth;
        const y = gridStartY + row * cellHeight;

        // 交替颜色
        const isOdd = (row + col) % 2 === 0;
        ctx.fillStyle = isOdd ? 'rgba(144, 238, 144, 0.3)' : 'rgba(107, 142, 35, 0.3)';
        ctx.fillRect(x, y, cellWidth, cellHeight);

        // 网格边框
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
      }
    }

    // 绘制行分隔线（更明显）
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
    ctx.lineWidth = 2;
    for (let row = 0; row <= rows; row++) {
      const y = gridStartY + row * cellHeight;
      ctx.beginPath();
      ctx.moveTo(gridStartX, y);
      ctx.lineTo(gridStartX + cols * cellWidth, y);
      ctx.stroke();
    }
  }

  // 绘制阳光资源
  drawSunResources() {
    for (const sun of this.gameState.sunResources) {
      sun.draw(this.ctx);
    }
  }

  // 绘制角色
  drawCharacters() {
    for (const character of this.gameState.characters) {
      character.draw(this.ctx);
    }
  }

  // 绘制僵尸
  drawZombies() {
    for (const zombie of this.gameState.zombies) {
      zombie.draw(this.ctx);
    }
  }

  // 绘制子弹
  drawBullets() {
    for (const bullet of this.gameState.bullets) {
      bullet.draw(this.ctx);
    }
  }

  // 绘制暂停遮罩
  drawPausedOverlay() {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;

    const text = '游戏已暂停';
    const x = this.canvas.width / 2;
    const y = this.canvas.height / 2;

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  }

  // 绘制角色预览（用于放置）
  drawCharacterPreview(x, y, charType, isValid) {
    const ctx = this.ctx;

    ctx.save();
    ctx.globalAlpha = 0.6;

    // 根据是否有效改变颜色
    if (!isValid) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(x - 30, y - 30, 60, 60);
    }

    // 绘制角色轮廓
    const size = charType.size || 30;

    switch (charType.type) {
      case 'normal':
        ctx.fillStyle = isValid ? charType.color : '#FF0000';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'ice':
        ctx.fillStyle = isValid ? charType.color : '#FF0000';
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        ctx.fill();
        break;

      case 'fire':
        ctx.fillStyle = isValid ? charType.color : '#FF0000';
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.8, y + size * 0.6);
        ctx.lineTo(x - size * 0.8, y + size * 0.6);
        ctx.closePath();
        ctx.fill();
        break;

      case 'wall':
        ctx.fillStyle = isValid ? charType.color : '#FF0000';
        ctx.fillRect(x - size * 0.8, y - size * 0.8, size * 1.6, size * 1.6);
        break;
    }

    ctx.restore();
  }
}
