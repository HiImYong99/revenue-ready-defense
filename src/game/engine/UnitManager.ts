import { useGameStore } from '@/store/gameStore';
import { DROP_TABLE, SUMMON_COST, TIER_UNITS } from '../data/dropTable';
import { UNITS, RECIPES } from '../data/unitData';

export const UnitManager = {
  summonUnit: (forcedTier?: string) => {
    const store = useGameStore.getState();
    if (store.silver < SUMMON_COST && !forcedTier) {
      alert("Not enough silver!");
      return null;
    }

    if (!forcedTier) {
      store.deductSilver(SUMMON_COST);
    }

    let selectedTier = forcedTier;
    if (!selectedTier) {
      const rand = store.nextRandom();
      let cumProb = 0;
      for (const drop of DROP_TABLE) {
        cumProb += drop.probability;
        if (rand <= cumProb) {
          selectedTier = drop.tier;
          break;
        }
      }
    }

    if (!selectedTier) selectedTier = 'Normal';

    // @ts-expect-error TIER_UNITS typing vs dynamic string indexing
    const availableUnits = TIER_UNITS[selectedTier];
    if (availableUnits.length === 0) return null;

    const randomUnitId = availableUnits[Math.floor(store.nextRandom() * availableUnits.length)];

    // Spawn in a 3x3 grid (approximate positions)
    const gridCols = 4;
    const gridRows = 3;
    const cellW = 80;
    const cellH = 80;
    const paddingX = 100;
    const paddingY = 100;

    const currentUnitsCount = store.units.length;
    const row = Math.floor(currentUnitsCount / gridCols) % gridRows;
    const col = currentUnitsCount % gridCols;

    const x = paddingX + col * cellW;
    const y = paddingY + row * cellH;

    store.addUnit({
      unitId: randomUnitId,
      x,
      y
    });

    return randomUnitId;
  },

  combineUnit: (recipeId: string) => {
    const store = useGameStore.getState();
    const recipe = RECIPES.find(r => r.targetUnitId === recipeId);
    if (!recipe) return false;

    // Check materials
    const materialsNeeded = recipe.materials.reduce((acc, mat) => {
      acc[mat.unitId] = mat.count;
      return acc;
    }, {} as Record<string, number>);

    // Count owned units
    const ownedCounts: Record<string, string[]> = {};
    for (const u of store.units) {
      if (!ownedCounts[u.unitId]) ownedCounts[u.unitId] = [];
      ownedCounts[u.unitId].push(u.uid);
    }

    for (const [unitId, count] of Object.entries(materialsNeeded)) {
      if (!ownedCounts[unitId] || ownedCounts[unitId].length < count) {
        return false; // Not enough materials
      }
    }

    // Success check
    const rand = store.nextRandom() * 100;
    if (rand > recipe.successRate) {
        // Failed
        alert("Combination Failed!");
        // Deduct materials anyway
        for (const [unitId, count] of Object.entries(materialsNeeded)) {
          for (let i = 0; i < count; i++) {
            store.removeUnit(ownedCounts[unitId][i]);
          }
        }
        return false;
    }

    // Success!
    // Deduct materials
    for (const [unitId, count] of Object.entries(materialsNeeded)) {
      for (let i = 0; i < count; i++) {
        store.removeUnit(ownedCounts[unitId][i]);
      }
    }

    // Spawn new unit (find a free spot or reuse one)
    const x = 200 + store.nextRandom() * 100;
    const y = 200 + store.nextRandom() * 100;

    store.addUnit({
      unitId: recipe.targetUnitId,
      x,
      y
    });

    return true;
  },

  attackLoop: () => {
    const store = useGameStore.getState();
    const { units, monsters, upgrades, gameSpeed, setMonsters, addSilver } = store;

    if (store.isGameOver) return;
    if (units.length === 0 || monsters.length === 0) return;

    // Basic distance helper
    const dist = (x1: number, y1: number, x2: number, y2: number) =>
      Math.sqrt((x2-x1)**2 + (y2-y1)**2);

    const damages: Record<string, number> = {};

    units.forEach((unit) => {
      const uData = UNITS[unit.unitId];
      if (!uData) return;

      // Find nearest target within range
      let targetMonster = null;
      let minD = Infinity;

      for (const m of monsters) {
        const d = dist(unit.x, unit.y, m.x, m.y);
        if (d <= uData.range && d < minD) {
          minD = d;
          targetMonster = m;
        }
      }

      if (targetMonster) {
        const attackMult = 1 + (upgrades.attackBonus / 100);
        const dmg = (uData.attack * attackMult * uData.attackSpeed * gameSpeed) * 0.1;

        // We accumulate damage directly into a local map to avoid state updates per unit
        if (!damages[targetMonster.uid]) damages[targetMonster.uid] = 0;
        damages[targetMonster.uid] += dmg;
      }
    });

    if (Object.keys(damages).length === 0) return;

    let earnedSilver = 0;
    const nextMonsters = monsters.map(m => {
      const dmg = damages[m.uid] || 0;
      if (dmg === 0) return m;

      const newHp = m.hp - dmg;
      if (newHp <= 0) {
        earnedSilver += (m.isBoss ? 50 : 10);
        return null; // Dead
      }
      return { ...m, hp: newHp };
    }).filter(Boolean) as typeof monsters;

    // Apply bulk updates
    setMonsters(nextMonsters);
    if (earnedSilver > 0) {
      addSilver(earnedSilver);
    }
  }
};
