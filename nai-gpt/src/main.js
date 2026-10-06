import './styles.css';
import { createState, resetState } from './state.js';
import { buildUI, updateUI } from './ui.js';
import { bindInput } from './input.js';
import { updateEntities } from './entities.js';
import { drawGame } from './renderer.js';

const root = document.querySelector('#app'); const ui = buildUI(root); const state = createState(); const ctx = ui.canvas.getContext('2d');
function startGame() { resetState(state); state.playing = true; state.phase = 'playing'; state.message = '点击左侧卡片，再点击草地格子部署奶龙'; }
function restartGame() { resetState(state); state.playing = true; state.phase = 'playing'; state.message = '新的挑战开始了！'; }
function togglePause() { if (!state.playing) return; state.paused = !state.paused; }
bindInput(ui, state, ui.canvas, startGame, restartGame, togglePause);
let last = performance.now();
function loop(now) { const dt = Math.min(50, now - last); last = now; updateEntities(state, dt); drawGame(ctx, ui.canvas, state); updateUI(ui, state); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
