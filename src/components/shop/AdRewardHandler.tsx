'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { UnitManager } from '@/game/engine/UnitManager';

export default function AdRewardHandler() {
  const store = useGameStore();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adRewardType, setAdRewardType] = useState<string | null>(null);

  const handleWatchAd = (rewardType: 'summon' | 'speed') => {
    if (store.upgrades.hasAdRemoval) {
      grantReward(rewardType);
      return;
    }

    setIsWatchingAd(true);
    setAdRewardType(rewardType);

    // Simulate watching an ad (e.g. 3 seconds)
    setTimeout(() => {
      setIsWatchingAd(false);
      grantReward(rewardType);
      setAdRewardType(null);
    }, 3000); // Simulated ad duration
  };

  const grantReward = (rewardType: 'summon' | 'speed') => {
    if (rewardType === 'summon') {
      const result = UnitManager.summonUnit('Magic');
      if (result) {
          alert("Reward Granted: Magic Tier Unit Summoned!");
      }
    } else if (rewardType === 'speed') {
      store.setGameSpeed(2);
      alert("Reward Granted: 2x Speed for 5 minutes!");

      // Revert speed after 5 minutes
      setTimeout(() => {
          store.setGameSpeed(1);
      }, 5 * 60 * 1000);
    }
  };

  return (
    <>
      <button
        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-md shadow-[0_0_15px_rgba(236,72,153,0.5)] active:scale-95 transition-all flex items-center gap-2"
        onClick={() => handleWatchAd('summon')}
        disabled={isWatchingAd}
      >
        {isWatchingAd && adRewardType === 'summon' ? 'Watching...' : (store.upgrades.hasAdRemoval ? '✨ 즉시 수령 (Magic)' : '📺 Ad: Free Magic Unit')}
      </button>

      <button
        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-md shadow-[0_0_15px_rgba(6,182,212,0.5)] active:scale-95 transition-all flex items-center gap-2"
        onClick={() => handleWatchAd('speed')}
        disabled={isWatchingAd}
      >
        {isWatchingAd && adRewardType === 'speed' ? 'Watching...' : (store.upgrades.hasAdRemoval ? '⚡ 즉시 수령 (Speed)' : '📺 Ad: 2x Speed (5m)')}
      </button>

      {/* Fullscreen Ad Overlay Simulation */}
      {isWatchingAd && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
          <div className="w-full max-w-lg aspect-video bg-gray-800 rounded-lg flex items-center justify-center animate-pulse border-2 border-purple-500">
            <span className="text-2xl text-white font-bold">Simulated Video Ad...</span>
          </div>
          <p className="text-white mt-4 text-sm">Reward will be granted shortly.</p>
        </div>
      )}
    </>
  );
}
