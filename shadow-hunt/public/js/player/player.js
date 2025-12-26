// ==================================
// PLAYER FACTORY (FINAL – BALANCED)
// Role-based stats
// ==================================
(function () {

  function create(id, role, startX, startY, isLocal = false) {
    const baseSpeed = CONFIG.PLAYER.SPEED;
    const speedMultiplier = role === 'police' ? 1.1 : 1.0;

    const player = {
      id,
      role, // 'police' | 'thief'
      x: startX,
      y: startY,
      width: CONFIG.PLAYER.SIZE,
      height: CONFIG.PLAYER.SIZE,

      // Stats
      speed: baseSpeed * speedMultiplier,

      // State Flags
      moving: false,
      caught: false,
      revealed: false,

      // Sprite & Animasi
      sprite: {
        name: role === 'police' ? 'polisi' : 'maling',
        state: 'idle',
        dir: 'down',
        frame: 0,
        timer: 0
      },

      // Utility
      stealth: {
        grassTimer: 0
      },

      // Multiplayer sync
      isLocal: isLocal
    };

    STATE.players[id] = player;
    return player;
  }

  function destroy(id) {
    if (STATE.players[id]) {
      delete STATE.players[id];
    }
  }

  function reset() {
    for (const id in STATE.players) {
      destroy(id);
    }
  }

  window.PLAYER = {
    create,
    destroy,
    reset
  };
  
})();
