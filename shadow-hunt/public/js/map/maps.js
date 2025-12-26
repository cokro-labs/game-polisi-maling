// ==================================
// MAP GENERATOR (NEW RETRO MAP)
// ==================================

(function () {

  // Define a new, retro-inspired color palette for the map
  const PALETTE = {
    BACKGROUND: '#1a1a2e', // Dark blue, almost black
    GROUND: '#1f2a40',     // A slightly lighter, muted blue
    WALL: '#e94560',       // A vibrant, retro red for obstacles
    GRASS: '#0f3460',      // A deep blue for accent areas
  };

  const TILE = {
    GROUND: 0,
    WALL: 1,
    GRASS: 2
  };

  function generateRetroMap(seed) {
    const width = 60;
    const height = 40;
    const tileSize = CONFIG.WORLD.TILE_SIZE;
    const grid = new Array(width * height).fill(TILE.GROUND);

    // Create a border of walls
    for (let x = 0; x < width; x++) {
      grid[x] = TILE.WALL;
      grid[x + (height - 1) * width] = TILE.WALL;
    }
    for (let y = 0; y < height; y++) {
      grid[y * width] = TILE.WALL;
      grid[y * width + (width - 1)] = TILE.WALL;
    }

    // Add a central obstacle course
    for (let y = 10; y < height - 10; y++) {
      grid[y * width + 15] = TILE.WALL;
      grid[y * width + width - 16] = TILE.WALL;
    }
    for (let x = 20; x < width - 20; x++) {
        if (x < 25 || x > width - 26) {
            grid[15 * width + x] = TILE.WALL;
            grid[(height - 16) * width + x] = TILE.WALL;
        }
    }

    // Add some accent grass patches
    for(let i = 0; i < 5; i++) {
        grid[(18+i) * width + 28] = TILE.GRASS;
        grid[(18+i) * width + width - 29] = TILE.GRASS;
    }

    return {
      id: 'retro_arena_01',
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
      PALETTE, // Expose the new palette
      isNavigable(tile) {
        return tile !== TILE.WALL;
      }
    };
  }

  window.MAPS = {
    generate(seed) {
      // We will now use the new retro map generator
      return generateRetroMap(seed);
    }
  };

})();
