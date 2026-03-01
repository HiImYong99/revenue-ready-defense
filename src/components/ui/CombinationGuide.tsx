'use client';

import { useGameStore } from '@/store/gameStore';
import { RECIPES, UNITS } from '@/game/data/unitData';
import { UnitManager } from '@/game/engine/UnitManager';

export default function CombinationGuide() {
  const { units } = useGameStore();

  // Count owned units
  const ownedCounts = units.reduce((acc, unit) => {
    acc[unit.unitId] = (acc[unit.unitId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg border-2 border-amber-600 shadow-xl overflow-y-auto max-h-[400px]">
      <h2 className="text-xl font-bold mb-4 text-amber-400">Recipes</h2>
      <div className="flex flex-col gap-3">
        {RECIPES.map((recipe) => {
          const targetUnit = UNITS[recipe.targetUnitId];

          // Check if craftable
          const isCraftable = recipe.materials.every((mat) =>
            (ownedCounts[mat.unitId] || 0) >= mat.count
          );

          return (
            <div
              key={recipe.targetUnitId}
              className={`p-3 rounded-md border flex items-center justify-between
                ${isCraftable ? 'bg-green-900 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-700 border-gray-600'}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: targetUnit.color }}
                >
                  {targetUnit.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold">{targetUnit.name}</div>
                  <div className="text-xs text-gray-400">
                    {recipe.materials.map(m => `${UNITS[m.unitId].name} x${m.count}`).join(' + ')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isCraftable) {
                    UnitManager.combineUnit(recipe.targetUnitId);
                  }
                }}
                disabled={!isCraftable}
                className={`px-3 py-1 rounded text-sm font-bold transition-all
                  ${isCraftable
                    ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
              >
                Combine ({recipe.successRate}%)
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
