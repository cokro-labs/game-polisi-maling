// ==================================
// STATE (FINAL – SINGLE AUTHORITY)
// ==================================
(function () {

  const system = {
    booting: true,
    playable: false,
    renderReady: false,
    paused: true,
    tick: 0,
    winner: null
  };

  const players = {};
  const world = {
    seed: Math.floor(Math.random() * 999999),
    currentMap: null,
    ready: false
  };

  function reset(full = false) {
    system.paused = true;
    system.winner = null;

    if (full) {
      world.currentMap = null;
      world.ready = false;
    }

    for (const id in players) {
      const p = players[id];
      if (!world.currentMap) continue;

      const spawn = world.currentMap.spawn[id];
      if (spawn) {
        p.x = spawn.x * world.currentMap.tileSize;
        p.y = spawn.y * world.currentMap.tileSize;
      }

      p.moving = false;
      p.caught = false;
      p.revealed = false;
      p.stealth.grassTimer = 0;
    }
  }

  window.STATE = {
    system,
    players,
    world,

    localPlayerId: null,

    setPlayable(val) {
      system.playable = val;
      system.paused = !val;
    },

    setRenderReady(val) {
      system.renderReady = val;
    },

    setBooting(val) {
      system.booting = val;
    },

    reset
  };

})();
