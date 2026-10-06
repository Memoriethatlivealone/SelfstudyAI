// 僵尸类型配置
export const zombieTypes = [
  {
    type: 'normal',
    name: '普通僵尸',
    hp: 100,
    speed: 20,
    damage: 10,
    attackSpeed: 1000,
    size: 30,
    color: '#7CFC00',
    reward: 25
  },
  {
    type: 'fast',
    name: '快速僵尸',
    hp: 60,
    speed: 40,
    damage: 8,
    attackSpeed: 800,
    size: 28,
    color: '#FF69B4',
    reward: 30
  },
  {
    type: 'tank',
    name: '防御僵尸',
    hp: 200,
    speed: 15,
    damage: 15,
    attackSpeed: 1500,
    size: 35,
    color: '#808080',
    reward: 50
  },
  {
    type: 'giant',
    name: '巨型僵尸',
    hp: 300,
    speed: 10,
    damage: 20,
    attackSpeed: 2000,
    size: 40,
    color: '#8B008B',
    reward: 75
  }
];
