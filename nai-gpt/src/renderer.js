import { BOARD, GRID, TILE, TYPES, ZOMBIES } from './constants.js';
import { cellRect } from './entities.js';

export function drawGame(ctx, canvas, state) {
  const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect();
  if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) { canvas.width = Math.floor(rect.width * dpr); canvas.height = Math.floor(rect.height * dpr); }
  const logicalWidth = 760; const logicalHeight = 496; ctx.setTransform(dpr * rect.width / logicalWidth, 0, 0, dpr * rect.height / logicalHeight, 0, 0);
  ctx.clearRect(0, 0, logicalWidth, logicalHeight); drawBackdrop(ctx, logicalWidth, logicalHeight); drawBoard(ctx, state); drawResources(ctx, state); drawDefenders(ctx, state); drawPreview(ctx, state); drawZombies(ctx, state); drawBullets(ctx, state); drawParticles(ctx, state); drawFloaters(ctx, state);
}

function drawBackdrop(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#b7efff'); sky.addColorStop(0.43, '#e8fbff'); sky.addColorStop(0.44, '#9edc83'); sky.addColorStop(1, '#5bb76f'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff'; ctx.globalAlpha = .58; [[90, 46, 28], [250, 30, 22], [620, 55, 34], [840, 22, 26]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.arc(x + r * .8, y + 3, r * .7, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1;
  ctx.fillStyle = '#5cab68'; for (let x = 0; x < w; x += 22) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + 8, h - 24 - (x % 36)); ctx.lineTo(x + 13, h); ctx.fill(); }
}

function drawBoard(ctx, state) {
  ctx.fillStyle = 'rgba(25, 91, 54, .2)'; ctx.fillRect(18, 14, 732, 468);
  for (let r = 0; r < GRID.rows; r += 1) for (let c = 0; c < GRID.cols; c += 1) {
    const q = cellRect(r, c); ctx.fillStyle = r % 2 ? '#aee485' : '#b9ec91'; ctx.fillRect(q.x, q.y, q.w, q.h); ctx.strokeStyle = 'rgba(45, 124, 70, .35)'; ctx.lineWidth = 2; ctx.strokeRect(q.x + 1, q.y + 1, q.w - 2, q.h - 2);
    ctx.fillStyle = 'rgba(74, 155, 77, .22)'; ctx.beginPath(); ctx.arc(q.x + 14 + (c * 7) % 42, q.y + 60, 3, 0, Math.PI * 2); ctx.fill();
  }
  if (state.hoverCell) { const q = cellRect(state.hoverCell.row, state.hoverCell.col); ctx.fillStyle = 'rgba(255, 252, 174, .58)'; ctx.fillRect(q.x, q.y, q.w, q.h); }
}

function drawDefenders(ctx, state) { state.defenders.forEach((d) => { const q = cellRect(d.row, d.col); drawDragon(ctx, q.x + 38, q.y + 40, d.type, 1, d.pulse); drawBar(ctx, q.x + 10, q.y + 72, 56, 5, d.hp / d.maxHp, '#55d66f'); }); }
function drawPreview(ctx, state) { if (!state.selectedType || !state.hoverCell || state.defenders.some((d) => d.row === state.hoverCell.row && d.col === state.hoverCell.col)) return; const q = cellRect(state.hoverCell.row, state.hoverCell.col); ctx.globalAlpha = 0.42; drawDragon(ctx, q.x + 38, q.y + 40, state.selectedType, 1, 0); ctx.globalAlpha = 1; }
function drawResources(ctx, state) { state.resources.forEach((item) => { if (!state.paused) item.pulse += 0.08; const bob = Math.sin(item.pulse) * 3; ctx.save(); ctx.translate(item.x, item.y + bob); ctx.shadowColor = '#fff09a'; ctx.shadowBlur = 13; ctx.fillStyle = '#ffd74f'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#fff7bf'; ctx.beginPath(); ctx.arc(-4, -4, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#92652e'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+25', 0, 29); ctx.restore(); }); }
function drawDragon(ctx, x, y, type, scale, pulse) {
  const spec = TYPES[type]; const bob = Math.sin(pulse / 180) * 2; ctx.save(); ctx.translate(x, y + bob); ctx.scale(scale, scale); ctx.fillStyle = spec.accent; ctx.beginPath(); ctx.ellipse(-2, 19, 24, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = spec.color; ctx.beginPath(); ctx.ellipse(0, 0, 23, 25, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-8, -5, 7, 0, Math.PI * 2); ctx.arc(8, -5, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#24334c'; ctx.beginPath(); ctx.arc(-7, -4, 3, 0, Math.PI * 2); ctx.arc(7, -4, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = spec.accent; ctx.beginPath(); ctx.moveTo(-18, -17); ctx.lineTo(-28, -33); ctx.lineTo(-8, -23); ctx.moveTo(18, -17); ctx.lineTo(28, -33); ctx.lineTo(8, -23); ctx.fill(); ctx.strokeStyle = '#3e3442'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 5, 9, 0.2, Math.PI - .2); ctx.stroke(); if (type === 'nut') { ctx.strokeStyle = '#744b27'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.stroke(); } ctx.restore();
}

function drawZombies(ctx, state) { state.zombies.forEach((z) => { const spec = ZOMBIES[z.type]; const y = cellRect(z.row, 0).y + 40 + Math.sin(z.wobble) * 2; ctx.save(); ctx.translate(z.x, y); ctx.fillStyle = z.hit ? '#fff' : spec.color; ctx.beginPath(); ctx.ellipse(0, 5, spec.size, spec.size + 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = spec.accent; ctx.fillRect(-spec.size * .72, -spec.size - 8, spec.size * 1.44, 10); ctx.fillStyle = '#f7f0d0'; ctx.beginPath(); ctx.arc(-8, -5, 6, 0, Math.PI * 2); ctx.arc(8, -5, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#332b46'; ctx.beginPath(); ctx.arc(-8, -4, 2, 0, Math.PI * 2); ctx.arc(8, -4, 2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#392641'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, 11); ctx.lineTo(0, 15); ctx.lineTo(8, 11); ctx.stroke(); if (z.type === 'shield') { ctx.strokeStyle = '#3f5193'; ctx.lineWidth = 5; ctx.strokeRect(-spec.size - 8, -5, 9, 30); } if (z.type === 'giant') { ctx.fillStyle = '#d7a4e0'; ctx.beginPath(); ctx.arc(0, -spec.size - 10, 10, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); drawBar(ctx, z.x - spec.size, y - spec.size - 19, spec.size * 2, 5, z.hp / z.maxHp, '#ff5d69'); }); }

function drawBullets(ctx, state) { state.bullets.forEach((b) => { ctx.fillStyle = b.type === 'frost' ? '#e2fbff' : b.type === 'flame' ? '#ff6c3d' : '#fff3a7'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(b.x, b.y, b.type === 'flame' ? 9 : 6, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }); }
function drawParticles(ctx, state) { state.particles.forEach((p) => { ctx.globalAlpha = Math.max(0, p.life / 650); ctx.strokeStyle = p.color; ctx.fillStyle = p.color; if (p.kind === 'ring') { ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 24 - p.life / 25, 0, Math.PI * 2); ctx.stroke(); } else if (p.kind === 'burst') { ctx.beginPath(); ctx.arc(p.x, p.y, 18 + (650 - p.life) / 10, 0, Math.PI * 2); ctx.fill(); } else { ctx.fillRect(p.x - 3, p.y - 3, 6, 6); } ctx.globalAlpha = 1; }); }
function drawFloaters(ctx, state) { state.floats.forEach((f) => { ctx.globalAlpha = Math.min(1, f.life / 280); ctx.fillStyle = f.color; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.text, f.x, f.y); ctx.globalAlpha = 1; }); }
function drawBar(ctx, x, y, w, h, ratio, color) { ctx.fillStyle = 'rgba(35, 49, 59, .45)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = color; ctx.fillRect(x, y, Math.max(0, w * Math.max(0, ratio)), h); }
