import { ABILITIES, BASE_CHARACTER, EQUIPMENT } from '../data/gameData';

const STORAGE_KEY = 'ple_project_game_state';

function loadState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load game state', error);
    return {};
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save game state', error);
  }
}

function getPlayerKey(userId, projectId) {
  return `${userId}:${projectId}`;
}

export function getAvailableAbilities() {
  return ABILITIES;
}

export function getAvailableEquipment() {
  return EQUIPMENT;
}

export function getPlayerCharacter(userId, projectId) {
  const state = loadState();
  const key = getPlayerKey(userId, projectId);
  if (!state[key]) {
    state[key] = {
      ...BASE_CHARACTER,
      inventory: {
        abilities: [...BASE_CHARACTER.inventory.abilities],
        equipment: [...BASE_CHARACTER.inventory.equipment],
      },
    };
    saveState(state);
  }
  return state[key];
}

export function updatePlayerCharacter(userId, projectId, updates) {
  const state = loadState();
  const key = getPlayerKey(userId, projectId);
  state[key] = {
    ...getPlayerCharacter(userId, projectId),
    ...updates,
  };
  saveState(state);
  return state[key];
}

export function acquireAbility(userId, projectId, abilityId, source = 'reward') {
  const character = getPlayerCharacter(userId, projectId);
  if (character.inventory.abilities.includes(abilityId)) return character;
  const updated = {
    ...character,
    inventory: {
      ...character.inventory,
      abilities: [...character.inventory.abilities, abilityId],
    },
  };
  updatePlayerCharacter(userId, projectId, updated);
  return updated;
}

export function acquireEquipment(userId, projectId, equipmentId, source = 'loot') {
  const character = getPlayerCharacter(userId, projectId);
  if (character.inventory.equipment.includes(equipmentId)) return character;
  const updated = {
    ...character,
    inventory: {
      ...character.inventory,
      equipment: [...character.inventory.equipment, equipmentId],
    },
  };
  updatePlayerCharacter(userId, projectId, updated);
  return updated;
}

export function equipAbility(userId, projectId, slotIndex, abilityId) {
  const character = getPlayerCharacter(userId, projectId);
  const newAbilities = [...character.abilities];
  newAbilities[slotIndex] = abilityId;
  const updated = { ...character, abilities: newAbilities };
  return updatePlayerCharacter(userId, projectId, updated);
}

export function equipEquipment(userId, projectId, slotKey, equipmentId) {
  const character = getPlayerCharacter(userId, projectId);
  const updated = {
    ...character,
    equipment: {
      ...character.equipment,
      [slotKey]: equipmentId,
    },
  };
  return updatePlayerCharacter(userId, projectId, updated);
}

export function calculateCharacterStats(character) {
  const base = { ...character.stats };
  const equippedItems = EQUIPMENT.filter((item) =>
    Object.values(character.equipment).includes(item.id)
  );
  return equippedItems.reduce((stats, item) => {
    return Object.entries(item.stats).reduce((current, [key, bonus]) => ({
      ...current,
      [key]: (current[key] ?? 0) + bonus,
    }), stats);
  }, base);
}

export function acquireFromQuest(userId, projectId, abilityId) {
  // Placeholder logic for a quest reward.
  return acquireAbility(userId, projectId, abilityId, 'quest');
}

export function acquireFromLoot(userId, projectId, equipmentId) {
  // Placeholder logic for loot drops.
  return acquireEquipment(userId, projectId, equipmentId, 'loot');
}
