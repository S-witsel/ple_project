export const STAT_KEYS = ['health', 'attack', 'magicAttack', 'armor', 'magicDefense', 'speed'];

export const ABILITIES = [
  {
    id: 'fireball',
    name: 'Fireball',
    type: 'magic',
    power: 18,
    description: 'Launch a small fire projectile at an enemy.',
  },
  {
    id: 'power-strike',
    name: 'Power Strike',
    type: 'physical',
    power: 14,
    description: 'A strong melee attack that deals physical damage.',
  },
  {
    id: 'healing-touch',
    name: 'Healing Touch',
    type: 'magic',
    power: 0,
    description: 'Restore a small amount of health to yourself.',
  },
  {
    id: 'ice-shard',
    name: 'Ice Shard',
    type: 'magic',
    power: 16,
    description: 'Throw a shard of ice that pierces through defenses.',
  },
  {
    id: 'quick-slash',
    name: 'Quick Slash',
    type: 'physical',
    power: 12,
    description: 'A rapid attack with increased speed.',
  },
  {
    id: 'arcane-burst',
    name: 'Arcane Burst',
    type: 'magic',
    power: 22,
    description: 'A burst of arcane energy that hits hard.',
  },
];

export const EQUIPMENT = [
  {
    id: 'leather-helm',
    name: 'Leather Helm',
    slot: 'head',
    stats: { armor: 2, magicDefense: 1, speed: 1 },
    description: 'A lightweight helmet that protects the head.',
  },
  {
    id: 'iron-plate',
    name: 'Iron Plate',
    slot: 'torso',
    stats: { armor: 5, magicDefense: 2, speed: -1 },
    description: 'Heavy armor that increases physical defense.',
  },
  {
    id: 'swift-gauntlets',
    name: 'Swift Gauntlets',
    slot: 'arms',
    stats: { attack: 2, speed: 3 },
    description: 'Gauntlets that improve attack speed.',
  },
  {
    id: 'sturdy-greaves',
    name: 'Sturdy Greaves',
    slot: 'legs',
    stats: { armor: 3, health: 10 },
    description: 'Leg armor that adds health and protection.',
  },
  {
    id: 'mystic-cowl',
    name: 'Mystic Cowl',
    slot: 'head',
    stats: { magicAttack: 3, magicDefense: 2 },
    description: 'A magical hood that amplifies spellcasting.',
  },
];

export const BASE_CHARACTER = {
  stats: {
    health: 100,
    attack: 10,
    magicAttack: 10,
    armor: 5,
    magicDefense: 5,
    speed: 10,
  },
  abilities: [null, null, null, null],
  equipment: {
    head: null,
    torso: null,
    arms: null,
    legs: null,
  },
  inventory: {
    abilities: ['fireball', 'quick-slash'],
    equipment: ['leather-helm', 'swift-gauntlets'],
  },
};
