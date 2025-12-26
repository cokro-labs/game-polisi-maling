// ==================================
// KEYBOARD INPUT (FINAL – DESKTOP READY)
// ==================================
(function () {

  const keys = { up: false, down: false, left: false, right: false };

  function updateKey(e, isPressed) {
    const code = e.key;
    
    // Cek apakah tombol yang ditekan adalah kontrol game
    let isGameKey = false;

    switch (code) {
      case 'ArrowUp': case 'w': case 'W': 
        keys.up = isPressed; isGameKey = true; break;
      case 'ArrowDown': case 's': case 'S': 
        keys.down = isPressed; isGameKey = true; break;
      case 'ArrowLeft': case 'a': case 'A': 
        keys.left = isPressed; isGameKey = true; break;
      case 'ArrowRight': case 'd': case 'D': 
        keys.right = isPressed; isGameKey = true; break;
    }

    // Jika sedang main, matikan fungsi default tombol (scrolling via panah)
    if (isGameKey && window.STATE && STATE.system.playable) {
        e.preventDefault();
    }
  }

  window.addEventListener('keydown', e => updateKey(e, true));
  window.addEventListener('keyup', e => updateKey(e, false));

  window.INPUT = {
    getDirection() {
      if (!window.STATE || !STATE.system.playable || STATE.system.paused) {
        return { x: 0, y: 0 };
      }

      return {
        x: (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
        y: (keys.down ? 1 : 0) - (keys.up ? 1 : 0)
      };
    }
  };

})();