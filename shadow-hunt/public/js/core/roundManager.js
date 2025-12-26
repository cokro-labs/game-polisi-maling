// ==================================
// ROUND MANAGER (V3 - FULL SWAP LOGIC)
// ==================================
(function () {

  const ROUND_TIME = 120000; // 2 minutes
  const COUNTDOWN = 5000;    // 5 seconds between rounds
  const CATCH_DIST = 14;

  let timeLeft = ROUND_TIME;
  let countdown = 0;
  let inCountdown = false;

  function getPlayers() {
    return { p1: STATE.players.p1, p2: STATE.players.p2 };
  }

  // --- HOST-ONLY LOGIC ---
  function swapRolesAndReset() {
    if (!GAME.isHost()) return;

    const { p1, p2 } = getPlayers();
    if (!p1 || !p2) return;

    // Swap roles
    const oldP1Role = p1.role;
    p1.role = p2.role;
    p2.role = oldP1Role;

    // Reset positions to their original spawns
    const map = STATE.world.currentMap;
    p1.x = map.spawn.p1.x;
    p1.y = map.spawn.p1.y;
    p2.x = map.spawn.p2.x;
    p2.y = map.spawn.p2.y;

    console.log(`[ROUND] Roles swapped. P1 is now ${p1.role}, P2 is ${p2.role}.`);
  }

  // --- HOST-ONLY LOGIC ---
  function endRound(winner) {
    if (!GAME.isHost()) return;
    
    console.log(`[ROUND] Round over. Winner: ${winner}`);
    STATE.system.winner = winner;
    STATE.setPlayable(false); 
    inCountdown = true;
    countdown = COUNTDOWN;
  }

  function update(delta) {
    // This entire block should only be run by the host,
    // as the host is the authority for the game state.
    if (!GAME.isHost()) return;

    if (inCountdown) {
      countdown -= delta;
      if (countdown <= 0) {
        // Countdown finished, start the next round
        inCountdown = false;
        timeLeft = ROUND_TIME;
        STATE.system.winner = null;

        swapRolesAndReset(); // <--- NEW LOGIC

        // Make game playable again AFTER roles are swapped and positions are reset
        STATE.setPlayable(true); 
      }
      return; // Don't run game logic during countdown
    }

    // --- Regular round logic ---
    if (!STATE.system.playable) return;

    timeLeft -= delta;
    const { police, maling } = (function() {
        let p, m;
        for (const id in STATE.players) {
            const player = STATE.players[id];
            if (player.role === 'police') p = player;
            else if (player.role === 'maling') m = player;
        }
        return { police: p, maling: m };
    })();

    if (!police || !maling) return;

    // Check for catch
    const dx = police.x - maling.x;
    const dy = police.y - maling.y;
    if (Math.hypot(dx, dy) <= CATCH_DIST) {
      endRound('police');
    }
    // Check for time up
    else if (timeLeft <= 0) {
      endRound('maling');
    }
  }

  window.ROUND = {
    update,
    isCountdown: () => inCountdown,
    getTimeLeft: () => Math.max(0, Math.ceil(timeLeft / 1000)),
    getCountdown: () => Math.max(0, Math.ceil(countdown / 1000))
  };

})();
