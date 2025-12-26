// ==================================
// INPUT MANAGER (FINAL – STATE AWARE)
// Local / Remote / Bot Unified
// ==================================
(function () {

  const remoteIntents = {};
  const ZERO = { x: 0, y: 0 };

  function readLocalInput() {
    if (!STATE.system.playable || STATE.system.paused) return ZERO;

    const k = window.INPUT ? window.INPUT.getDirection() : ZERO;
    const t = window.TOUCH ? window.TOUCH.getDirection() : ZERO;

    return {
      x: k.x !== 0 ? k.x : t.x,
      y: k.y !== 0 ? k.y : t.y
    };
  }

  window.INPUT_MANAGER = {

    updateLocal(playerId) {
      // API placeholder (future prediction / buffering)
    },

    getIntent(playerId) {
      // Local player
      if (playerId === STATE.localPlayerId) {
        return readLocalInput();
      }

      // Remote / Bot player
      return remoteIntents[playerId] || ZERO;
    },

    setRemoteIntent(playerId, intent) {
      remoteIntents[playerId] = intent || ZERO;
    },

    clearRemoteIntent(playerId) {
      remoteIntents[playerId] = ZERO;
    },

    resetAll() {
      for (const id in remoteIntents) {
        remoteIntents[id] = ZERO;
      }
    }
  };

})();
