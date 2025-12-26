// ==================================
// BOT MANAGER (FINAL – ENGINE GRADE)
// Offline AI, Network-Safe
// ==================================

(function () {

  // -------------------------------
  // BOT CONFIG (LOCKED DEFAULT)
  // -------------------------------
  const BOT_CONFIG = {
    thinkInterval: 200,      // Bot berpikir setiap 200ms (biar tidak terlalu jago/curang)
    chaseDistance: 250,      // Jarak pandang bot (pixel)
    wanderInterval: 1200     // Ganti arah jalan santai setiap 1.2 detik
  };

  let botId = null;
  let targetId = null;
  let thinkTimer = 0;
  let wanderTimer = 0;
  let wanderDir = { x: 0, y: 0 };
  let active = false;

  // -------------------------------
  // VECTOR UTIL
  // -------------------------------
  function normalize(dx, dy) {
    const len = Math.hypot(dx, dy);
    if (len === 0) return { x: 0, y: 0 };
    return { x: dx / len, y: dy / len };
  }

  // -------------------------------
  // LINE OF SIGHT (RAYCASTING)
  // -------------------------------
  function hasLineOfSight(a, b) {
    // Safety check: Jika Map belum load, anggap buta
    if (!window.MAP || !MAP.isBlocked) return false;

    const steps = 10; // Cek 10 titik di antara bot dan pemain
    const dx = (b.x - a.x) / steps;
    const dy = (b.y - a.y) / steps;

    for (let i = 1; i <= steps; i++) {
      const px = a.x + dx * i;
      const py = a.y + dy * i;
      // Jika ada tembok di tengah jalan, return false
      if (MAP.isBlocked(px, py)) return false;
    }
    return true;
  }

  // -------------------------------
  // AI CORE (BRAIN)
  // -------------------------------
  function think(delta) {
    thinkTimer += delta;
    wanderTimer += delta;

    // Bot tidak perlu berpikir setiap frame (hemat CPU)
    if (thinkTimer < BOT_CONFIG.thinkInterval) return;
    thinkTimer = 0;

    // Validasi Entity
    if (!window.STATE || !STATE.players) return;
    
    const bot = STATE.players[botId];
    const target = STATE.players[targetId];

    if (!bot || !target) return; // Belum spawn

    // Hitung Jarak
    const dx = target.x - bot.x;
    const dy = target.y - bot.y;
    const dist = Math.hypot(dx, dy);

    let intent = { x: 0, y: 0 };

    // -------------------------------
    // MODE: CHASE (KEJAR)
    // -------------------------------
    // Syarat: Target dekat DAN tidak terhalang tembok
    if (dist < BOT_CONFIG.chaseDistance && hasLineOfSight(bot, target)) {
      const v = normalize(dx, dy);
      // Math.sign mengubah float menjadi -1, 0, atau 1 (seperti keyboard)
      intent = { x: Math.sign(v.x), y: Math.sign(v.y) };
    }

    // -------------------------------
    // MODE: WANDER (JALAN SANTAI)
    // -------------------------------
    else {
      // Ganti arah random jika timer habis
      if (wanderTimer > BOT_CONFIG.wanderInterval) {
        wanderTimer = 0;
        const dirs = [
          { x: 1, y: 0 }, { x: -1, y: 0 }, // Kanan, Kiri
          { x: 0, y: 1 }, { x: 0, y: -1 }, // Bawah, Atas
          { x: 0, y: 0 }, { x: 0, y: 0 }   // Diam (double chance)
        ];
        wanderDir = dirs[Math.floor(Math.random() * dirs.length)];
      }
      intent = wanderDir;
    }

    // Kirim Perintah ke Input Manager (seolah-olah bot menekan tombol)
    if (window.INPUT_MANAGER) {
        INPUT_MANAGER.setRemoteIntent(botId, intent);
    }
  }

  // -------------------------------
  // PUBLIC API
  // -------------------------------
  window.BOT = {

    start(asPlayerId) {
      botId = asPlayerId;
      // Jika bot jadi p1, musuh p2. Jika bot p2, musuh p1.
      targetId = asPlayerId === 'p1' ? 'p2' : 'p1';

      thinkTimer = 0;
      wanderTimer = 0;
      wanderDir = { x: 0, y: 0 };
      active = true;

      // Reset input sebelumnya
      if (window.INPUT_MANAGER) {
        INPUT_MANAGER.clearRemoteIntent(botId);
      }

      console.info(`[BOT] AI Started: Controlling ${botId} vs ${targetId}`);
    },

    stop() {
      if (!botId) return;
      if (window.INPUT_MANAGER) {
        INPUT_MANAGER.clearRemoteIntent(botId);
      }
      active = false;
      botId = null;
      targetId = null;
    },

    update(delta) {
      // Hanya jalan jika aktif dan game playable
      if (!active) return;
      if (!window.STATE || !STATE.system.playable || STATE.system.paused) return;
      
      think(delta);
    }
  };

})();