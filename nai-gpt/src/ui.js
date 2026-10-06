import { TYPES } from './constants.js';

export function buildUI(root) {
  root.innerHTML = `
    <div class="shell">
      <header class="topbar"><div class="brand"><span class="brand-mark">奶</span><div><h1>奶龙大战僵尸</h1><small>草地守护计划 · 原创卡通防守游戏</small></div></div><div class="stats"><div><b id="resource">150</b><span>能量果</span></div><div><b id="wave">0 / 10</b><span>波次</span></div><div><b id="defeated">0</b><span>击败</span></div><button id="soundBtn" class="icon-btn" title="切换音效">♫</button><button id="pauseBtn" class="button secondary">暂停 P</button><button id="restartBtn" class="button secondary">重新开始 R</button></div></header>
      <main class="layout"><aside class="sidebar"><div class="panel-head"><h2>奶龙队伍</h2><span>点击后部署</span></div><div id="cards" class="cards"></div><div class="tips"><h3>游戏说明</h3><p>收集能量果，部署奶龙守住 5 条路线。僵尸会从右侧出现，别让它们抵达左边！</p><p>普通攻击、冰霜减速、火焰范围、坚果阻挡，各司其职才能撑过 10 波。</p><div class="key-row"><kbd>P</kbd>暂停 <kbd>R</kbd>重开 <kbd>Esc</kbd>取消</div></div><div id="status" class="status">准备开始</div></aside><section class="game-wrap"><div class="canvas-frame"><canvas id="gameCanvas" aria-label="奶龙大战僵尸战斗地图"></canvas><div id="overlay" class="overlay"><div class="overlay-card"><div class="hero-emoji">奶</div><h2 id="overlayTitle">奶龙大战僵尸</h2><p id="overlayText">组建你的奶龙小队，守护草地家园！</p><button id="startBtn" class="button primary">开始游戏</button></div></div></div><div class="legend"><span><i class="dot basic"></i>普通</span><span><i class="dot frost"></i>冰霜</span><span><i class="dot flame"></i>火焰</span><span><i class="dot nut"></i>坚果</span><span class="hint">右键或 Esc 取消部署 · 悬停格子查看预览</span></div></section></main>
    </div>`;
  const cards = root.querySelector('#cards'); Object.entries(TYPES).forEach(([key, spec]) => { const el = document.createElement('button'); el.className = `card ${key}`; el.dataset.type = key; el.title = `${spec.name}：${spec.kind}，消耗 ${spec.cost} 能量果`; el.innerHTML = `<span class="mini-dragon">奶</span><span class="card-copy"><b>${spec.name}</b><small>${spec.kind} · ${spec.cost} 能量果</small></span>`; cards.appendChild(el); });
  return { canvas: root.querySelector('#gameCanvas'), cards, startBtn: root.querySelector('#startBtn'), pauseBtn: root.querySelector('#pauseBtn'), restartBtn: root.querySelector('#restartBtn'), soundBtn: root.querySelector('#soundBtn'), overlay: root.querySelector('#overlay'), overlayTitle: root.querySelector('#overlayTitle'), overlayText: root.querySelector('#overlayText'), resource: root.querySelector('#resource'), wave: root.querySelector('#wave'), defeated: root.querySelector('#defeated'), status: root.querySelector('#status') };
}

export function updateUI(ui, state) {
  ui.resource.textContent = Math.floor(state.resource); ui.wave.textContent = `${state.wave} / 10`; ui.defeated.textContent = state.defeated; ui.pauseBtn.textContent = state.paused ? '继续 P' : '暂停 P'; ui.soundBtn.textContent = state.sound ? '♫' : '静音';
  ui.cards.querySelectorAll('.card').forEach((el) => el.classList.toggle('selected', el.dataset.type === state.selectedType));
  ui.status.textContent = state.paused ? '游戏已暂停' : state.message;
  if (state.phase === 'menu') { ui.overlay.classList.remove('hidden'); ui.overlayTitle.textContent = '奶龙大战僵尸'; ui.overlayText.textContent = '组建你的奶龙小队，守护草地家园！'; ui.startBtn.textContent = '开始游戏'; }
  else if (state.phase === 'victory') { ui.overlay.classList.remove('hidden'); ui.overlayTitle.textContent = '守护成功！'; ui.overlayText.textContent = `你完成了 10 波挑战，击败 ${state.defeated} 个僵尸。`; ui.startBtn.textContent = '再来一局'; }
  else if (state.phase === 'gameover') { ui.overlay.classList.remove('hidden'); ui.overlayTitle.textContent = '防线失守'; ui.overlayText.textContent = `坚持到第 ${state.wave} 波，击败 ${state.defeated} 个僵尸。`; ui.startBtn.textContent = '重新挑战'; }
  else ui.overlay.classList.add('hidden');
}
