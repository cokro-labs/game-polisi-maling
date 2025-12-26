// ==================================
// CONFIG (FINAL – FIXED SPEED)
// ==================================
(function () {
  const DPR = window.devicePixelRatio || 1;

  window.CONFIG = {
    CANVAS: {
      BG_COLOR: '#050505',
      PIXEL_RATIO: DPR
    },
    WORLD: {
      TILE_SIZE: 16
    },
    PLAYER: {
      SIZE: 14,
      // UBAH INI: 1.2 terlalu pelan untuk sistem "per detik".
      // Coba 90 pixel/detik (sekitar 3 kotak per detik)
      SPEED: 90 
    },
    TICK: {
      RATE: 30 // 30 Tick per detik
    },
    DEBUG: {
      SHOW_GRID: false
    }
  };
})();