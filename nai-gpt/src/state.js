import { MAX_WAVE } from './constants.js';

export function createState() {
  return {
    phase: 'menu', playing: false, paused: false, resource: 150, wave: 0, defeated: 0,
    spawnQueue: [], spawnTimer: 0, resourceTimer: 4200, waveStarted: false, waveRemaining: 0, waveCooldown: 0,
    selectedType: null, hoverCell: null, sound: true, lastTime: 0,
    defenders: [], zombies: [], bullets: [], particles: [], resources: [], floats: [],
    message: '准备好守护奶龙草地了吗？',
  };
}

export function resetState(state) {
  const fresh = createState();
  Object.keys(fresh).forEach((key) => { state[key] = fresh[key]; });
}

export function isVictory(state) { return state.wave >= MAX_WAVE && state.zombies.length === 0 && state.spawnQueue.length === 0; }
