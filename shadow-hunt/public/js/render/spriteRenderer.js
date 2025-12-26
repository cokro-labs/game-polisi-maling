// ==================================
// SPRITE RENDERER (FINAL – AUTO SWAP)
// ==================================
(function () {

  const SPRITES = {
    police: {
      idle: { src: 'assets/characters/polisi/idle.png', frames: 1, speed: 1000 },
      walk: { src: 'assets/characters/polisi/walk.png', frames: 4, speed: 140 }
    },
    maling: {
      idle: { src: 'assets/characters/maling/idle.png', frames: 1, speed: 1000 },
      walk: { src: 'assets/characters/maling/walk.png', frames: 4, speed: 140 }
    }
  };

  const cache = {};
  let ready = false;

  function loadImage(key, src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => { cache[key] = img; resolve(true); };
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function init() {
    if (ready) return;
    const jobs = [];
    for (const r in SPRITES) {
      for (const a in SPRITES[r]) {
        jobs.push(loadImage(`${r}_${a}`, SPRITES[r][a].src));
      }
    }
    await Promise.all(jobs);
    ready = true;
    console.info('[SPRITE] Assets ready');
  }

  function canDraw(player) {
    if (!ready || !player) return false;
    const anim = player.moving ? 'walk' : 'idle';
    return !!cache[`${player.role}_${anim}`];
  }

  function draw(player) {
    if (!canDraw(player)) return;

    const ctx = window.__GAME__.ctx;
    const scale = CONFIG.CANVAS.PIXEL_RATIO;
    const size = CONFIG.PLAYER.SIZE * scale;

    const anim = player.moving ? 'walk' : 'idle';
    const def = SPRITES[player.role][anim];
    const img = cache[`${player.role}_${anim}`];

    const frame =
      def.frames > 1
        ? Math.floor(performance.now() / def.speed) % def.frames
        : 0;

    const fw = img.width / def.frames;
    const pos = CAMERA.worldToScreen(player.x, player.y);

    ctx.drawImage(
      img,
      frame * fw, 0, fw, img.height,
      pos.x, pos.y, size, size
    );
  }

  window.SPRITE = { init, canDraw, draw };

})();
