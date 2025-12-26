// ==================================
// ROUND MANAGER (FINAL – CLEAN)
// ==================================
(function () {

  const ROUND_TIME = 120000;
  const COUNTDOWN = 3000;
  const CATCH_DIST = 14;

  let timeLeft = ROUND_TIME;
  let countdown = 0;
  let inCountdown = false;

  function getPlayers() {
    let police, maling;
    for (const id in STATE.players) {
      const p = STATE.players[id];
      if (p.role === 'police') police = p;
      if (p.role === 'maling') maling = p;
    }
    return { police, maling };
  }

  function endRound(winner) {
    STATE.system.winner = winner;
    STATE.reset(false);
    inCountdown = true;
    countdown = COUNTDOWN;
  }

  function update(delta) {
    if (inCountdown) {
      countdown -= delta;
      if (countdown <= 0) {
        inCountdown = false;
        timeLeft = ROUND_TIME;
        STATE.system.winner = null;
        STATE.setPlayable(true); // 🔒 KUNCI PENTING
      }
      return;
    }

    timeLeft -= delta;
    const { police, maling } = getPlayers();
    if (!police || !maling) return;

    const dx = police.x - maling.x;
    const dy = police.y - maling.y;
    if (Math.hypot(dx, dy) <= CATCH_DIST) {
      endRound('police');
    } else if (timeLeft <= 0) {
      endRound('maling');
    }
  }

  window.ROUND = {
    update,
    isCountdown: () => inCountdown,
    getTimeLeft: () => Math.ceil(timeLeft / 1000)
  };

})();
