'use client';

import { useGameStore } from '@/store/gameStore';

export default function Inventory() {
  const { silver, diamonds, gold, life, wave } = useGameStore();

  return (
    <div className="flex gap-4 p-4 bg-gray-900 rounded-b-lg shadow-xl text-white font-mono text-sm border-b-4 border-amber-600 w-full justify-between items-center">
      <div className="flex gap-6 items-center">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">🪙 Silver:</span>
          <span className="font-bold text-lg text-gray-200">{silver}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400">💎 Diamonds:</span>
          <span className="font-bold text-lg text-amber-200">{diamonds}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">💰 Gold:</span>
          <span className="font-bold text-lg text-yellow-200">{gold}</span>
        </div>
      </div>
      <div className="flex gap-6 items-center border-l-2 border-gray-700 pl-6">
        <div className="flex flex-col items-center">
          <span className="text-red-400 text-xs uppercase tracking-wider">Life</span>
          <span className="font-bold text-2xl text-red-500">{life}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-blue-400 text-xs uppercase tracking-wider">Wave</span>
          <span className="font-bold text-2xl text-blue-500">{wave}</span>
        </div>
      </div>
    </div>
  );
}
