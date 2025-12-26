// ==================================
// CONFIG (FINAL – FIXED SPEED)
// ==================================
(function () {
  const DPR = window.devicePixelRatio || 1;

  window.CONFIG = {
    CANVAS: {
      BG_COLOR: '#050505',
      PIXEL_RATIO: DPR
    },
    WORLD: {
      TILE_SIZE: 16
    },
    PLAYER: {
      SIZE: 14,
      // UBAH INI: 1.2 terlalu pelan untuk sistem "per detik".
      // Coba 90 pixel/detik (sekitar 3 kotak per detik)
      SPEED: 90 
    },
    TICK: {
      RATE: 30 // 30 Tick per detik
    },
    DEBUG: {
      SHOW_GRID: false
    }
  };
})();// ==================================
// STATE (FINAL – SINGLE AUTHORITY)
// ==================================
(function () {

  const system = {
    booting: true,
    playable: false,
    renderReady: false,
    paused: true,
    tick: 0,
    winner: null,
    gameRunning: false
  };

  const players = {};
  const world = {
    seed: Math.floor(Math.random() * 999999),
    currentMap: null,
    ready: false
  };

  function reset(full = false) {
    system.paused = true;
    system.winner = null;

    if (full) {
      world.currentMap = null;
      world.ready = false;
    }

    if (world.currentMap) {
        for (const id in players) {
            const p = players[id];
            const spawn = world.currentMap.spawn[id];
            if (spawn) {
                p.x = spawn.x * world.currentMap.tileSize;
                p.y = spawn.y * world.currentMap.tileSize;
            }

            p.moving = false;
            p.caught = false;
            p.revealed = true;
            p.stealth.grassTimer = 0;
        }
    }
  }

  window.STATE = {
    system,
    players,
    world,

    localPlayerId: null,

    setPlayable(val) {
      system.playable = val;
      system.paused = !val;
    },

    setRenderReady(val) {
      system.renderReady = val;
    },

    setBooting(val) {
      system.booting = val;
    },
    
    setGameRunning(val) {
        system.gameRunning = val;
    },

    reset
  };

})();
// ==================================
// PLAYER FACTORY (FINAL – BALANCED)
// Role-based stats
// ==================================
(function () {

  function create(id, role, startX, startY, isLocal = false) {
    const baseSpeed = CONFIG.PLAYER.SPEED;
    const speedMultiplier = role === 'police' ? 1.1 : 1.0;

    const player = {
      id,
      role, // 'police' | 'thief'
      x: startX,
      y: startY,
      width: CONFIG.PLAYER.SIZE,
      height: CONFIG.PLAYER.SIZE,

      // Stats
      speed: baseSpeed * speedMultiplier,

      // State Flags
      moving: false,
      caught: false,
      revealed: false,

      // Sprite & Animasi
      sprite: {
        name: role === 'police' ? 'polisi' : 'maling',
        state: 'idle',
        dir: 'down',
        frame: 0,
        timer: 0
      },

      // Utility
      stealth: {
        grassTimer: 0
      },

      // Multiplayer sync
      isLocal: isLocal
    };

    STATE.players[id] = player;
    return player;
  }

  function destroy(id) {
    if (STATE.players[id]) {
      delete STATE.players[id];
    }
  }

  function reset() {
    for (const id in STATE.players) {
      destroy(id);
    }
  }

  window.PLAYER = {
    create,
    destroy,
    reset
  };
  
})();
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

})();// ==================================
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

})();// ==================================
// INPUT MANAGER (FINAL – STATE AWARE)
// Local / Remote / Bot Unified
// ==================================
(function () {

  const remoteIntents = {};
  const ZERO = { x: 0, y: 0 };

  function readLocalInput() {
    if (!STATE.system.playable || STATE.system.paused) return ZERO;

    const k = window.INPUT ? window.INPUT.getDirection() : ZERO;
    const t = window.TOUCH ? window.TOUCH.getDirection() : ZERO;

    return {
      x: k.x !== 0 ? k.x : t.x,
      y: k.y !== 0 ? k.y : t.y
    };
  }

  window.INPUT_MANAGER = {

    updateLocal(playerId) {
      // API placeholder (future prediction / buffering)
    },

    getIntent(playerId) {
      // Local player
      if (playerId === STATE.localPlayerId) {
        return readLocalInput();
      }

      // Remote / Bot player
      return remoteIntents[playerId] || ZERO;
    },

    setRemoteIntent(playerId, intent) {
      remoteIntents[playerId] = intent || ZERO;
    },

    clearRemoteIntent(playerId) {
      remoteIntents[playerId] = ZERO;
    },

    resetAll() {
      for (const id in remoteIntents) {
        remoteIntents[id] = ZERO;
      }
    }
  };

})();
// ==================================
// MAP GENERATOR (NEW RETRO MAP)
// ==================================

(function () {

  // Define a new, retro-inspired color palette for the map
  const PALETTE = {
    BACKGROUND: '#1a1a2e', // Dark blue, almost black
    GROUND: '#1f2a40',     // A slightly lighter, muted blue
    WALL: '#e94560',       // A vibrant, retro red for obstacles
    GRASS: '#0f3460',      // A deep blue for accent areas
  };

  const TILE = {
    GROUND: 0,
    WALL: 1,
    GRASS: 2
  };

  function generateRetroMap(seed) {
    const width = 60;
    const height = 40;
    const tileSize = CONFIG.WORLD.TILE_SIZE;
    const grid = new Array(width * height).fill(TILE.GROUND);

    // Create a border of walls
    for (let x = 0; x < width; x++) {
      grid[x] = TILE.WALL;
      grid[x + (height - 1) * width] = TILE.WALL;
    }
    for (let y = 0; y < height; y++) {
      grid[y * width] = TILE.WALL;
      grid[y * width + (width - 1)] = TILE.WALL;
    }

    // Add a central obstacle course
    for (let y = 10; y < height - 10; y++) {
      grid[y * width + 15] = TILE.WALL;
      grid[y * width + width - 16] = TILE.WALL;
    }
    for (let x = 20; x < width - 20; x++) {
        if (x < 25 || x > width - 26) {
            grid[15 * width + x] = TILE.WALL;
            grid[(height - 16) * width + x] = TILE.WALL;
        }
    }

    // Add some accent grass patches
    for(let i = 0; i < 5; i++) {
        grid[(18+i) * width + 28] = TILE.GRASS;
        grid[(18+i) * width + width - 29] = TILE.GRASS;
    }

    return {
      id: 'retro_arena_01',
      seed,
      tileSize,
      width,
      height,
      grid,
      spawn: {
        p1: { x: 5, y: 5 },
        p2: { x: width - 6, y: height - 6 }
      },
      TILE,
      PALETTE, // Expose the new palette
      isNavigable(tile) {
        return tile !== TILE.WALL;
      }
    };
  }

  window.MAPS = {
    generate(seed) {
      // We will now use the new retro map generator
      return generateRetroMap(seed);
    }
  };

})();
// ==================================
// MAP MANAGER (FINAL – HARDENED)
// ==================================

(function () {

  function load(mapId) {
    if (!window.MAPS) {
      throw new Error('[MAP] MAPS not loaded');
    }

    const seed = STATE.world.seed;
    const map = MAPS.generate(seed);

    STATE.world.currentMap = map;
    STATE.world.ready = true;

    console.info(`[MAP] Loaded '${map.id}' (Seed: ${seed})`);
  }

  function getTileAt(x, y) {
    const map = STATE.world.currentMap;
    if (!map) return 0;

    const tx = Math.floor(x / map.tileSize);
    const ty = Math.floor(y / map.tileSize);

    if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) {
      return map.TILE.WALL;
    }

    return map.grid[ty * map.width + tx];
  }

  function isBlocked(x, y) {
    const map = STATE.world.currentMap;
    if (!map) return true;
    return getTileAt(x, y) === map.TILE.WALL;
  }

  function isGrass(x, y) {
    const map = STATE.world.currentMap;
    if (!map) return false;
    return getTileAt(x, y) === map.TILE.GRASS;
  }

  window.MAP = {
    load,
    getTileAt,
    isBlocked,
    isGrass
  };

})();
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
// ==================================
// COLLISION SYSTEM (FINAL – HARDENED)
// Map-aware, Corner-safe, Future-proof
// ==================================
(function () {

  const EPS = 0.01; // margin aman anti jitter

  function canMoveTo(player, x, y) {
    if (!window.MAP) return false;

    const w = player.width;
    const h = player.height;

    // Empat sudut bounding box
    const points = [
      { x: x + EPS,       y: y + EPS },
      { x: x + w - EPS,   y: y + EPS },
      { x: x + EPS,       y: y + h - EPS },
      { x: x + w - EPS,   y: y + h - EPS }
    ];

    for (const p of points) {
      if (MAP.isBlocked(p.x, p.y)) {
        return false;
      }
    }
    return true;
  }

  window.PLAYER_COLLISION = { canMoveTo };

})();
// ==================================
// PLAYER MOVEMENT (FINAL – PRODUCTION READY)
// Frame-Rate Independent, Wall Sliding
// ==================================

(function () {

  // dt = delta time (dalam detik), dikirim dari Game Loop
  function apply(player, intent) {
    // ----------------------------------
    // HARD GUARDS
    // ----------------------------------
    if (STATE.system.paused || player.caught) {
      player.moving = false;
      return;
    }

    // ----------------------------------
    // READ INTENT
    // ----------------------------------
    let dx = intent.x || 0;
    let dy = intent.y || 0;

    if (dx === 0 && dy === 0) {
      player.moving = false;
      return;
    }

    player.moving = true;

    // ----------------------------------
    // NORMALIZE DIAGONAL SPEED
    // ----------------------------------
    // Mencegah lari diagonal lebih cepat (Cheat Pythagoras)
    if (dx !== 0 && dy !== 0) {
      const norm = 0.70710678; 
      dx *= norm;
      dy *= norm;
    }

    // ----------------------------------
    // CALCULATE NEXT POSITION (Time-Based)
    // ----------------------------------
    // BUG FIX: Menggunakan 'dt' agar 60FPS dan 144FPS punya speed sama
    // Default dt = 0.016 (approx 60fps) jika undefined (safety)
    const timeStep = 1 / CONFIG.TICK.RATE;
    
    const moveDist = player.speed * timeStep;
    const nextX = player.x + dx * moveDist;
    const nextY = player.y + dy * moveDist;

    // ----------------------------------
    // COLLISION & WALL SLIDING
    // ----------------------------------
    let moved = false;

    // 1. Coba gerak Horizontal (X)
    if (PLAYER_COLLISION.canMoveTo(player, nextX, player.y)) {
      player.x = nextX;
      moved = true;
    }

    // 2. Coba gerak Vertikal (Y)
    // Gunakan player.x terbaru agar bisa "sliding" di tembok
    if (PLAYER_COLLISION.canMoveTo(player, player.x, nextY)) {
      player.y = nextY;
      moved = true;
    }

    // ----------------------------------
    // SYNC STATE
    // ----------------------------------
    player.moving = moved;
  }

  window.PLAYER_MOVEMENT = { apply };

})();// ==================================
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

})();// ==================================
// CAMERA (FINAL – STABLE & SAFE)
// ==================================
(function () {

  let target = null;
  let x = 0;
  let y = 0;

  function follow(entity) {
    target = entity;
  }

  function update() {
    if (!target || !STATE.world.currentMap) return;

    const map = STATE.world.currentMap;
    const viewW = window.__GAME__.canvas.width / CONFIG.CANVAS.PIXEL_RATIO;
    const viewH = window.__GAME__.canvas.height / CONFIG.CANVAS.PIXEL_RATIO;

    x = target.x + target.width / 2 - viewW / 2;
    y = target.y + target.height / 2 - viewH / 2;

    x = Math.max(0, Math.min(x, map.width * map.tileSize - viewW));
    y = Math.max(0, Math.min(y, map.height * map.tileSize - viewH));
  }

  function worldToScreen(wx, wy) {
    const scale = CONFIG.CANVAS.PIXEL_RATIO;
    return {
      x: (wx - x) * scale,
      y: (wy - y) * scale
    };
  }

  window.CAMERA = { follow, update, worldToScreen };

})();
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
// ==================================
// FOG OF WAR (FINAL – SAFE)
// ==================================
(function () {

  const BASE_RADIUS = 110;
  const POLICE_MULT = 1.8;
  const GRASS_PENALTY = 0.6;

  function draw(player) {
    if (!STATE.system.renderReady || !player) return;

    const ctx = window.__GAME__.ctx;
    const canvas = window.__GAME__.canvas;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.92)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let r = BASE_RADIUS;
    if (player.role === 'police') r *= POLICE_MULT;
    if (MAP.isGrass(player.x, player.y)) r *= GRASS_PENALTY;

    r *= CONFIG.CANVAS.PIXEL_RATIO;

    const pos = CAMERA.worldToScreen(player.x, player.y);
    const size = CONFIG.PLAYER.SIZE * CONFIG.CANVAS.PIXEL_RATIO;
    const cx = pos.x + size / 2;
    const cy = pos.y + size / 2;

    const drawVisionShape = () => {
        ctx.beginPath();
        if (player.role === 'police') {
            ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, Math.PI * 2);
        } else {
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    ctx.globalCompositeOperation = 'destination-out';
    drawVisionShape();

    ctx.globalCompositeOperation = 'source-over';
    if (player.role === 'police') {
        ctx.fillStyle = 'rgba(128, 0, 128, 0.2)';
        drawVisionShape();
    }


    ctx.restore();
  }

  window.FOG = { draw };

})();// ==================================
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
// ==================================
// RENDERER (PALETTE-AWARE)
// ==================================
(function () {

  const canvas = window.__GAME__.canvas;
  const ctx = window.__GAME__.ctx;

  function clear() {
    const map = STATE.world.currentMap;
    // Use the map's background color, or fallback to default
    ctx.fillStyle = map?.PALETTE?.BACKGROUND || CONFIG.CANVAS.BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawMap() {
    const map = STATE.world.currentMap;
    if (!map) return;

    const ts = map.tileSize * CONFIG.CANVAS.PIXEL_RATIO;
    const palette = map.PALETTE || {};

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.grid[y * map.width + x];
        if (tile === map.TILE.GROUND) continue;

        const pos = CAMERA.worldToScreen(x * map.tileSize, y * map.tileSize);

        switch (tile) {
          case map.TILE.WALL:
            ctx.fillStyle = palette.WALL || '#e94560';
            ctx.fillRect(pos.x, pos.y, ts, ts);
            break;
          case map.TILE.GRASS:
            ctx.fillStyle = palette.GRASS || '#0f3460';
            ctx.fillRect(pos.x, pos.y, ts, ts);
            break;
        }
      }
    }
  }

  function drawPlaceholder(player) {
    const size = CONFIG.PLAYER.SIZE * CONFIG.CANVAS.PIXEL_RATIO;
    const pos = CAMERA.worldToScreen(player.x, player.y);
    ctx.save();
    ctx.globalAlpha = 0.9;
    
    // Match placeholder colors to the retro theme
    if (player.role === 'police') {
      ctx.fillStyle = '#4FC3F7'; // A brighter, cyberpunk blue
      ctx.beginPath();
      ctx.arc(pos.x + size / 2, pos.y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#FFD700'; // A vibrant, cyberpunk gold
      ctx.fillRect(pos.x, pos.y, size, size);
    }
    ctx.restore();
  }

  function drawPlayer(player) {
    if (window.SPRITE && SPRITE.canDraw(player)) {
      SPRITE.draw(player);
    } else {
      drawPlaceholder(player);
    }
  }

  function draw() {
    if (!STATE.system.renderReady) return;
    clear();
    if (!STATE.world.currentMap) return;

    drawMap();

    for (const id in STATE.players) {
      drawPlayer(STATE.players[id]);
    }

    const me = STATE.players[STATE.localPlayerId];
    if (window.FOG && me) FOG.draw(me);
    if (window.HUD) HUD.draw();
  }

  window.RENDER = { draw };

})();
// ==================================
// GAME LOOP (AUTHORITATIVE HOST)
// ==================================
(function () {

  const TICK_INTERVAL = 1000 / CONFIG.TICK.RATE;
  let lastTime = 0;
  let acc = 0;
  let animationFrameId = null;

  function hostTick(delta) {
    if (window.BOT) BOT.update(delta);

    for (const id in STATE.players) {
      const player = STATE.players[id];
      const intent = INPUT_MANAGER.getIntent(id);
      PLAYER_MOVEMENT.apply(player, intent);

      if (window.STEALTH) STEALTH.update(player, delta);
    }

    if (window.ROUND) ROUND.update(delta);
    NETWORK.syncHostState();
    STATE.system.tick++;
  }

  function clientTick(delta) {
    // Client only sends input to host
    NETWORK.syncClientInput();
  }

  function loop(now) {
    if (!STATE.system.gameRunning) return;

    const delta = now - lastTime;
    lastTime = now;
    acc += delta;

    while (acc >= TICK_INTERVAL) {
      if (GAME.isHost()) {
        hostTick(TICK_INTERVAL);
      } else {
        clientTick(TICK_INTERVAL);
      }
      acc -= TICK_INTERVAL;
    }

    const me = STATE.players[STATE.localPlayerId];
    if (me) CAMERA.follow(me);

    CAMERA.update();
    RENDER.draw();
    animationFrameId = requestAnimationFrame(loop);
  }

  async function start() {
    if (STATE.system.gameRunning) return;
    console.log("GAME STARTING...");

    MAP_LOADER.init('retro_arena_01');
    const map = STATE.world.currentMap;
    const hostStart = map.spawn.p1;
    const joinStart = map.spawn.p2;

    // Host creates players
    if (GAME.isHost()) {
      PLAYER.create('p1', 'police', hostStart.x, hostStart.y, true);
      PLAYER.create('p2', 'maling', joinStart.x, joinStart.y, false);
    }
    
    // Client needs to wait for host state
    if (!GAME.isHost()) {
       NETWORK.onStateUpdate(newState => {
           if (newState.players) {
               STATE.players = newState.players;
           }
       });
    }

    if (window.SPRITE) await SPRITE.init();

    STATE.setBooting(false);
    STATE.setPlayable(true);
    STATE.setRenderReady(true);
    STATE.setGameRunning(true);

    if (window.__GAME__?.ready) window.__GAME__.ready();

    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
    console.log("GAME STARTED!");
  }

  function stop() {
    if (!STATE.system.gameRunning) return;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    STATE.setGameRunning(false);
    console.log("GAME STOPPED!");
  }

  function isHost() {
    return STATE.localPlayerId === 'p1';
  }

  window.GAME = { start, stop, isHost };

})();
// ==================================
// NETWORK MANAGER (V3 - HOST START)
// ==================================
(function() {

  let firebaseRef = null;
  let onReadyCallback = null;       // Called when the local setup is ready
  let onOpponentJoined = null;    // Called for the host when a player joins
  let onGameStartSignal = null;   // Called for both when host starts the game
  let roomRole = null;
  let roomId = null;

  function initFirebase() {
    if (!window.firebase) return console.error("Firebase not loaded!");
    if (firebase.apps.length === 0) firebase.initializeApp(CONFIG.FIREBASE);
    firebaseRef = firebase.database().ref('rooms');
  }

  function isHost() {
    return roomRole === 'host';
  }

  function listenForGameStart() {
    const startRef = firebaseRef.child(roomId).child('system/gameStarted');
    startRef.on('value', (snap) => {
      if (snap.val() === true) {
        console.log("[NETWORK] Received start signal from host.");
        if (onGameStartSignal) onGameStartSignal();
        startRef.off(); // Stop listening after starting
      }
    });
  }

  function connectToRoom() {
    const roomRef = firebaseRef.child(roomId);
    
    // Listen for the start signal regardless of role
    listenForGameStart();

    if (isHost()) {
      const hostData = { host: { online: true }, join: { online: false }, system: { gameStarted: false } };
      roomRef.set(hostData);
      roomRef.child('join/online').on('value', (snap) => {
        if (snap.val() === true) {
          console.log("[NETWORK] Opponent has joined the room.");
          STATE.setOpponentConnected(true);
          if (onOpponentJoined) onOpponentJoined(); // NEW: Signal UI to show start button
          roomRef.child('join/online').off();
        }
      });
      // Host is ready immediately for lobby
      if (onReadyCallback) onReadyCallback();

    } else { // Is Joiner
      const joinRef = roomRef.child('join');
      joinRef.onDisconnect().set({ online: false });
      joinRef.update({ online: true });
      STATE.setOpponentConnected(true);

      // Listen for host state changes
      roomRef.child('host/state').on('value', (snap) => {
        if (snap.val() && onStateUpdateCallback) onStateUpdateCallback(snap.val());
      });

      // Joiner is ready immediately for lobby
      if (onReadyCallback) onReadyCallback();
    }
  }

  function syncClientInput() {
    if (isHost() || !firebaseRef) return;
    const input = INPUT_MANAGER.getIntent(STATE.localPlayerId);
    firebaseRef.child(roomId).child('join/state/input').set(input);
  }

  function syncHostState() {
    if (!isHost() || !firebaseRef) return;
    // Include round manager state in sync
    const syncData = {
      players: STATE.players,
      system: {
        tick: STATE.system.tick,
        winner: STATE.system.winner,
        inCountdown: ROUND.isCountdown(),
        countdown: ROUND.getCountdown()
      }
    };
    firebaseRef.child(roomId).child('host/state').set(syncData);
  }

  // --- Public API ---
  window.NETWORK = {
    init(id, role, callbacks) {
      roomId = id;
      roomRole = role;
      onReadyCallback = callbacks.onReady; // For lobby UI
      onOpponentJoined = callbacks.onOpponentJoined; // For host's start button
      onGameStartSignal = callbacks.onGameStart; // To start the actual game
      onStateUpdateCallback = callbacks.onStateUpdate;

      STATE.setLocalPlayerId(isHost() ? 'p1' : 'p2');
      initFirebase();
      connectToRoom();
    },

    initOffline(onReady) {
      roomId = 'offline';
      roomRole = 'host';
      STATE.setLocalPlayerId('p1');
      STATE.setOpponentConnected(true);
      if (window.BOT) BOT.start('p2');
      // For offline, ready means start
      if (onReady) onReady();
    },

    signalStartGame() {
        if (!isHost() || !firebaseRef) return;
        console.log("[NETWORK] Host is starting the game.");
        firebaseRef.child(roomId).child('system/gameStarted').set(true);
    },
    
    syncHostState,
    syncClientInput
  };

})();
