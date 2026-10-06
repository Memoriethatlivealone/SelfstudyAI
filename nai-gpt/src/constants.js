export const GRID = { rows: 5, cols: 9 };
export const TILE = { width: 76, height: 86, gap: 7 };
export const BOARD = { left: 28, top: 24 };
export const TYPES = {
  basic: { name: '普通奶龙', cost: 50, color: '#ffce52', accent: '#e88b27', hp: 100, cooldown: 1050, damage: 22, kind: '射手' },
  frost: { name: '冰霜奶龙', cost: 75, color: '#8be6ff', accent: '#278ac8', hp: 88, cooldown: 1450, damage: 14, slow: 0.48, kind: '减速' },
  flame: { name: '火焰奶龙', cost: 100, color: '#ff845f', accent: '#d83f32', hp: 92, cooldown: 1850, damage: 40, splash: 78, kind: '范围' },
  nut: { name: '坚果奶龙', cost: 60, color: '#bd914e', accent: '#79552c', hp: 360, cooldown: 99999, damage: 0, kind: '阻挡' },
};
export const ZOMBIES = {
  basic: { name: '普通僵尸', color: '#8bcf76', accent: '#4e8c62', hp: 105, speed: 17, damage: 19, reward: 12, size: 22 },
  runner: { name: '快速僵尸', color: '#f6a95d', accent: '#c76732', hp: 75, speed: 30, damage: 14, reward: 15, size: 19 },
  shield: { name: '防御僵尸', color: '#8c9ee7', accent: '#4f5fa9', hp: 210, speed: 11, damage: 26, reward: 20, size: 25 },
  giant: { name: '大型僵尸', color: '#bd79c9', accent: '#793f91', hp: 430, speed: 8, damage: 36, reward: 38, size: 31 },
};
export const MAX_WAVE = 10;
