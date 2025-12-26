// ==================================
// CAMERA (FINAL – STABLE & SAFE)
// ==================================
(function () {

  let target = null;
  let x = 0;
  let y = 0;

  function follow(entity) {
    target = entity;
  }

  function update() {
    if (!target || !STATE.world.currentMap) return;

    const map = STATE.world.currentMap;
    const viewW = window.__GAME__.canvas.width / CONFIG.CANVAS.PIXEL_RATIO;
    const viewH = window.__GAME__.canvas.height / CONFIG.CANVAS.PIXEL_RATIO;

    x = target.x + target.width / 2 - viewW / 2;
    y = target.y + target.height / 2 - viewH / 2;

    x = Math.max(0, Math.min(x, map.width * map.tileSize - viewW));
    y = Math.max(0, Math.min(y, map.height * map.tileSize - viewH));
  }

  function worldToScreen(wx, wy) {
    const scale = CONFIG.CANVAS.PIXEL_RATIO;
    return {
      x: (wx - x) * scale,
      y: (wy - y) * scale
    };
  }

  window.CAMERA = { follow, update, worldToScreen };

})();
