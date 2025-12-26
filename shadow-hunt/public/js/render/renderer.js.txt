// ==================================
// RENDERER (FINAL – NO BLACK SCREEN)
// ==================================
(function () {

  const canvas = window.__GAME__.canvas;
  const ctx = window.__GAME__.ctx;

  function clear() {
    ctx.fillStyle = CONFIG.CANVAS.BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawMap() {
    const map = STATE.world.currentMap;
    if (!map) return;

    const ts = map.tileSize * CONFIG.CANVAS.PIXEL_RATIO;

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.grid[y * map.width + x];
        if (tile === map.TILE.GROUND) continue;

        const pos = CAMERA.worldToScreen(
          x * map.tileSize,
          y * map.tileSize
        );

        if (tile === map.TILE.WALL) {
          ctx.fillStyle = '#1a1a2e';
          ctx.fillRect(pos.x, pos.y, ts, ts);
        } else if (tile === map.TILE.GRASS) {
          ctx.fillStyle = 'rgba(255,204,0,0.25)';
          ctx.fillRect(pos.x, pos.y, ts, ts);
        }
      }
    }
  }

  function drawPlaceholder(player) {
    const size = CONFIG.PLAYER.SIZE * CONFIG.CANVAS.PIXEL_RATIO;
    const pos = CAMERA.worldToScreen(player.x, player.y);
    ctx.save();
    ctx.globalAlpha = 0.85;
    if (player.role === 'police') {
      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.arc(pos.x + size / 2, pos.y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ff0055';
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
