'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { useGameStore, FieldUnit, Monster } from '@/store/gameStore';
import { UnitManager } from '@/game/engine/UnitManager';
import { WaveManager, PATH_NODES } from '@/game/engine/WaveManager';
import { UNITS } from '@/game/data/unitData';
import { motion } from 'framer-motion';

import CombinationGuide from '@/components/ui/CombinationGuide';
import Inventory from '@/components/ui/Inventory';
import TossPaymentWidget from '@/components/shop/TossPaymentWidget';
import AdRewardHandler from '@/components/shop/AdRewardHandler';

const UnitNode = memo(({ unit }: { unit: FieldUnit }) => {
  const uData = UNITS[unit.unitId];
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{
        position: 'absolute',
        left: unit.x - 20,
        top: unit.y - 20,
        width: 40,
        height: 40,
        backgroundColor: uData?.color || '#fff',
        borderRadius: '50%',
        border: '3px solid #000',
        boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
        zIndex: 10
      }}
      className="flex items-center justify-center text-xs font-bold text-black drop-shadow-md"
    >
      {uData?.name.slice(0, 2)}

      {/* Range Indicator (hover effect could be added) */}
      <div className="absolute rounded-full border border-white opacity-10 pointer-events-none"
            style={{ width: uData?.range * 2, height: uData?.range * 2, left: -(uData?.range - 20), top: -(uData?.range - 20) }}
      />
    </motion.div>
  );
});
UnitNode.displayName = 'UnitNode';

const MonsterNode = memo(({ monster }: { monster: Monster }) => (
  <div
    style={{
      position: 'absolute',
      left: monster.x - (monster.isBoss ? 25 : 15),
      top: monster.y - (monster.isBoss ? 25 : 15),
      width: monster.isBoss ? 50 : 30,
      height: monster.isBoss ? 50 : 30,
      backgroundColor: monster.isBoss ? '#ef4444' : '#8b5cf6',
      borderRadius: '8px',
      border: '2px solid #000',
      zIndex: 20,
      transition: 'left 0.1s linear, top 0.1s linear' // Smooth movement between ticks
    }}
    className="flex flex-col items-center shadow-lg"
  >
    {/* HP Bar */}
    <div className="absolute -top-3 left-0 w-full h-1 bg-red-900 border border-black rounded-sm overflow-hidden">
      <div
        className="h-full bg-green-500"
        style={{ width: `${Math.max(0, (monster.hp / monster.maxHp) * 100)}%` }}
      />
    </div>
    {monster.isBoss && <span className="text-[10px] font-bold mt-1 text-white">BOSS</span>}
  </div>
));
MonsterNode.displayName = 'MonsterNode';


export default function GameBoard() {
  const store = useGameStore();
  const [showShop, setShowShop] = useState(false);
  const waveStartRef = useRef<number>(0);
  const loopRef = useRef<number>(0);

  useEffect(() => {
    waveStartRef.current = Date.now();
  }, []);

  // Main Game Loop
  useEffect(() => {
    if (store.isGameOver) return;

    let lastTime = performance.now();
    const tick = (time: number) => {
      const dt = time - lastTime;
      // Run loop approximately 60 times a second
      if (dt >= 16) {
        UnitManager.attackLoop();
        WaveManager.moveMonsters();

        // Check wave progression
        const progressed = WaveManager.checkWaveProgression(null, waveStartRef.current);
        if (progressed) {
          waveStartRef.current = Date.now();
          // Spawn monsters for new wave
          const spawnCount = 10;
          for (let i = 0; i < spawnCount; i++) {
            setTimeout(() => {
              WaveManager.spawnMonster();
            }, i * 1000); // Stagger spawn
          }
        }

        lastTime = time;
      }
      loopRef.current = requestAnimationFrame(tick);
    };

    loopRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(loopRef.current);
  }, [store.isGameOver]);

  // Initial spawn
  useEffect(() => {
    if (store.wave === 1 && store.monsters.length === 0) {
        waveStartRef.current = Date.now();
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            WaveManager.spawnMonster();
          }, i * 1000);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (store.isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
        <h1 className="text-6xl font-bold text-red-600 mb-8 font-mono animate-pulse">GAME OVER</h1>
        <button
          onClick={() => {
            store.resetGame();
            waveStartRef.current = Date.now();
          }}
          className="px-8 py-4 bg-red-800 hover:bg-red-700 rounded-lg text-2xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
        >
          Restart Game
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 p-4 gap-4 font-sans select-none overflow-hidden">

      {/* Header / Top Bar */}
      <header className="flex justify-between items-center bg-gray-900 border-2 border-gray-700 rounded-lg p-2 shadow-lg">
        <div className="flex gap-4">
          <button
            className="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-md shadow-md active:scale-95 transition-transform"
            onClick={() => UnitManager.summonUnit()}
          >
            Summon (100 Silver)
          </button>

          <AdRewardHandler />
        </div>

        <button
          className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-md shadow-[0_0_15px_rgba(217,119,6,0.5)] active:scale-95 transition-all"
          onClick={() => setShowShop(true)}
        >
          🛍️ Shop & Upgrades
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex gap-4 flex-1 h-[600px]">

        {/* Play Area (Canvas/Map) */}
        <div className="relative flex-1 bg-green-900 border-4 border-green-950 rounded-xl overflow-hidden shadow-inner">

          {/* Path visualization */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <polyline
              points={PATH_NODES.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#000"
              strokeWidth="40"
              strokeLinejoin="round"
            />
          </svg>

          {/* Render Units */}
          {store.units.map(unit => (
            <UnitNode key={unit.uid} unit={unit} />
          ))}

          {/* Render Monsters */}
          {store.monsters.map(monster => (
            <MonsterNode key={monster.uid} monster={monster} />
          ))}

        </div>

        {/* Right Sidebar (Recipes & Info) */}
        <aside className="w-80 flex flex-col gap-4">
          <CombinationGuide />

          {/* Upgrades Info Panel */}
          <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <h3 className="font-bold text-lg mb-2 text-purple-400">Current Buffs</h3>
            <div className="text-sm">
              <div>⚔️ Attack Bonus: <span className="text-green-400">+{store.upgrades.attackBonus}%</span></div>
              <div>💰 Start Gold Bonus: <span className="text-yellow-400">+{store.upgrades.initialGoldBonus}</span></div>
              <div>⚡ Game Speed: <span className="text-blue-400">{store.gameSpeed}x</span></div>
            </div>
          </div>
        </aside>

      </div>

      {/* Footer / Inventory */}
      <Inventory />

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-4 border-amber-600 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-amber-500 font-mono">Special Shop</h2>
              <button onClick={() => setShowShop(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Permanent Upgrades */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">Upgrades</h3>

                <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <h4 className="font-bold text-blue-400 mb-1">Ad Removal Package</h4>
                  <p className="text-xs text-gray-400 mb-3">Skip video ads and claim rewards immediately!</p>
                  <button
                    onClick={() => {
                      if (store.upgrades.hasAdRemoval) return;
                      if (store.diamonds >= 500) {
                        store.deductDiamonds(500);
                        store.purchaseAdRemoval();
                      } else {
                        alert("Not enough Diamonds!");
                      }
                    }}
                    disabled={store.upgrades.hasAdRemoval}
                    className={`w-full py-2 rounded text-white font-bold transition-all ${store.upgrades.hasAdRemoval ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-600'}`}
                  >
                    {store.upgrades.hasAdRemoval ? "Owned" : "Buy (500 💎)"}
                  </button>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <h4 className="font-bold text-green-400 mb-1">Attack Power +10%</h4>
                  <p className="text-xs text-gray-400 mb-3">Permanently increase all units attack damage.</p>
                  <button
                    onClick={() => {
                      if (store.diamonds >= 100) {
                        store.deductDiamonds(100);
                        store.upgradeAttackBonus(10);
                      } else {
                        alert("Not enough Diamonds!");
                      }
                    }}
                    className="w-full py-2 bg-purple-700 hover:bg-purple-600 rounded text-white font-bold"
                  >
                    Buy (100 💎)
                  </button>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <h4 className="font-bold text-yellow-400 mb-1">Initial Gold +500</h4>
                  <p className="text-xs text-gray-400 mb-3">Start every game with more gold.</p>
                  <button
                    onClick={() => {
                      if (store.diamonds >= 150) {
                        store.deductDiamonds(150);
                        store.upgradeInitialGoldBonus(500);
                      } else {
                        alert("Not enough Diamonds!");
                      }
                    }}
                    className="w-full py-2 bg-purple-700 hover:bg-purple-600 rounded text-white font-bold"
                  >
                    Buy (150 💎)
                  </button>
                </div>
              </div>

              {/* Toss Payments */}
              <div className="flex flex-col gap-4 border-l border-gray-700 pl-6">
                 <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">Buy Diamonds</h3>
                 <TossPaymentWidget />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
