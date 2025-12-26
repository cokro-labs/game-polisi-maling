// ==================================
// GAME LOOP (AUTHORITATIVE HOST)
// ==================================
(function () {

  const TICK_INTERVAL = 1000 / CONFIG.TICK.RATE;
  let lastTime = 0;
  let acc = 0;
  let animationFrameId = null;

  function hostTick(delta) {
    if (window.BOT) BOT.update(delta);

    for (const id in STATE.players) {
      const player = STATE.players[id];
      const intent = INPUT_MANAGER.getIntent(id);
      PLAYER_MOVEMENT.apply(player, intent);

      if (window.STEALTH) STEALTH.update(player, delta);
    }

    if (window.ROUND) ROUND.update(delta);
    NETWORK.syncHostState();
    STATE.system.tick++;
  }

  function clientTick(delta) {
    // Client only sends input to host
    NETWORK.syncClientInput();
  }

  function loop(now) {
    if (!STATE.system.gameRunning) return;

    const delta = now - lastTime;
    lastTime = now;
    acc += delta;

    while (acc >= TICK_INTERVAL) {
      if (GAME.isHost()) {
        hostTick(TICK_INTERVAL);
      } else {
        clientTick(TICK_INTERVAL);
      }
      acc -= TICK_INTERVAL;
    }

    const me = STATE.players[STATE.localPlayerId];
    if (me) CAMERA.follow(me);

    CAMERA.update();
    RENDER.draw();
    animationFrameId = requestAnimationFrame(loop);
  }

  async function start() {
    if (STATE.system.gameRunning) return;
    console.log("GAME STARTING...");

    MAP_LOADER.init('retro_arena_01');
    const map = STATE.world.currentMap;
    const hostStart = map.spawn.p1;
    const joinStart = map.spawn.p2;

    // Host creates players
    if (GAME.isHost()) {
      PLAYER.create('p1', 'police', hostStart.x, hostStart.y, true);
      PLAYER.create('p2', 'maling', joinStart.x, joinStart.y, false);
    }
    
    // Client needs to wait for host state
    if (!GAME.isHost()) {
       NETWORK.onStateUpdate(newState => {
           if (newState.players) {
               STATE.players = newState.players;
           }
       });
    }

    if (window.SPRITE) await SPRITE.init();

    STATE.setBooting(false);
    STATE.setPlayable(true);
    STATE.setRenderReady(true);
    STATE.setGameRunning(true);

    if (window.__GAME__?.ready) window.__GAME__.ready();

    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
    console.log("GAME STARTED!");
  }

  function stop() {
    if (!STATE.system.gameRunning) return;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    STATE.setGameRunning(false);
    console.log("GAME STOPPED!");
  }

  function isHost() {
    return STATE.localPlayerId === 'p1';
  }

  window.GAME = { start, stop, isHost };

})();
