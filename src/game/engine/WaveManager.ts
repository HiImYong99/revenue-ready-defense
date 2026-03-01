import { useGameStore } from '@/store/gameStore';

export const PATH_NODES = [
  { x: 0, y: 100 },
  { x: 500, y: 100 },
  { x: 500, y: 300 },
  { x: 100, y: 300 },
  { x: 100, y: 500 },
  { x: 600, y: 500 },
];

export const WaveManager = {
  spawnMonster: () => {
    const store = useGameStore.getState();
    const isBoss = store.wave % 10 === 0;

    // Scale HP with wave
    const baseHp = isBoss ? 5000 : 500;
    const hpMultiplier = Math.pow(1.2, store.wave - 1);
    const hp = baseHp * hpMultiplier;

    store.addMonster({
      maxHp: hp,
      hp: hp,
      x: PATH_NODES[0].x,
      y: PATH_NODES[0].y,
      speed: 2 * store.gameSpeed, // Base speed 2px per frame
      pathIndex: 1, // Moving towards second node
      isBoss,
      spawnTime: isBoss ? Date.now() : undefined
    });
  },

  moveMonsters: () => {
    const store = useGameStore.getState();
    const { monsters, deductLife, setMonsters } = store;

    if (store.isGameOver) return;
    if (monsters.length === 0) return;

    let lifePenalty = 0;

    const nextMonsters = monsters.map(m => {
      // Boss time limit check
      if (m.isBoss && m.spawnTime) {
         const timeAlive = Date.now() - m.spawnTime;
         if (timeAlive > 60000) {
            lifePenalty += 5;
            return null; // Remove
         }
      }

      const targetNode = PATH_NODES[m.pathIndex];
      if (!targetNode) {
        // Reached end of path!
        lifePenalty += (m.isBoss ? 3 : 1);
        return null; // Remove
      }

      const dx = targetNode.x - m.x;
      const dy = targetNode.y - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < m.speed) {
        return {
          ...m,
          x: targetNode.x,
          y: targetNode.y,
          pathIndex: m.pathIndex + 1
        };
      } else {
        const vx = (dx / dist) * m.speed;
        const vy = (dy / dist) * m.speed;
        return {
          ...m,
          x: m.x + vx,
          y: m.y + vy
        };
      }
    }).filter(Boolean) as typeof monsters;

    setMonsters(nextMonsters);

    if (lifePenalty > 0) {
      deductLife(lifePenalty);
    }
  },

  checkWaveProgression: (spawnIntervalRef: unknown, currentWaveStartMs: number) => {
    const store = useGameStore.getState();
    if (store.isGameOver) return;

    // A wave lasts for a certain amount of time, e.g. 30 seconds
    const waveDuration = 30000;
    const now = Date.now();
    const timeElapsed = now - currentWaveStartMs;

    // Increase wave
    if (timeElapsed > waveDuration && store.monsters.length === 0) {
       store.setWave(store.wave + 1);
       return true; // Return true to indicate wave progressed
    }
    return false;
  }
};
