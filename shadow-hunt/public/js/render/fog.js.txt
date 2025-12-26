// ==================================
// FOG OF WAR (FINAL – SAFE)
// ==================================
(function () {

  const BASE_RADIUS = 110;
  const POLICE_MULT = 1.8;
  const GRASS_PENALTY = 0.6;

  function draw(player) {
    if (!STATE.system.renderReady || !player) return;

    const ctx = window.__GAME__.ctx;
    const canvas = window.__GAME__.canvas;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.92)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let r = BASE_RADIUS;
    if (player.role === 'police') r *= POLICE_MULT;
    if (MAP.isGrass(player.x, player.y)) r *= GRASS_PENALTY;

    r *= CONFIG.CANVAS.PIXEL_RATIO;

    const pos = CAMERA.worldToScreen(player.x, player.y);
    const size = CONFIG.PLAYER.SIZE * CONFIG.CANVAS.PIXEL_RATIO;
    const cx = pos.x + size / 2;
    const cy = pos.y + size / 2;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  window.FOG = { draw };

})();
