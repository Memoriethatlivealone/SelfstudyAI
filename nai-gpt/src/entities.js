import { GRID, TILE, BOARD, TYPES, ZOMBIES } from './constants.js';

export function cellRect(row, col) {
  return { x: BOARD.left + col * (TILE.width + TILE.gap), y: BOARD.top + row * (TILE.height + TILE.gap), w: TILE.width, h: TILE.height };
}

export function addDefender(state, type, row, col) {
  if (state.defenders.some((d) => d.row === row && d.col === col)) return false;
  const spec = TYPES[type]; if (state.resource < spec.cost) return false;
  state.resource -= spec.cost; state.defenders.push({ type, row, col, hp: spec.hp, maxHp: spec.hp, cool: 300, pulse: 0 });
  state.floats.push({ x: cellRect(row, col).x + TILE.width / 2, y: cellRect(row, col).y, text: `-${spec.cost}`, color: '#ffef78', life: 900 }); return true;
}

export function collectResource(state, x, y) {
  const index = state.resources.findIndex((item) => Math.hypot(item.x - x, item.y - y) < 22);
  if (index < 0) return false;
  const item = state.resources.splice(index, 1)[0];
  state.resource = Math.min(999, state.resource + item.value);
  state.floats.push({ x: item.x, y: item.y, text: `+${item.value}`, color: '#fff39c', life: 900 });
  return true;
}

export function spawnWave(state) {
  state.wave += 1; state.waveStarted = true; state.waveCooldown = 0;
  const count = 5 + state.wave * 2; state.waveRemaining = count;
  state.spawnQueue = [];
  for (let i = 0; i < count; i += 1) {
    let type = 'basic'; const roll = Math.random();
    if (state.wave >= 3 && roll > 0.72) type = 'runner';
    if (state.wave >= 4 && roll > 0.86) type = 'shield';
    if (state.wave >= 7 && roll > 0.94) type = 'giant';
    state.spawnQueue.push({ type, delay: 500 + i * Math.max(320, 900 - state.wave * 45) });
  }
  state.message = `第 ${state.wave} 波来袭！`;
}

export function spawnZombie(state, type) {
  const spec = ZOMBIES[type]; const row = Math.floor(Math.random() * GRID.rows);
  state.zombies.push({ type, row, x: BOARD.left + GRID.cols * (TILE.width + TILE.gap) + 34, hp: spec.hp * (1 + (state.wave - 1) * 0.09), maxHp: spec.hp * (1 + (state.wave - 1) * 0.09), slow: 1, attackCool: 0, wobble: Math.random() * Math.PI * 2, hit: 0 });
}

export function updateEntities(state, dt) {
  const seconds = dt / 1000;
  if (state.playing && !state.paused) {
    state.resource = Math.min(999, state.resource + seconds * 4.5);
    state.resourceTimer -= dt;
    if (state.resourceTimer <= 0) {
      const row = Math.floor(Math.random() * GRID.rows); const col = Math.floor(Math.random() * GRID.cols);
      const q = cellRect(row, col); state.resources.push({ x: q.x + q.w / 2, y: q.y + q.h / 2, value: 25, pulse: Math.random() * 10 });
      state.resourceTimer = 5200 + Math.random() * 2500;
    }
    for (const item of state.spawnQueue) item.delay -= dt;
    if (state.spawnQueue[0] && state.spawnQueue[0].delay <= 0) { spawnZombie(state, state.spawnQueue.shift().type); }
    if (state.waveStarted && state.spawnQueue.length === 0 && state.zombies.length === 0) {
      if (state.wave >= 10) { state.playing = false; state.phase = 'victory'; state.message = '草地守护成功！'; }
      else { state.waveStarted = false; state.waveCooldown = 2200; state.message = '这一波守住了，下一波即将开始'; }
    }
    if (!state.waveStarted) { state.waveCooldown -= dt; if (state.waveCooldown <= 0) spawnWave(state); }
    for (const d of state.defenders) {
      d.cool -= dt; d.pulse += dt;
      const target = state.zombies.find((z) => z.row === d.row && z.x > cellRect(d.row, d.col).x + 20);
      const spec = TYPES[d.type];
      if (target && d.cool <= 0 && spec.damage > 0) {
        state.bullets.push({ x: cellRect(d.row, d.col).x + TILE.width * 0.75, y: cellRect(d.row, d.col).y + TILE.height * 0.42, row: d.row, damage: spec.damage, slow: spec.slow || 1, splash: spec.splash || 0, type: d.type, life: 1400 }); d.cool = spec.cooldown;
        state.particles.push({ x: cellRect(d.row, d.col).x + 50, y: cellRect(d.row, d.col).y + 35, color: spec.color, life: 220, kind: 'ring' });
      }
    }
    for (const b of state.bullets) {
      b.x += 240 * seconds; b.life -= dt;
      const hit = state.zombies.find((z) => z.row === b.row && Math.abs(z.x - b.x) < 18);
      if (hit) {
        hit.hp -= b.damage; hit.slow = Math.min(hit.slow, b.slow); hit.hit = 130;
        if (b.splash) state.zombies.filter((z) => z.row === b.row && Math.abs(z.x - hit.x) < b.splash).forEach((z) => { z.hp -= b.damage * 0.55; z.hit = 130; });
        state.particles.push({ x: hit.x, y: cellRect(hit.row, 0).y + 40, color: b.type === 'frost' ? '#c9f7ff' : b.type === 'flame' ? '#ff7b45' : '#fff1a6', life: 420, kind: b.type === 'flame' ? 'burst' : 'spark' });
        b.life = 0; beepHit(state, b.type);
      }
    }
    state.bullets = state.bullets.filter((b) => b.life > 0 && b.x < 850);
    for (const z of state.zombies) {
      z.wobble += seconds * 4; z.hit = Math.max(0, z.hit - dt); z.attackCool -= dt; z.slow = Math.min(1, z.slow + seconds * 0.07);
      const zLeft = z.x - ZOMBIES[z.type].size; const blocked = state.defenders.find((d) => d.row === z.row && zLeft < cellRect(d.row, d.col).x + TILE.width * 0.8 && zLeft > cellRect(d.row, d.col).x - 10);
      if (blocked) { if (z.attackCool <= 0) { blocked.hp -= ZOMBIES[z.type].damage; z.attackCool = 900; blocked.pulse = 0; state.particles.push({ x: z.x, y: cellRect(z.row, 0).y + 38, color: '#ff5c68', life: 250, kind: 'spark' }); } }
      else { z.x -= ZOMBIES[z.type].speed * z.slow * seconds; }
    }
    state.defenders = state.defenders.filter((d) => d.hp > 0);
    for (const z of state.zombies) { if (z.x < BOARD.left - 8) { state.playing = false; state.phase = 'gameover'; state.message = '僵尸冲破了左侧防线！'; beep(state, 110, 0.22, 'sawtooth'); } }
    const dead = state.zombies.filter((z) => z.hp <= 0); dead.forEach((z) => { state.resource = Math.min(999, state.resource + ZOMBIES[z.type].reward); state.defeated += 1; state.floats.push({ x: z.x, y: cellRect(z.row, 0).y + 24, text: `+${ZOMBIES[z.type].reward}`, color: '#ffe072', life: 900 }); state.particles.push({ x: z.x, y: cellRect(z.row, 0).y + 40, color: ZOMBIES[z.type].color, life: 650, kind: 'burst' }); });
    state.zombies = state.zombies.filter((z) => z.hp > 0);
  }
  if (!state.paused) {
    state.particles.forEach((p) => { p.life -= dt; }); state.particles = state.particles.filter((p) => p.life > 0);
    state.floats.forEach((f) => { f.life -= dt; f.y -= 16 * seconds; }); state.floats = state.floats.filter((f) => f.life > 0);
  }
}

function beepHit(state, type) { const frequency = type === 'frost' ? 680 : type === 'flame' ? 180 : 440; beep(state.sound, frequency, 0.04, type === 'flame' ? 'square' : 'sine'); }
function beep(state, frequency, duration, type) { if (state.sound) import('./audio.js').then(({ beep: tone }) => tone(true, frequency, duration, type)); }
