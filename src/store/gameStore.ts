import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FieldUnit {
  uid: string; // Unique ID for the field instance
  unitId: string; // Refers to UnitData.id
  x: number;
  y: number;
}

export interface Monster {
  uid: string;
  maxHp: number;
  hp: number;
  x: number;
  y: number;
  speed: number;
  pathIndex: number; // Current target path node
  isBoss: boolean;
  spawnTime?: number; // Only for boss
}

export interface Upgrades {
  attackBonus: number; // Percentage
  initialGoldBonus: number; // Flat amount
  hasAdRemoval: boolean; // Owns the ad removal package
}

export interface GameState {
  // Game RNG Seed
  randomSeed: number;

  // Currencies
  silver: number;
  diamonds: number;
  gold: number;

  // Game Entities
  units: FieldUnit[];
  monsters: Monster[];

  // Game Status
  life: number;
  wave: number;
  isGameOver: boolean;
  gameSpeed: number;

  // Persistent Upgrades
  upgrades: Upgrades;

  // Actions
  addSilver: (amount: number) => void;
  deductSilver: (amount: number) => void;
  addDiamonds: (amount: number) => void;
  deductDiamonds: (amount: number) => void;
  addGold: (amount: number) => void;
  deductGold: (amount: number) => void;

  addUnit: (unit: Omit<FieldUnit, 'uid'>) => void;
  removeUnit: (uid: string) => void;

  addMonster: (monster: Omit<Monster, 'uid'>) => void;
  updateMonster: (uid: string, updates: Partial<Monster>) => void;
  removeMonster: (uid: string) => void;
  bulkUpdateMonsters: (updates: { uid: string; updates: Partial<Monster> }[]) => void;
  setMonsters: (monsters: Monster[]) => void;

  setLife: (life: number) => void;
  deductLife: (amount: number) => void;
  setWave: (wave: number) => void;
  setGameOver: (isGameOver: boolean) => void;
  setGameSpeed: (speed: number) => void;

  upgradeAttackBonus: (amount: number) => void;
  upgradeInitialGoldBonus: (amount: number) => void;
  purchaseAdRemoval: () => void;

  nextRandom: () => number;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      randomSeed: Math.floor(Math.random() * 1000000), // Initial seed

      silver: 1000, // Starting silver
      diamonds: 0,
      gold: 500, // Base starting gold

      units: [],
      monsters: [],

      life: 10,
      wave: 1,
      isGameOver: false,
      gameSpeed: 1,

      upgrades: {
        attackBonus: 0,
        initialGoldBonus: 0,
        hasAdRemoval: false,
      },

      addSilver: (amount) => set((state) => ({ silver: state.silver + amount })),
      deductSilver: (amount) => set((state) => ({ silver: Math.max(0, state.silver - amount) })),
      addDiamonds: (amount) => set((state) => ({ diamonds: state.diamonds + amount })),
      deductDiamonds: (amount) => set((state) => ({ diamonds: Math.max(0, state.diamonds - amount) })),
      addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
      deductGold: (amount) => set((state) => ({ gold: Math.max(0, state.gold - amount) })),

      addUnit: (unit) => set((state) => ({
        units: [...state.units, { ...unit, uid: Math.random().toString(36).substring(7) }]
      })),
      removeUnit: (uid) => set((state) => ({
        units: state.units.filter((u) => u.uid !== uid)
      })),

      addMonster: (monster) => set((state) => ({
        monsters: [...state.monsters, { ...monster, uid: Math.random().toString(36).substring(7) }]
      })),
      updateMonster: (uid, updates) => set((state) => ({
        monsters: state.monsters.map((m) => m.uid === uid ? { ...m, ...updates } : m)
      })),
      removeMonster: (uid) => set((state) => ({
        monsters: state.monsters.filter((m) => m.uid !== uid)
      })),
      bulkUpdateMonsters: (updates) => set((state) => {
        const updateMap = new Map(updates.map(u => [u.uid, u.updates]));
        return {
          monsters: state.monsters.map(m =>
            updateMap.has(m.uid) ? { ...m, ...updateMap.get(m.uid) } : m
          )
        };
      }),
      setMonsters: (monsters) => set({ monsters }),

      setLife: (life) => set({ life }),
      deductLife: (amount) => set((state) => {
        const newLife = state.life - amount;
        return { life: newLife, isGameOver: newLife <= 0 };
      }),
      setWave: (wave) => set({ wave }),
      setGameOver: (isGameOver) => set({ isGameOver }),
      setGameSpeed: (speed) => set({ gameSpeed: speed }),

      upgradeAttackBonus: (amount) => set((state) => ({
        upgrades: { ...state.upgrades, attackBonus: state.upgrades.attackBonus + amount }
      })),
      upgradeInitialGoldBonus: (amount) => set((state) => ({
        upgrades: { ...state.upgrades, initialGoldBonus: state.upgrades.initialGoldBonus + amount }
      })),
      purchaseAdRemoval: () => set((state) => ({
        upgrades: { ...state.upgrades, hasAdRemoval: true }
      })),

      nextRandom: () => {
        const currentSeed = get().randomSeed;
        // Simple LCG PRNG for demonstration (a = 1664525, c = 1013904223, m = 2^32)
        const nextSeed = (currentSeed * 1664525 + 1013904223) >>> 0;
        set({ randomSeed: nextSeed });
        return nextSeed / 4294967296; // Return 0.0 to 1.0
      },

      resetGame: () => set((state) => ({
        randomSeed: Math.floor(Math.random() * 1000000),
        silver: 1000,
        gold: 500 + state.upgrades.initialGoldBonus,
        units: [],
        monsters: [],
        life: 10,
        wave: 1,
        isGameOver: false,
        gameSpeed: 1,
      })),
    }),
    {
      name: 'revenue-ready-defense-storage',
      // Only persist inventory and upgrades, not active game state like units/monsters
      partialize: (state) => ({
        diamonds: state.diamonds,
        upgrades: state.upgrades,
      }),
    }
  )
);
