(function () {
  const CONFIG = { hideDelay: 600 };

  function update(player, delta) {
    if (player.role !== 'maling') return;
    if (!MAP.isGrass(player.x, player.y) || player.moving) {
      player.stealth.grassTimer = 0;
      player.revealed = true;
      return;
    }
    player.stealth.grassTimer += delta;
    if (player.stealth.grassTimer >= CONFIG.hideDelay) {
      player.revealed = false;
    }
  }

  window.STEALTH = { update };
})();
