// ==================================
// TOUCH INPUT (FINAL – MOBILE READY)
// Virtual Joystick (Floating)
// ==================================
(function () {

  const state = {
    active: false,
    startX: 0,
    startY: 0,
    currX: 0,
    currY: 0
  };

  const THRESHOLD = 15; // Sedikit diperbesar agar tidak terlalu sensitif

  function onStart(e) {
    // 🔒 Cegah input jika game belum siap
    if (!window.STATE || !STATE.system.playable || STATE.system.paused) return;
    if (e.target.tagName === 'BUTTON') return; // Biarkan tombol UI tetap bisa dipencet

    // 🛑 STOP BROWSER SCROLLING
    if (e.cancelable) e.preventDefault();

    const t = e.touches[0];
    state.active = true;
    state.startX = t.clientX;
    state.startY = t.clientY;
    state.currX = t.clientX;
    state.currY = t.clientY;
  }

  function onMove(e) {
    if (!state.active) return;
    
    // 🛑 STOP BROWSER SCROLLING / PULL-TO-REFRESH
    if (e.cancelable) e.preventDefault();

    const t = e.touches[0];
    state.currX = t.clientX;
    state.currY = t.clientY;
  }

  function onEnd(e) {
    if (state.active) {
       // Opsional: prevent default saat lift-off jika perlu
       if (e.cancelable) e.preventDefault();
    }
    state.active = false;
  }

  // Passive: false wajib agar preventDefault bekerja
  window.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd);
  window.addEventListener('touchcancel', onEnd);

  window.TOUCH = {
    getDirection() {
      // Return 0 jika tidak aktif atau game paused
      if (!state.active || !window.STATE || !STATE.system.playable || STATE.system.paused) {
        return { x: 0, y: 0 };
      }

      const dx = state.currX - state.startX;
      const dy = state.currY - state.startY;
      
      // Floating Joystick Logic
      // Menggunakan Math.sign untuk output -1, 0, 1 (Digital feel)
      return {
        x: Math.abs(dx) > THRESHOLD ? Math.sign(dx) : 0,
        y: Math.abs(dy) > THRESHOLD ? Math.sign(dy) : 0
      };
    }
  };

})();