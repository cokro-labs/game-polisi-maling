// ==================================
// GAME LOOP (FINAL – LIFECYCLE SAFE)
// ==================================
(function () {

  const TICK_INTERVAL = 1000 / CONFIG.TICK.RATE;
  let lastTime = performance.now();
  let acc = 0;
  let initialized = false;

  function tick(delta) {
    if (!STATE.system.playable || STATE.system.paused) return;

    if (window.BOT) BOT.update(delta);

    for (const id in STATE.players) {
      const player = STATE.players[id];
      const intent = INPUT_MANAGER.getIntent(id);
      PLAYER_MOVEMENT.apply(player, intent);

      if (window.STEALTH) {
        STEALTH.update(player, delta);
      }
    }

    if (window.ROUND) ROUND.update(delta);
    STATE.system.tick++;
  }

  async function loop(now) {
    const delta = now - lastTime;
    lastTime = now;
    acc += delta;

    if (!initialized) {
      MAP_LOADER.init('city_01');

      const me = STATE.players[STATE.localPlayerId];
      if (me) CAMERA.follow(me);

      if (window.SPRITE) await SPRITE.init();

      STATE.setBooting(false);
      STATE.setPlayable(true);
      STATE.setRenderReady(true);

      if (window.__GAME__?.ready) window.__GAME__.ready();
      initialized = true;
    }

    while (acc >= TICK_INTERVAL) {
      tick(TICK_INTERVAL);
      acc -= TICK_INTERVAL;
    }

    CAMERA.update();
    RENDER.draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

})();
