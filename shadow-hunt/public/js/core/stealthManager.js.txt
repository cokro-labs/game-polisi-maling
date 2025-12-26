// ==================================
// STEALTH MANAGER (FINAL – MAP AWARE)
// ==================================

(function () {

  const CONFIG = {
    hideDelay: 600,       // ms diam di rumput → sembunyi
    revealDuration: 1200 // ms setelah keluar rumput
  };

  function update(player, delta) {
    if (player.role !== 'maling') return;

    const inGrass = MAP.isGrass(player.x, player.y);

    // Bergerak = tidak stealth
    if (!inGrass || player.moving) {
      player.stealth.grassTimer = 0;
      player.revealed = true;
      return;
    }

    // Diam di rumput → akumulasi stealth
    player.stealth.grassTimer += delta;

    if (player.stealth.grassTimer >= CONFIG.hideDelay) {
      player.revealed = false;
    }
  }

  window.STEALTH = { update };

})();
