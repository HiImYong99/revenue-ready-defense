import { UnitTier } from './unitData';

export interface DropRate {
  tier: UnitTier;
  probability: number; // 0.0 to 1.0
}

export const SUMMON_COST = 100; // Silver

export const DROP_TABLE: DropRate[] = [
  { tier: 'Normal', probability: 0.8 },
  { tier: 'Magic', probability: 0.15 },
  { tier: 'Rare', probability: 0.05 },
];

export const TIER_UNITS: Record<UnitTier, string[]> = {
  Normal: ['slime', 'mushroom', 'pig'],
  Magic: ['horned_mushroom', 'ribbon_pig'],
  Rare: ['king_slime', 'mushmom'],
  Ancient: [],
  Mythic: []
};
