// 角色类型配置
export const characterTypes = [
  {
    type: 'normal',
    name: '普通奶龙',
    cost: 100,
    cooldown: 5000,
    hp: 100,
    damage: 20,
    attackSpeed: 1000,
    attackRange: 500,
    size: 30,
    color: '#4169E1',
    bulletColor: '#1E90FF',
    effect: null
  },
  {
    type: 'ice',
    name: '冰霜奶龙',
    cost: 150,
    cooldown: 7000,
    hp: 80,
    damage: 15,
    attackSpeed: 1500,
    attackRange: 500,
    size: 30,
    color: '#00CED1',
    bulletColor: '#00FFFF',
    effect: 'slow'
  },
  {
    type: 'fire',
    name: '火焰奶龙',
    cost: 175,
    cooldown: 8000,
    hp: 90,
    damage: 30,
    attackSpeed: 2000,
    attackRange: 450,
    size: 32,
    color: '#FF4500',
    bulletColor: '#FF6347',
    effect: 'splash'
  },
  {
    type: 'wall',
    name: '坚果奶龙',
    cost: 50,
    cooldown: 10000,
    hp: 300,
    damage: 0,
    attackSpeed: 0,
    attackRange: 0,
    size: 35,
    color: '#8B4513',
    bulletColor: null,
    effect: null
  }
];
