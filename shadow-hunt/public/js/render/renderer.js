// ==================================
// RENDERER (PALETTE-AWARE)
// ==================================
(function () {

  const canvas = window.__GAME__.canvas;
  const ctx = window.__GAME__.ctx;

  function clear() {
    const map = STATE.world.currentMap;
    // Use the map's background color, or fallback to default
    ctx.fillStyle = map?.PALETTE?.BACKGROUND || CONFIG.CANVAS.BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawMap() {
    const map = STATE.world.currentMap;
    if (!map) return;

    const ts = map.tileSize * CONFIG.CANVAS.PIXEL_RATIO;
    const palette = map.PALETTE || {};

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.grid[y * map.width + x];
        if (tile === map.TILE.GROUND) continue;

        const pos = CAMERA.worldToScreen(x * map.tileSize, y * map.tileSize);

        switch (tile) {
          case map.TILE.WALL:
            ctx.fillStyle = palette.WALL || '#e94560';
            ctx.fillRect(pos.x, pos.y, ts, ts);
            break;
          case map.TILE.GRASS:
            ctx.fillStyle = palette.GRASS || '#0f3460';
            ctx.fillRect(pos.x, pos.y, ts, ts);
            break;
        }
      }
    }
  }

  function drawPlaceholder(player) {
    const size = CONFIG.PLAYER.SIZE * CONFIG.CANVAS.PIXEL_RATIO;
    const pos = CAMERA.worldToScreen(player.x, player.y);
    ctx.save();
    ctx.globalAlpha = 0.9;
    
    // Match placeholder colors to the retro theme
    if (player.role === 'police') {
      ctx.fillStyle = '#4FC3F7'; // A brighter, cyberpunk blue
      ctx.beginPath();
      ctx.arc(pos.x + size / 2, pos.y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#FFD700'; // A vibrant, cyberpunk gold
      ctx.fillRect(pos.x, pos.y, size, size);
    }
    ctx.restore();
  }

  function drawPlayer(player) {
    if (window.SPRITE && SPRITE.canDraw(player)) {
      SPRITE.draw(player);
    } else {
      drawPlaceholder(player);
    }
  }

  function draw() {
    if (!STATE.system.renderReady) return;
    clear();
    if (!STATE.world.currentMap) return;

    drawMap();

    for (const id in STATE.players) {
      drawPlayer(STATE.players[id]);
    }

    const me = STATE.players[STATE.localPlayerId];
    if (window.FOG && me) FOG.draw(me);
    if (window.HUD) HUD.draw();
  }

  window.RENDER = { draw };

})();
