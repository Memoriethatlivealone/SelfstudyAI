// 输入处理器类
import { Character } from './Character.js';
import { characterTypes } from './CharacterTypes.js';

export class InputHandler {
  constructor(canvas, cardPanel, gameState, renderer, audioManager, updateUI) {
    this.canvas = canvas;
    this.cardPanel = cardPanel;
    this.gameState = gameState;
    this.renderer = renderer;
    this.audioManager = audioManager;
    this.updateUI = updateUI;

    // 选中的角色类型
    this.selectedCharacterType = null;

    // 鼠标位置
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMouseOverCanvas = false;

    // 悬停提示
    this.tooltip = document.getElementById('hover-tooltip');

    // 绑定事件
    this.bindEvents();
  }

  // 绑定事件
  bindEvents() {
    // 卡片点击
    this.cardClickHandler = (e) => this.handleCardClick(e);
    this.cardPanel.addEventListener('click', this.cardClickHandler);

    // 画布事件
    this.canvasClickHandler = (e) => this.handleCanvasClick(e);
    this.canvasMoveHandler = (e) => this.handleCanvasMove(e);
    this.canvasContextMenuHandler = (e) => this.handleCanvasRightClick(e);
    this.canvasEnterHandler = () => this.isMouseOverCanvas = true;
    this.canvasLeaveHandler = () => {
      this.isMouseOverCanvas = false;
      this.hideTooltip();
    };

    this.canvas.addEventListener('click', this.canvasClickHandler);
    this.canvas.addEventListener('mousemove', this.canvasMoveHandler);
    this.canvas.addEventListener('contextmenu', this.canvasContextMenuHandler);
    this.canvas.addEventListener('mouseenter', this.canvasEnterHandler);
    this.canvas.addEventListener('mouseleave', this.canvasLeaveHandler);

    // 卡片悬停
    this.cardHoverHandler = (e) => this.handleCardHover(e);
    this.cardPanel.addEventListener('mouseover', this.cardHoverHandler);
  }

  // 清理事件监听器
  cleanup() {
    this.cardPanel.removeEventListener('click', this.cardClickHandler);
    this.canvas.removeEventListener('click', this.canvasClickHandler);
    this.canvas.removeEventListener('mousemove', this.canvasMoveHandler);
    this.canvas.removeEventListener('contextmenu', this.canvasContextMenuHandler);
    this.canvas.removeEventListener('mouseenter', this.canvasEnterHandler);
    this.canvas.removeEventListener('mouseleave', this.canvasLeaveHandler);
    this.cardPanel.removeEventListener('mouseover', this.cardHoverHandler);
  }

  // 处理卡片点击
  handleCardClick(e) {
    const card = e.target.closest('.character-card');
    if (!card || card.classList.contains('disabled')) return;

    const type = card.dataset.type;
    const charType = characterTypes.find(ct => ct.type === type);

    if (!charType) return;

    // 检查资源
    if (this.gameState.resources < charType.cost) {
      this.audioManager.playError();
      return;
    }

    // 检查冷却
    if (this.gameState.cardCooldowns.has(type)) {
      this.audioManager.playError();
      return;
    }

    // 选中角色
    this.selectCharacter(type, card);
    this.audioManager.playSelect();
  }

  // 选中角色
  selectCharacter(type, card) {
    // 取消之前的选择
    const allCards = this.cardPanel.querySelectorAll('.character-card');
    allCards.forEach(c => c.classList.remove('selected'));

    // 选中当前卡片
    card.classList.add('selected');
    this.selectedCharacterType = type;

    // 改变鼠标样式
    this.canvas.style.cursor = 'pointer';
  }

  // 取消选择
  cancelSelection() {
    const allCards = this.cardPanel.querySelectorAll('.character-card');
    allCards.forEach(c => c.classList.remove('selected'));
    this.selectedCharacterType = null;
    this.canvas.style.cursor = 'crosshair';
  }

  // 处理画布点击
  handleCanvasClick(e) {
    if (this.gameState.isPaused) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // 检查是否点击阳光
    if (this.checkSunClick(x, y)) {
      return;
    }

    // 检查是否在放置角色
    if (this.selectedCharacterType) {
      this.tryPlaceCharacter(x, y);
    }
  }

  // 检查阳光点击
  checkSunClick(x, y) {
    for (let i = this.gameState.sunResources.length - 1; i >= 0; i--) {
      const sun = this.gameState.sunResources[i];
      if (sun.isClicked(x, y)) {
        this.gameState.collectSunResource(i);
        this.audioManager.playCollect();
        this.updateUI();
        return true;
      }
    }
    return false;
  }

  // 尝试放置角色
  tryPlaceCharacter(x, y) {
    // 转换为网格坐标
    const gridPos = this.gameState.pixelToGrid(x, y);
    if (!gridPos) {
      this.audioManager.playError();
      return;
    }

    const { row, col } = gridPos;

    // 检查网格是否被占用
    if (this.gameState.isGridOccupied(row, col)) {
      this.audioManager.playError();
      return;
    }

    // 获取角色配置
    const charType = characterTypes.find(ct => ct.type === this.selectedCharacterType);
    if (!charType) return;

    // 检查资源
    if (!this.gameState.spendResources(charType.cost)) {
      this.audioManager.playError();
      return;
    }

    // 创建角色
    const character = new Character(row, col, this.selectedCharacterType, charType);
    const pixelPos = this.gameState.gridToPixel(row, col);
    character.setPosition(pixelPos.x, pixelPos.y);
    this.gameState.addCharacter(character);

    // 设置冷却
    this.gameState.setCardCooldown(this.selectedCharacterType, charType.cooldown);

    // 播放放置音效
    this.audioManager.playPlace();

    // 更新UI
    this.updateUI();

    // 取消选择
    this.cancelSelection();
  }

  // 处理画布移动
  handleCanvasMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    this.mouseX = (e.clientX - rect.left) * scaleX;
    this.mouseY = (e.clientY - rect.top) * scaleY;

    // 不在这里绘制预览，预览会在Renderer.render()中绘制

    // 检查悬停提示
    this.updateHoverTooltip(e);
  }

  // 获取预览信息（供Renderer使用）
  getPlacementPreview() {
    if (!this.selectedCharacterType) return null;

    const charType = characterTypes.find(ct => ct.type === this.selectedCharacterType);
    if (!charType) return null;

    const gridPos = this.gameState.pixelToGrid(this.mouseX, this.mouseY);
    if (!gridPos) return null;

    const { row, col } = gridPos;
    const pixelPos = this.gameState.gridToPixel(row, col);
    const isValid = !this.gameState.isGridOccupied(row, col) &&
                    this.gameState.resources >= charType.cost;

    return {
      x: pixelPos.x,
      y: pixelPos.y,
      charType: charType,
      isValid: isValid
    };
  }

  // 更新悬停提示
  updateHoverTooltip(e) {
    // 检查是否悬停在阳光上
    for (const sun of this.gameState.sunResources) {
      if (sun.isClicked(this.mouseX, this.mouseY)) {
        this.showTooltip(`点击收集 ${sun.value} 阳光`, e.clientX, e.clientY);
        return;
      }
    }

    // 检查是否悬停在角色上
    for (const character of this.gameState.characters) {
      const distance = Math.sqrt(
        Math.pow(this.mouseX - character.x, 2) +
        Math.pow(this.mouseY - character.y, 2)
      );
      if (distance < character.size) {
        const hpPercent = Math.floor((character.hp / character.maxHp) * 100);
        this.showTooltip(
          `${character.config.name} - 生命值: ${character.hp}/${character.maxHp} (${hpPercent}%)`,
          e.clientX,
          e.clientY
        );
        return;
      }
    }

    // 检查是否悬停在僵尸上
    for (const zombie of this.gameState.zombies) {
      const distance = Math.sqrt(
        Math.pow(this.mouseX - zombie.x, 2) +
        Math.pow(this.mouseY - zombie.y, 2)
      );
      if (distance < zombie.size) {
        const hpPercent = Math.floor((zombie.hp / zombie.maxHp) * 100);
        this.showTooltip(
          `${zombie.config.name} - 生命值: ${zombie.hp}/${zombie.maxHp} (${hpPercent}%)`,
          e.clientX,
          e.clientY
        );
        return;
      }
    }

    this.hideTooltip();
  }

  // 显示提示
  showTooltip(text, x, y) {
    this.tooltip.textContent = text;
    this.tooltip.style.left = (x + 15) + 'px';
    this.tooltip.style.top = (y + 15) + 'px';
    this.tooltip.classList.add('show');
  }

  // 隐藏提示
  hideTooltip() {
    this.tooltip.classList.remove('show');
  }

  // 处理右键点击
  handleCanvasRightClick(e) {
    e.preventDefault();
    if (this.selectedCharacterType) {
      this.cancelSelection();
      this.audioManager.playCancel();
    }
  }

  // 处理卡片悬停
  handleCardHover(e) {
    const card = e.target.closest('.character-card');
    if (!card) return;

    const type = card.dataset.type;
    const charType = characterTypes.find(ct => ct.type === type);
    if (!charType) return;

    const cooldown = this.gameState.cardCooldowns.get(type);
    let tooltipText = `${charType.name}\n费用: ${charType.cost} 阳光`;

    if (charType.damage > 0) {
      tooltipText += `\n伤害: ${charType.damage}`;
    }
    if (charType.hp > 0) {
      tooltipText += `\n生命: ${charType.hp}`;
    }
    if (cooldown) {
      tooltipText += `\n冷却: ${Math.ceil(cooldown / 1000)}秒`;
    }

    card.title = tooltipText;
  }
}
