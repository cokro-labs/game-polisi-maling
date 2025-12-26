// ==================================
// HUD (FINAL – ENGINE SAFE)
// js/ui/hud.js
// ==================================
(function () {

  if (!window.__GAME__) {
    console.warn('[HUD] __GAME__ not ready');
    return;
  }

  const { canvas, ctx } = window.__GAME__;

  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function drawText(text, x, y, size = 20, color = '#fff', align = 'center') {
    ctx.save();
    ctx.font = `bold ${size}px 'Courier New', monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function draw() {
    // ===============================
    // HARD GUARD: STATE WAJIB ADA
    // ===============================
    if (!window.STATE || !STATE.system) return;

    const sys = STATE.system;
    const me = STATE.players?.[STATE.localPlayerId];

    // ===============================
    // MODE: BOOT / LOADING
    // ===============================
    if (!sys.renderReady || !me) {
      drawText('LOADING...', canvas.width / 2, canvas.height / 2, 24, '#cccccc');
      return;
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // ===============================
    // MODE: GAME OVER (WINNER)
    // ===============================
    if (sys.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const policeWin = sys.winner === 'police';
      drawText(
        policeWin ? 'POLISI MENANG!' : 'MALING LOLOS!',
        cx,
        cy - 20,
        40,
        policeWin ? '#4da6ff' : '#4dff88'
      );

      // Countdown HANYA jika ini transisi ronde
      if (sys.playable && window.ROUND?.isCountdown?.()) {
        drawText('Ronde baru dimulai...', cx, cy + 40, 16, '#ffffff');
      }
      return;
    }

    // ===============================
    // MODE: PAUSED
    // ===============================
    if (sys.paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawText('PAUSED', cx, cy, 32, '#ffffff');
      return;
    }

    // ===============================
    // MODE: GAMEPLAY HUD
    // ===============================

    // ROLE
    drawText(
      `ROLE: ${me.role.toUpperCase()}`,
      20,
      30,
      16,
      me.role === 'police' ? '#4da6ff' : '#4dff88',
      'left'
    );

    // TIMER (HANYA JIKA ROUND AKTIF)
    if (window.ROUND && sys.playable) {
      const t = ROUND.getTimeLeft();
      const pulse = t <= 10 ? Math.sin(Date.now() / 100) * 4 : 0;
      drawText(
        formatTime(t),
        cx,
        30,
        26 + pulse,
        t <= 15 ? '#ff4040' : '#ffffff'
      );
    }

    // DETECTED WARNING
    if (me.role === 'maling' && me.revealed) {
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() / 100);
      drawText('TERDETEKSI!', cx, canvas.height - 100, 24, '#ff4040');
      ctx.globalAlpha = 1;
    }
  }

  window.HUD = { draw };

})();
