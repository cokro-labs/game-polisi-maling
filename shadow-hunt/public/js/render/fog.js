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

    const drawVisionShape = () => {
        ctx.beginPath();
        if (player.role === 'police') {
            ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, Math.PI * 2);
        } else {
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    ctx.globalCompositeOperation = 'destination-out';
    drawVisionShape();

    ctx.globalCompositeOperation = 'source-over';
    if (player.role === 'police') {
        ctx.fillStyle = 'rgba(128, 0, 128, 0.2)';
        drawVisionShape();
    }


    ctx.restore();
  }

  window.FOG = { draw };

})();