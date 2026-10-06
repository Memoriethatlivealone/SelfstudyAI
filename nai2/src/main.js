// 游戏主入口文件
import { GameState } from './game/GameState.js';
import { Renderer } from './game/Renderer.js';
import { InputHandler } from './game/InputHandler.js';
import { AudioManager } from './game/AudioManager.js';
import { characterTypes } from './game/CharacterTypes.js';

// 全局游戏对象
let gameState = null;
let renderer = null;
let inputHandler = null;
let audioManager = null;
let animationId = null;

// DOM元素
const elements = {
  startScreen: document.getElementById('start-screen'),
  gameScreen: document.getElementById('game-screen'),
  pauseScreen: document.getElementById('pause-screen'),
  victoryScreen: document.getElementById('victory-screen'),
  defeatScreen: document.getElementById('defeat-screen'),
  startBtn: document.getElementById('start-btn'),
  pauseBtn: document.getElementById('pause-btn'),
  restartBtn: document.getElementById('restart-btn'),
  resumeBtn: document.getElementById('resume-btn'),
  soundToggle: document.getElementById('sound-toggle'),
  canvas: document.getElementById('game-canvas'),
  cardPanel: document.getElementById('card-panel'),
  resourceCount: document.getElementById('resource-count'),
  waveCount: document.getElementById('wave-count'),
  killCount: document.getElementById('kill-count')
};

// 初始化游戏
function init() {
  console.log('游戏初始化中...');

  // 创建音效管理器
  audioManager = new AudioManager();

  // 设置画布尺寸
  setupCanvas();

  // 创建角色卡片
  createCharacterCards();

  // 绑定事件监听器
  bindEventListeners();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);

  console.log('游戏初始化完成');
}

// 设置画布尺寸
function setupCanvas() {
  const container = elements.canvas.parentElement;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // 设置游戏区域尺寸（保持16:9比例）
  const aspectRatio = 16 / 9;
  let canvasWidth = containerWidth - 40;
  let canvasHeight = canvasWidth / aspectRatio;

  if (canvasHeight > containerHeight - 40) {
    canvasHeight = containerHeight - 40;
    canvasWidth = canvasHeight * aspectRatio;
  }

  // 确保最小尺寸
  canvasWidth = Math.max(800, canvasWidth);
  canvasHeight = Math.max(450, canvasHeight);

  elements.canvas.width = canvasWidth;
  elements.canvas.height = canvasHeight;

  console.log(`画布尺寸: ${canvasWidth}x${canvasHeight}`);
}

// 处理窗口大小变化
function handleResize() {
  setupCanvas();
  if (renderer) {
    renderer.updateCanvasSize();
  }
}

// 创建角色卡片
function createCharacterCards() {
  elements.cardPanel.innerHTML = '';

  characterTypes.forEach(charType => {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.type = charType.type;

    // 创建预览画布
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = 100;
    previewCanvas.height = 60;
    previewCanvas.className = 'card-preview';

    const ctx = previewCanvas.getContext('2d');
    drawCharacterPreview(ctx, charType, 50, 30);

    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = charType.name;

    const cost = document.createElement('div');
    cost.className = 'card-cost';
    cost.textContent = `☀️ ${charType.cost}`;

    card.appendChild(previewCanvas);
    card.appendChild(name);
    card.appendChild(cost);

    elements.cardPanel.appendChild(card);
  });
}

// 绘制角色预览
function drawCharacterPreview(ctx, charType, x, y) {
  const size = charType.size || 30;

  ctx.save();

  // 绘制不同类型的角色
  switch (charType.type) {
    case 'normal':
      // 普通奶龙 - 蓝色圆形龙
      ctx.fillStyle = '#4169E1';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      // 眼睛
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x - 8, y - 5, 4, 0, Math.PI * 2);
      ctx.arc(x + 8, y - 5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x - 8, y - 5, 2, 0, Math.PI * 2);
      ctx.arc(x + 8, y - 5, 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'ice':
      // 冰霜奶龙 - 青色菱形龙
      ctx.fillStyle = '#00CED1';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.7);
      ctx.lineTo(x + size * 0.7, y);
      ctx.lineTo(x, y + size * 0.7);
      ctx.lineTo(x - size * 0.7, y);
      ctx.closePath();
      ctx.fill();
      // 冰晶效果
      ctx.strokeStyle = '#E0FFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case 'fire':
      // 火焰奶龙 - 红色三角形龙
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.8);
      ctx.lineTo(x + size * 0.7, y + size * 0.6);
      ctx.lineTo(x - size * 0.7, y + size * 0.6);
      ctx.closePath();
      ctx.fill();
      // 火焰效果
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y - 5, 6, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'wall':
      // 坚果奶龙 - 棕色方形龙
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - size * 0.6, y - size * 0.6, size * 1.2, size * 1.2);
      ctx.strokeStyle = '#D2691E';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - size * 0.6, y - size * 0.6, size * 1.2, size * 1.2);
      // 盾牌标志
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}

// 绑定事件监听器
function bindEventListeners() {
  // 开始游戏
  elements.startBtn.addEventListener('click', startGame);

  // 暂停游戏
  elements.pauseBtn.addEventListener('click', togglePause);

  // 重新开始
  elements.restartBtn.addEventListener('click', restartGame);
  document.getElementById('restart-from-pause-btn').addEventListener('click', restartGame);
  document.getElementById('restart-from-victory-btn').addEventListener('click', restartGame);
  document.getElementById('restart-from-defeat-btn').addEventListener('click', restartGame);

  // 继续游戏
  elements.resumeBtn.addEventListener('click', togglePause);

  // 音效开关
  elements.soundToggle.addEventListener('click', toggleSound);

  // 键盘快捷键
  document.addEventListener('keydown', handleKeyboard);

  // 右键菜单禁用（游戏区域）
  elements.canvas.addEventListener('contextmenu', e => e.preventDefault());
}

// 开始游戏
function startGame() {
  console.log('开始游戏');

  // 隐藏开始界面，显示游戏界面
  elements.startScreen.style.display = 'none';
  elements.gameScreen.style.display = 'flex';

  // 创建游戏状态
  gameState = new GameState(elements.canvas.width, elements.canvas.height);

  // 创建渲染器
  renderer = new Renderer(elements.canvas, gameState);

  // 创建输入处理器
  inputHandler = new InputHandler(
    elements.canvas,
    elements.cardPanel,
    gameState,
    renderer,
    audioManager,
    updateUI
  );

  // 连接renderer和inputHandler
  renderer.inputHandler = inputHandler;

  // 设置游戏回调
  gameState.onGameOver = handleGameOver;
  gameState.onVictory = handleVictory;

  // 播放开始音效
  audioManager.playStart();

  // 开始游戏循环
  gameLoop();
}

// 游戏循环
function gameLoop() {
  if (!gameState || !renderer) return;

  if (!gameState.isPaused) {
    // 更新游戏状态
    gameState.update();

    // 更新UI
    updateUI();
  }

  // 渲染游戏
  renderer.render();

  // 继续循环
  animationId = requestAnimationFrame(gameLoop);
}

// 更新UI显示
function updateUI() {
  if (!gameState) return;

  elements.resourceCount.textContent = gameState.resources;
  elements.waveCount.textContent = gameState.wave;
  elements.killCount.textContent = gameState.kills;

  // 更新卡片状态
  updateCardStates();
}

// 更新卡片状态
function updateCardStates() {
  const cards = elements.cardPanel.querySelectorAll('.character-card');

  cards.forEach(card => {
    const type = card.dataset.type;
    const charType = characterTypes.find(ct => ct.type === type);

    if (!charType) return;

    // 检查资源是否足够
    if (gameState.resources >= charType.cost) {
      card.classList.remove('disabled');
    } else {
      card.classList.add('disabled');
    }

    // 检查冷却时间
    const cooldown = gameState.cardCooldowns.get(type) || 0;
    let cooldownDiv = card.querySelector('.card-cooldown');

    if (cooldown > 0) {
      if (!cooldownDiv) {
        cooldownDiv = document.createElement('div');
        cooldownDiv.className = 'card-cooldown';
        card.appendChild(cooldownDiv);
      }
      cooldownDiv.textContent = Math.ceil(cooldown / 1000);
    } else if (cooldownDiv) {
      cooldownDiv.remove();
    }
  });
}

// 暂停/继续游戏
function togglePause() {
  if (!gameState) return;

  gameState.isPaused = !gameState.isPaused;

  if (gameState.isPaused) {
    elements.pauseBtn.textContent = '▶️ 继续';
    elements.pauseScreen.style.display = 'flex';
    audioManager.playPause();
  } else {
    elements.pauseBtn.textContent = '⏸️ 暂停';
    elements.pauseScreen.style.display = 'none';
    audioManager.playResume();
  }
}

// 重新开始游戏
function restartGame() {
  console.log('重新开始游戏');

  // 停止游戏循环
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  // 清理输入处理器
  if (inputHandler) {
    inputHandler.cleanup();
    inputHandler = null;
  }

  // 重置游戏状态
  gameState = null;
  renderer = null;

  // 隐藏所有覆盖层
  elements.pauseScreen.style.display = 'none';
  elements.victoryScreen.style.display = 'none';
  elements.defeatScreen.style.display = 'none';

  // 重置暂停按钮
  elements.pauseBtn.textContent = '⏸️ 暂停';

  // 重新开始游戏
  startGame();
}

// 游戏失败
function handleGameOver() {
  console.log('游戏失败');

  // 停止游戏循环
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  // 显示失败界面
  document.getElementById('defeat-wave').textContent = gameState.wave;
  document.getElementById('defeat-kills').textContent = gameState.kills;
  elements.defeatScreen.style.display = 'flex';

  // 播放失败音效
  audioManager.playDefeat();
}

// 游戏胜利
function handleVictory() {
  console.log('游戏胜利');

  // 停止游戏循环
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  // 显示胜利界面
  document.getElementById('final-wave').textContent = gameState.wave;
  document.getElementById('final-kills').textContent = gameState.kills;
  elements.victoryScreen.style.display = 'flex';

  // 播放胜利音效
  audioManager.playVictory();
}

// 音效开关
function toggleSound() {
  audioManager.toggleMute();
  elements.soundToggle.textContent = audioManager.isMuted ? '🔇 音效' : '🔊 音效';
}

// 键盘处理
function handleKeyboard(e) {
  if (e.key === 'p' || e.key === 'P') {
    if (gameState && !gameState.isGameOver) {
      togglePause();
    }
  } else if (e.key === 'r' || e.key === 'R') {
    if (gameState) {
      restartGame();
    }
  } else if (e.key === 'Escape') {
    if (inputHandler) {
      inputHandler.cancelSelection();
    }
  }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);
