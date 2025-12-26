// ==================================
// MAP LOADER (FINAL – FAIL SAFE)
// ==================================

(function () {

  let loaded = false;

  function init(mapId) {
    if (loaded) return;

    if (!window.MAP || !STATE) {
      console.error('[MAP_LOADER] Dependency missing');
      return;
    }

    MAP.load(mapId);
    STATE.reset(false);

    loaded = true;
  }

  function reset() {
    loaded = false;
  }

  window.MAP_LOADER = {
    init,
    reset
  };

})();
