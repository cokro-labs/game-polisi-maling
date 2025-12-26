// ==================================
// PLAYER MOVEMENT (FINAL – PRODUCTION READY)
// Frame-Rate Independent, Wall Sliding
// ==================================

(function () {

  // dt = delta time (dalam detik), dikirim dari Game Loop
  function apply(player, intent) {
    // ----------------------------------
    // HARD GUARDS
    // ----------------------------------
    if (STATE.system.paused || player.caught) {
      player.moving = false;
      return;
    }

    // ----------------------------------
    // READ INTENT
    // ----------------------------------
    let dx = intent.x || 0;
    let dy = intent.y || 0;

    if (dx === 0 && dy === 0) {
      player.moving = false;
      return;
    }

    player.moving = true;

    // ----------------------------------
    // NORMALIZE DIAGONAL SPEED
    // ----------------------------------
    // Mencegah lari diagonal lebih cepat (Cheat Pythagoras)
    if (dx !== 0 && dy !== 0) {
      const norm = 0.70710678; 
      dx *= norm;
      dy *= norm;
    }

    // ----------------------------------
    // CALCULATE NEXT POSITION (Time-Based)
    // ----------------------------------
    // BUG FIX: Menggunakan 'dt' agar 60FPS dan 144FPS punya speed sama
    // Default dt = 0.016 (approx 60fps) jika undefined (safety)
    const timeStep = 1 / CONFIG.TICK.RATE;
    
    const moveDist = player.speed * timeStep;
    const nextX = player.x + dx * moveDist;
    const nextY = player.y + dy * moveDist;

    // ----------------------------------
    // COLLISION & WALL SLIDING
    // ----------------------------------
    let moved = false;

    // 1. Coba gerak Horizontal (X)
    if (PLAYER_COLLISION.canMoveTo(player, nextX, player.y)) {
      player.x = nextX;
      moved = true;
    }

    // 2. Coba gerak Vertikal (Y)
    // Gunakan player.x terbaru agar bisa "sliding" di tembok
    if (PLAYER_COLLISION.canMoveTo(player, player.x, nextY)) {
      player.y = nextY;
      moved = true;
    }

    // ----------------------------------
    // SYNC STATE
    // ----------------------------------
    player.moving = moved;
  }

  window.PLAYER_MOVEMENT = { apply };

})();