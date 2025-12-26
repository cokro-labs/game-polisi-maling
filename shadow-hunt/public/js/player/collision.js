// ==================================
// COLLISION SYSTEM (FINAL – HARDENED)
// Map-aware, Corner-safe, Future-proof
// ==================================
(function () {

  const EPS = 0.01; // margin aman anti jitter

  function canMoveTo(player, x, y) {
    if (!window.MAP) return false;

    const w = player.width;
    const h = player.height;

    // Empat sudut bounding box
    const points = [
      { x: x + EPS,       y: y + EPS },
      { x: x + w - EPS,   y: y + EPS },
      { x: x + EPS,       y: y + h - EPS },
      { x: x + w - EPS,   y: y + h - EPS }
    ];

    for (const p of points) {
      if (MAP.isBlocked(p.x, p.y)) {
        return false;
      }
    }
    return true;
  }

  window.PLAYER_COLLISION = { canMoveTo };

})();
