import { BOARD, GRID, TILE } from './constants.js';
import { addDefender, cellRect, collectResource } from './entities.js';
import { beep } from './audio.js';

export function bindInput(ui, state, canvas, onStart, onRestart, onTogglePause) {
  ui.cards.addEventListener('click', (e) => { const card = e.target.closest('.card'); if (!card || !state.playing || state.paused) return; state.selectedType = card.dataset.type; beep(state.sound, 520, .05); });
  ui.startBtn.addEventListener('click', onStart); ui.restartBtn.addEventListener('click', onRestart); ui.pauseBtn.addEventListener('click', onTogglePause); ui.soundBtn.addEventListener('click', () => { state.sound = !state.sound; });
  canvas.addEventListener('mousemove', (e) => { state.hoverCell = pointToCell(canvas, e); }); canvas.addEventListener('mouseleave', () => { state.hoverCell = null; });
  canvas.addEventListener('click', (e) => { if (!state.playing || state.paused) return; const point = pointToPoint(canvas, e); if (collectResource(state, point.x, point.y)) { beep(state.sound, 900, .08); return; } const cell = pointToCell(canvas, e); if (!cell) return; if (state.selectedType && addDefender(state, state.selectedType, cell.row, cell.col)) { beep(state.sound, 730, .07); state.selectedType = null; } });
  canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); state.selectedType = null; });
  window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'p') onTogglePause(); if (e.key.toLowerCase() === 'r') onRestart(); if (e.key === 'Escape') state.selectedType = null; });
}

function pointToPoint(canvas, event) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * 760 / rect.width, y: (event.clientY - rect.top) * 496 / rect.height }; }
function pointToCell(canvas, event) { const { x, y } = pointToPoint(canvas, event); const col = Math.floor((x - BOARD.left) / (TILE.width + TILE.gap)); const row = Math.floor((y - BOARD.top) / (TILE.height + TILE.gap)); if (row < 0 || row >= GRID.rows || col < 0 || col >= GRID.cols) return null; const q = cellRect(row, col); if (x > q.x + q.w || y > q.y + q.h) return null; return { row, col }; }
