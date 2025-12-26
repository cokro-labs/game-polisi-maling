// ==================================
// SPRITE RENDERER (MODIFIED FOR PLACEHOLDERS)
// ==================================
(function () {

  // Immediately set to ready, bypassing asset loading
  let ready = true;

  function init() {
    // The init function is now empty but kept for compatibility.
    console.info('[SPRITE] Placeholder mode active. No assets will be loaded.');
  }

  function canDraw(player) {
    // This will now return false, triggering the placeholder drawing in renderer.js
    return false;
  }

  function draw(player) {
    // This function will not be called because canDraw is false,
    // but we'll clear it just in case.
  }

  window.SPRITE = { init, canDraw, draw };

})();
