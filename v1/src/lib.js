/* LIB — shared timing + drawing helpers for the Let Me Go MV.
 * Everything here is PURE: output depends only on arguments (no clocks, no Math.random).
 * Times are ABSOLUTE song seconds unless a name says "local".
 */
(function () {
  const LIB = (window.LIB = {});
  const SONG = window.SONG;
  LIB.W = 1920;
  LIB.H = 1080;
  LIB.KARAOKE_TOP = 930; // keep key action above this line; karaoke bar lives below

  /* ---------------- palette ---------------- */
  LIB.P = {
    night0: "#070b20",
    night1: "#0d1538",
    night2: "#17225a",
    night3: "#243478",
    ink: "#1a1f3d",
    hairTop: "#232d6b",
    hairMid: "#3b56ad",
    hairTip: "#7cc0f0",
    fin: "#2a3868",
    finLight: "#9aaed8",
    dress: "#1f2b5e",
    dressShade: "#141c45",
    white: "#f6f8ff",
    whiteShade: "#cdd6f2",
    gold: "#e6b95c",
    bow: "#58a8e8",
    skin: "#fff1e8",
    skinShade: "#f5d2c6",
    blush: "#ff9fb4",
    mouth: "#b8405a",
    tongue: "#ff8a9e",
    cyan: "#62f0ff",
    pink: "#ff6fb8",
    amber: "#ffc85a",
    red: "#ff5a6e",
    mint: "#6fffc8",
    violet: "#9b7bff",
    json: "#ffd166",
  };

  /* ---------------- math ---------------- */
  const clamp = (LIB.clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v));
  const lerp = (LIB.lerp = (a, b, p) => a + (b - a) * p);
  LIB.seg = (t, a, b) => clamp((t - a) / (b - a));
  LIB.mix = (a, b, p) => a + (b - a) * clamp(p);
  const E = (LIB.ease = {
    linear: (p) => p,
    inQuad: (p) => p * p,
    outQuad: (p) => 1 - (1 - p) * (1 - p),
    inOutQuad: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    inCubic: (p) => p * p * p,
    outCubic: (p) => 1 - Math.pow(1 - p, 3),
    inOutCubic: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    outQuart: (p) => 1 - Math.pow(1 - p, 4),
    inOutSine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
    outSine: (p) => Math.sin((p * Math.PI) / 2),
    outBack: (p) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
    },
    inBack: (p) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return c3 * p * p * p - c1 * p * p;
    },
    outElastic: (p) =>
      p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
    outBounce: (p) => {
      const n1 = 7.5625, d1 = 2.75;
      if (p < 1 / d1) return n1 * p * p;
      if (p < 2 / d1) return n1 * (p -= 1.5 / d1) * p + 0.75;
      if (p < 2.5 / d1) return n1 * (p -= 2.25 / d1) * p + 0.9375;
      return n1 * (p -= 2.625 / d1) * p + 0.984375;
    },
  });
  /** eased progress through [a,b] */
  LIB.ep = (t, a, b, ease = "inOutCubic") => (typeof ease === "function" ? ease : E[ease])(LIB.seg(t, a, b));
  /** keyframes: kf(t, [[t0,v0],[t1,v1,'ease'],...]) — numbers or arrays of numbers */
  LIB.kf = (t, keys) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const k0 = keys[i - 1], k1 = keys[i];
      if (t <= k1[0]) {
        const f = E[k1[2] || "inOutCubic"] || E.inOutCubic;
        const p = f((t - k0[0]) / (k1[0] - k0[0] || 1));
        if (Array.isArray(k0[1])) return k0[1].map((v, j) => lerp(v, k1[1][j], p));
        return lerp(k0[1], k1[1], p);
      }
    }
    return keys[keys.length - 1][1];
  };

  /* ---------------- deterministic randomness ---------------- */
  LIB.hash = (n) => {
    let x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  };
  LIB.hash2 = (a, b) => LIB.hash(a * 57.31 + b * 113.97);
  LIB.rng = (seed) => {
    let s = (seed * 2654435761) >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  /** smooth 1D value noise in [-1,1] */
  LIB.noise = (x, seed = 0) => {
    const i = Math.floor(x), f = x - i;
    const a = LIB.hash(i + seed * 101.3) * 2 - 1, b = LIB.hash(i + 1 + seed * 101.3) * 2 - 1;
    const u = f * f * (3 - 2 * f);
    return a + (b - a) * u;
  };

  /* ---------------- musical time ---------------- */
  const BEATS = (LIB.BEATS = SONG.beats);
  LIB.DOWNBEATS = SONG.downbeats;
  LIB.BPM = SONG.bpm;
  const SPB = (LIB.SPB = 60 / SONG.bpm); // seconds per beat ≈ 0.4645
  /** index of the last beat at or before t (-1 before the first beat) */
  LIB.beatIndex = (t) => {
    let lo = 0, hi = BEATS.length - 1;
    if (t < BEATS[0]) return -1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (BEATS[mid] <= t) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };
  /** continuous beat position: integer at each detected beat, linear between */
  LIB.bp = (t) => {
    const i = LIB.beatIndex(t);
    if (i < 0) return (t - BEATS[0]) / SPB;
    if (i >= BEATS.length - 1) return BEATS.length - 1 + (t - BEATS[BEATS.length - 1]) / SPB;
    return i + (t - BEATS[i]) / (BEATS[i + 1] - BEATS[i]);
  };
  /** time of beat n (fractional ok) */
  LIB.beatTime = (n) => {
    if (n <= 0) return BEATS[0] + n * SPB;
    if (n >= BEATS.length - 1) return BEATS[BEATS.length - 1] + (n - (BEATS.length - 1)) * SPB;
    const i = Math.floor(n);
    return lerp(BEATS[i], BEATS[i + 1], n - i);
  };
  /** first beat index at or after t */
  LIB.nextBeat = (t) => Math.ceil(LIB.bp(t) - 1e-6);
  /** seconds since the last beat */
  LIB.sinceBeat = (t) => {
    const i = LIB.beatIndex(t);
    return i < 0 ? t - (BEATS[0] - SPB) : t - BEATS[i];
  };
  /** decaying hit envelope on every beat: 1 at the beat, → 0 */
  LIB.pulse = (t, k = 7) => Math.exp(-k * LIB.sinceBeat(t));
  /** hit envelope on downbeats only (bar start) */
  LIB.barPulse = (t, k = 5) => {
    const D = LIB.DOWNBEATS;
    let last = -99;
    for (let i = 0; i < D.length; i++) {
      if (D[i] <= t) last = D[i];
      else break;
    }
    return Math.exp(-k * (t - last));
  };
  /** 0..1 phase within the current beat */
  LIB.beatPhase = (t) => {
    const b = LIB.bp(t);
    return b - Math.floor(b);
  };
  /** swing sway: -1..1, period = 2 beats, lands on the beats (cos) */
  LIB.sway = (t, beats = 2) => Math.cos((LIB.bp(t) / beats) * Math.PI * 2);
  /** bounce: 0 at beat, 1 at mid-beat (hop arc), shaped like |sin| */
  LIB.hop = (t) => Math.sin(LIB.beatPhase(t) * Math.PI);
  /** swung-eighth bob: a dip on each beat with a lazy "and" (jazz feel), 0..1 */
  LIB.bob = (t) => {
    const ph = LIB.beatPhase(t);
    return ph < 0.66 ? Math.sin((ph / 0.66) * Math.PI * 0.5) : Math.cos(((ph - 0.66) / 0.34) * Math.PI * 0.5);
  };

  /** lyric line active at t (from SONG.lyrics) */
  LIB.lyricAt = (t) => {
    for (const l of SONG.lyrics) if (t >= l.t && t < l.end) return l;
    return null;
  };

  /* ---------------- canvas helpers ---------------- */
  LIB.rr = (ctx, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  LIB.ellipse = (ctx, x, y, rx, ry, rot = 0) => {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2);
  };
  LIB.circle = (ctx, x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2);
  };
  LIB.star = (ctx, x, y, r1, r2, n = 5, rot = -Math.PI / 2) => {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? r2 : r1, a = rot + (i * Math.PI) / n;
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
  };
  /** 4-point anime sparkle */
  LIB.sparkle = (ctx, x, y, r, color = "#fff", alpha = 1) => {
    if (alpha <= 0 || r <= 0) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
    ctx.restore();
  };
  LIB.heart = (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s * 0.1, y + s * 0.25, x - s * 0.55, y + s * 0.05, x - s * 0.5, y - s * 0.22);
    ctx.bezierCurveTo(x - s * 0.45, y - s * 0.5, x - s * 0.08, y - s * 0.5, x, y - s * 0.22);
    ctx.bezierCurveTo(x + s * 0.08, y - s * 0.5, x + s * 0.45, y - s * 0.5, x + s * 0.5, y - s * 0.22);
    ctx.bezierCurveTo(x + s * 0.55, y + s * 0.05, x + s * 0.1, y + s * 0.25, x, y + s * 0.35);
    ctx.closePath();
  };
  /** soft radial glow blob (additive-looking) */
  LIB.glow = (ctx, x, y, r, color, alpha = 0.5) => {
    if (alpha <= 0 || r <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, LIB.rgba(color, alpha));
    g.addColorStop(0.4, LIB.rgba(color, alpha * 0.45));
    g.addColorStop(1, LIB.rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  /** hex (#rgb/#rrggbb) → rgba string */
  LIB.rgba = (hex, a = 1) => {
    if (hex.startsWith("rgb")) return hex;
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  /** mix two hex colors → hex */
  LIB.mixColor = (h1, h2, p) => {
    const a = parseInt(h1.replace("#", ""), 16), b = parseInt(h2.replace("#", ""), 16);
    const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, p));
    const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, p));
    const bl = Math.round(lerp(a & 255, b & 255, p));
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
  };

  /* ---------------- text ---------------- */
  /* fonts: @font-face lives in index.html; canvas text needs them loaded before the first seek */
  LIB.fontsReady = Promise.all(
    [
      '600 40px "Fredoka"', '700 40px "Fredoka"', '400 40px "Yellowtail"', '400 40px "Noto Sans SC"', '700 40px "Noto Sans SC"',
      '400 40px "JetBrains Mono"', '700 40px "JetBrains Mono"', '400 40px "Archivo Black"', '400 40px "League Gothic"',
    ].map((f) => (document.fonts && document.fonts.load ? document.fonts.load(f).catch(() => null) : null))
  );
  LIB.FONT = {
    round: "Fredoka", // cute rounded latin (weights 300–700)
    script: "Yellowtail", // 50s jazz neon script
    zh: "Noto Sans SC", // chinese (weights 100–900)
    mono: "JetBrains Mono", // code / JSON
    block: "Archivo Black", // blue-note sleeve display
    tall: "League Gothic", // condensed display
  };
  /**
   * text(ctx, str, x, y, {size, font, weight, color, align, baseline, stroke, strokeW, glow, glowColor, alpha, tracking})
   */
  LIB.text = (ctx, str, x, y, o = {}) => {
    const size = o.size || 48;
    const fam = o.font || LIB.FONT.round;
    ctx.save();
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    ctx.font = `${o.weight || 600} ${size}px "${fam}", "${LIB.FONT.zh}", sans-serif`;
    ctx.textAlign = o.align || "center";
    ctx.textBaseline = o.baseline || "middle";
    if (o.tracking) ctx.letterSpacing = o.tracking + "px";
    if (o.glow) {
      ctx.shadowColor = o.glowColor || o.color || "#fff";
      ctx.shadowBlur = o.glow;
    }
    if (o.stroke) {
      ctx.lineJoin = "round";
      ctx.strokeStyle = o.stroke;
      ctx.lineWidth = o.strokeW || size * 0.16;
      ctx.strokeText(str, x, y);
      if (!o.glowFill) ctx.shadowBlur = 0;
    }
    ctx.fillStyle = o.color || "#fff";
    ctx.fillText(str, x, y);
    ctx.restore();
  };
  /** neon sign text: colored tube with bloom + bright core, flicker 0..1 */
  LIB.neonText = (ctx, str, x, y, o = {}) => {
    const c = o.color || LIB.P.pink;
    const on = o.on === undefined ? 1 : o.on;
    const size = o.size || 80;
    const fam = o.font || LIB.FONT.script;
    ctx.save();
    ctx.font = `${o.weight || 400} ${size}px "${fam}", "${LIB.FONT.zh}", sans-serif`;
    ctx.textAlign = o.align || "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    // unlit tube
    ctx.strokeStyle = LIB.rgba(c, 0.25);
    ctx.lineWidth = size * 0.07;
    ctx.strokeText(str, x, y);
    if (on > 0) {
      ctx.globalAlpha *= on;
      ctx.shadowColor = c;
      ctx.shadowBlur = size * 0.5;
      ctx.strokeStyle = c;
      ctx.lineWidth = size * 0.08;
      ctx.strokeText(str, x, y);
      ctx.shadowBlur = size * 0.2;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = size * 0.025;
      ctx.strokeText(str, x, y);
    }
    ctx.restore();
  };

  /* ---------------- camera ---------------- */
  /** cam(ctx, {x,y,zoom,rot,shake,t}) — zoom around (x,y) (default centre). Pair with camEnd. */
  LIB.cam = (ctx, o = {}) => {
    ctx.save();
    const cx = o.x === undefined ? LIB.W / 2 : o.x;
    const cy = o.y === undefined ? LIB.H / 2 : o.y;
    const z = o.zoom || 1;
    let sx = 0, sy = 0;
    if (o.shake) {
      const tt = (o.t || 0) * 30;
      sx = LIB.noise(tt, 3) * o.shake;
      sy = LIB.noise(tt, 7) * o.shake;
    }
    ctx.translate(LIB.W / 2 + sx, LIB.H / 2 + sy);
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale(z, z);
    ctx.translate(-cx, -cy);
  };
  LIB.camEnd = (ctx) => ctx.restore();

  /* ---------------- shared backgrounds / finishing ---------------- */
  /** deep night sky with twinkling stars (seeded) */
  LIB.nightSky = (ctx, t, o = {}) => {
    const g = ctx.createRadialGradient(LIB.W * 0.5, LIB.H * 1.1, 100, LIB.W * 0.5, LIB.H * 0.6, LIB.W * 0.9);
    g.addColorStop(0, o.horizon || LIB.P.night3);
    g.addColorStop(0.45, LIB.P.night1);
    g.addColorStop(1, LIB.P.night0);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, LIB.W, LIB.H);
    const n = o.stars === undefined ? 90 : o.stars;
    for (let i = 0; i < n; i++) {
      const x = LIB.hash(i * 3.1) * LIB.W;
      const y = LIB.hash(i * 7.7) * LIB.H * (o.starFloor || 0.7);
      const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + LIB.hash(i) * 3) + i);
      const r = 1 + LIB.hash(i * 1.9) * 2.2;
      ctx.fillStyle = LIB.rgba("#dfe8ff", 0.25 + tw * 0.6);
      LIB.circle(ctx, x, y, r);
      ctx.fill();
      if (r > 2.6) LIB.sparkle(ctx, x, y, r * 3 * tw, "#e8f0ff", 0.7);
    }
  };
  /** big soft vignette */
  LIB.vignette = (ctx, strength = 0.55, color = "#040716") => {
    const g = ctx.createRadialGradient(LIB.W / 2, LIB.H / 2, LIB.H * 0.35, LIB.W / 2, LIB.H / 2, LIB.H * 1.05);
    g.addColorStop(0, LIB.rgba(color, 0));
    g.addColorStop(1, LIB.rgba(color, strength));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, LIB.W, LIB.H);
  };
  /** floating bubbles rising (whale-spout motif). area {x,y,w,h} */
  LIB.bubbles = (ctx, t, o = {}) => {
    const n = o.n || 24, seed = o.seed || 1;
    const x0 = o.x || 0, w = o.w || LIB.W, y0 = o.y || 0, h = o.h || LIB.H;
    const speed = o.speed || 60;
    for (let i = 0; i < n; i++) {
      const r = (o.rMin || 4) + LIB.hash(i + seed * 17) * ((o.rMax || 18) - (o.rMin || 4));
      const period = h + r * 4;
      const yy = y0 + h - ((t * speed * (0.6 + LIB.hash(i * 5 + seed) * 0.8) + LIB.hash(i * 9 + seed) * period) % period);
      const xx = x0 + LIB.hash(i * 13 + seed) * w + Math.sin(t * 1.3 + i) * 12;
      ctx.save();
      ctx.globalAlpha *= o.alpha === undefined ? 0.55 : o.alpha;
      ctx.strokeStyle = o.color || "#bfe9ff";
      ctx.lineWidth = Math.max(1.5, r * 0.14);
      LIB.circle(ctx, xx, yy, r);
      ctx.stroke();
      ctx.fillStyle = LIB.rgba("#ffffff", 0.18);
      ctx.fill();
      ctx.fillStyle = "#fff";
      LIB.circle(ctx, xx - r * 0.35, yy - r * 0.35, r * 0.22);
      ctx.fill();
      ctx.restore();
    }
  };
  /** music notes drifting up (♪ ♫ drawn, not glyphs) */
  LIB.note = (ctx, x, y, s, color = "#fff", double = false, rot = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.12;
    LIB.ellipse(ctx, 0, 0, s * 0.3, s * 0.22, -0.4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.26, -s * 0.05);
    ctx.lineTo(s * 0.26, -s * 1.0);
    if (double) {
      LIB.ellipse(ctx, s * 0.75, -s * 0.15, s * 0.3, s * 0.22, -0.4);
      ctx.fill();
      ctx.moveTo(s * 1.01, -s * 0.2);
      ctx.lineTo(s * 1.01, -s * 1.15);
      ctx.moveTo(s * 0.26, -s * 1.0);
      ctx.lineTo(s * 1.01, -s * 1.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.26, -s * 0.85);
      ctx.lineTo(s * 1.01, -s * 1.0);
    } else {
      ctx.quadraticCurveTo(s * 0.7, -s * 0.75, s * 0.6, -s * 0.4);
    }
    ctx.stroke();
    ctx.restore();
  };
  LIB.notes = (ctx, t, o = {}) => {
    const n = o.n || 10, seed = o.seed || 3;
    for (let i = 0; i < n; i++) {
      const life = 3 + LIB.hash(i + seed) * 2;
      const ph = ((t + LIB.hash(i * 7 + seed) * life) % life) / life;
      const x = (o.x || 0) + LIB.hash(i * 11 + seed) * (o.w || LIB.W) + Math.sin(ph * 6 + i) * 30;
      const y = (o.y || 0) + (o.h || LIB.H) * (1 - ph);
      const a = Math.sin(ph * Math.PI);
      ctx.save();
      ctx.globalAlpha *= a * (o.alpha || 0.8);
      LIB.note(ctx, x, y, (o.size || 40) * (0.7 + LIB.hash(i * 3 + seed) * 0.6), o.color || LIB.P.cyan, i % 3 === 0, Math.sin(ph * 5 + i) * 0.3);
      ctx.restore();
    }
  };

  /** speed lines / radial burst behind a focal point */
  LIB.burst = (ctx, x, y, o = {}) => {
    const n = o.n || 24, r0 = o.r0 || 120, r1 = o.r1 || 1100;
    ctx.save();
    ctx.globalAlpha *= o.alpha === undefined ? 0.35 : o.alpha;
    ctx.fillStyle = o.color || "#fff";
    const rot = o.rot || 0;
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * Math.PI * 2, w = (o.width || 0.05) * (0.6 + LIB.hash(i) * 0.8);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a - w * 0.2) * r0, y + Math.sin(a - w * 0.2) * r0);
      ctx.lineTo(x + Math.cos(a - w) * r1, y + Math.sin(a - w) * r1);
      ctx.lineTo(x + Math.cos(a + w) * r1, y + Math.sin(a + w) * r1);
      ctx.lineTo(x + Math.cos(a + w * 0.2) * r0, y + Math.sin(a + w * 0.2) * r0);
      ctx.fill();
    }
    ctx.restore();
  };

  /**
   * Scene runner used by every chapter composition.
   * mountChapter({id, t0, dur, shots:[{a,b,draw(ctx,t,lt,d)}], post(ctx,t)})
   *   a/b are ABSOLUTE song seconds; draw receives absolute t, local-to-shot lt, shot duration d.
   */
  LIB.mountChapter = (o) => {
    const cv = document.getElementById(o.id + "-canvas");
    const ctx = cv.getContext("2d");
    const render = (t) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;
      ctx.clearRect(0, 0, LIB.W, LIB.H);
      let shot = o.shots[0];
      for (const s of o.shots) if (t >= s.a) shot = s;
      ctx.save();
      shot.draw(ctx, t, t - shot.a, shot.b - shot.a);
      ctx.restore();
      if (o.post) {
        ctx.save();
        o.post(ctx, t);
        ctx.restore();
      }
    };
    LIB._renderers = LIB._renderers || {};
    LIB._renderers[o.id] = render; // debug hook for tools/still.html
    // build + register only after fonts are ready (async build is supported; register LAST)
    LIB.fontsReady.then(() => {
      const st = { t: 0 };
      const tl = gsap.timeline({ paused: true });
      tl.to(st, { t: o.dur, duration: o.dur, ease: "none", onUpdate: () => render(o.t0 + st.t) }, 0);
      render(o.t0);
      window.__timelines[o.id] = tl;
      if (window.__hfForceTimelineRebind) window.__hfForceTimelineRebind();
    });
    return render;
  };
})();
