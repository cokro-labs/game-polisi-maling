// ==================================
// MAP MANAGER (FINAL – HARDENED)
// ==================================

(function () {

  function load(mapId) {
    if (!window.MAPS) {
      throw new Error('[MAP] MAPS not loaded');
    }

    const seed = STATE.world.seed;
    const map = MAPS.generate(seed);

    STATE.world.currentMap = map;
    STATE.world.ready = true;

    console.info(`[MAP] Loaded '${map.id}' (Seed: ${seed})`);
  }

  function getTileAt(x, y) {
    const map = STATE.world.currentMap;
    if (!map) return 0;

    const tx = Math.floor(x / map.tileSize);
    const ty = Math.floor(y / map.tileSize);

    if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) {
      return map.TILE.WALL;
    }

    return map.grid[ty * map.width + tx];
  }

  function isBlocked(x, y) {
    const map = STATE.world.currentMap;
    if (!map) return true;
    return getTileAt(x, y) === map.TILE.WALL;
  }

  function isGrass(x, y) {
    const map = STATE.world.currentMap;
    if (!map) return false;
    return getTileAt(x, y) === map.TILE.GRASS;
  }

  window.MAP = {
    load,
    getTileAt,
    isBlocked,
    isGrass
  };

})();
