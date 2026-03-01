export type UnitTier = 'Normal' | 'Magic' | 'Rare' | 'Ancient' | 'Mythic';

export interface UnitData {
  id: string;
  name: string;
  tier: UnitTier;
  attack: number;
  range: number;
  attackSpeed: number; // Attacks per second
  color: string;
}

export interface UnitRecipe {
  targetUnitId: string;
  materials: {
    unitId: string;
    count: number;
  }[];
  successRate: number;
}

export const UNITS: Record<string, UnitData> = {
  // Normal Tier
  slime: { id: 'slime', name: 'Slime', tier: 'Normal', attack: 10, range: 100, attackSpeed: 1, color: '#84cc16' },
  mushroom: { id: 'mushroom', name: 'Mushroom', tier: 'Normal', attack: 12, range: 80, attackSpeed: 1.2, color: '#f97316' },
  pig: { id: 'pig', name: 'Pig', tier: 'Normal', attack: 15, range: 60, attackSpeed: 0.8, color: '#fca5a5' },

  // Magic Tier
  horned_mushroom: { id: 'horned_mushroom', name: 'Horned Mushroom', tier: 'Magic', attack: 35, range: 90, attackSpeed: 1.2, color: '#c2410c' },
  ribbon_pig: { id: 'ribbon_pig', name: 'Ribbon Pig', tier: 'Magic', attack: 45, range: 60, attackSpeed: 0.8, color: '#ef4444' },

  // Rare Tier
  king_slime: { id: 'king_slime', name: 'King Slime', tier: 'Rare', attack: 100, range: 120, attackSpeed: 0.5, color: '#4ade80' },
  mushmom: { id: 'mushmom', name: 'Mushmom', tier: 'Rare', attack: 120, range: 100, attackSpeed: 1, color: '#ea580c' },
};

export const RECIPES: UnitRecipe[] = [
  {
    targetUnitId: 'horned_mushroom',
    materials: [{ unitId: 'mushroom', count: 3 }],
    successRate: 100,
  },
  {
    targetUnitId: 'ribbon_pig',
    materials: [{ unitId: 'pig', count: 3 }],
    successRate: 100,
  },
  {
    targetUnitId: 'king_slime',
    materials: [{ unitId: 'slime', count: 3 }],
    successRate: 100,
  },
  {
    targetUnitId: 'mushmom',
    materials: [{ unitId: 'horned_mushroom', count: 2 }, { unitId: 'mushroom', count: 1 }],
    successRate: 100,
  }
];
