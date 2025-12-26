// ==================================
// PLAYER FACTORY (FINAL – BALANCED)
// Role-based stats
// ==================================
(function () {
  
  function create(id, role) {
    // GAME DESIGN BALANCING:
    // Polisi: Lari lebih cepat 10% (mengejar)
    // Maling: Standard speed (harus pintar sembunyi)
    const baseSpeed = CONFIG.PLAYER.SPEED;
    const speedMultiplier = role === 'police' ? 1.1 : 1.0; 

    return {
      id,
      role, // 'police' | 'maling'
      x: 0,
      y: 0,
      width: CONFIG.PLAYER.SIZE,
      height: CONFIG.PLAYER.SIZE,
      
      // Stats
      speed: baseSpeed * speedMultiplier,
      
      // State Flags
      moving: false,
      caught: false,
      revealed: false,
      
      // Utility
      stealth: {
        grassTimer: 0
      }
    };
  }

  window.PLAYER = { create };
})();