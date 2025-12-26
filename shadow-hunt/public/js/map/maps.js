// ==================================
// MAP GENERATOR (FINAL – LOCKED)
// Deterministic, Multiplayer-Safe
// ==================================

(function () {

  function createRNG(seed) {
    let s = seed >>> 0;
    return function () {
      s ^= s << 13;
      s ^= s >> 17;
      s ^= s << 5;
      return (s >>> 0) / 4294967296;
    };
  }

  const TILE = {
    GROUND: 0,
    WALL: 1,
    GRASS: 2
  };

  function generateCity(seed) {
    const rand = createRNG(seed);

    const width = 60;
    const height = 40;
    const tileSize = CONFIG.WORLD.TILE_SIZE;
    const grid = new Array(width * height).fill(TILE.GROUND);

    // Border
    for (let x = 0; x < width; x++) {
      grid[x] = TILE.WALL;
      grid[x + (height - 1) * width] = TILE.WALL;
    }
    for (let y = 0; y < height; y++) {
      grid[y * width] = TILE.WALL;
      grid[y * width + (width - 1)] = TILE.WALL;
    }

    // Internal walls
    for (let i = 0; i < 90; i++) {
      const rx = Math.floor(rand() * (width - 4)) + 2;
      const ry = Math.floor(rand() * (height - 4)) + 2;
      grid[ry * width + rx] = TILE.WALL;
    }

    // Grass
    for (let i = 0; i < 220; i++) {
      const rx = Math.floor(rand() * (width - 2)) + 1;
      const ry = Math.floor(rand() * (height - 2)) + 1;
      const idx = ry * width + rx;
      if (grid[idx] === TILE.GROUND) grid[idx] = TILE.GRASS;
    }

    return {
      id: 'city_01',
      seed,
      tileSize,
      width,
      height,
      grid,
      spawn: {
        p1: { x: 5, y: 5 },
        p2: { x: width - 6, y: height - 6 }
      },
      TILE,
      // 🔒 NAVIGATION CONTRACT (FUTURE AI)
      isNavigable(tile) {
        return tile !== TILE.WALL;
      }
    };
  }

  window.MAPS = {
    generate(seed) {
      return generateCity(seed);
    }
  };

})();
