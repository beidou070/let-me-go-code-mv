/* CAST v2 (final) — 大肥鱼, the DeepSeek maid whale-girl (Q版 chibi), drawn entirely in code.
 *
 * Loaded after src/lib.js (window.LIB) and before src/props.js. Replaces the v1 rig (frozen in ../let-me-go-mv-v1).
 * Look: ref/CHARACTER_SPEC.md (gh-whale-maid + song cover). API: ref/RIG_API.md. Built from candidate A (body, eyes,
 * mouth, tail, ruffle) + B (bangs / side locks / face shape / world-locked eye highlights) + C (arm solver, legs, hair
 * silhouette, kicks, front locks), with the judges' grafts.
 * Fidelity round 1 (after the user's "her look breaks immersion, especially the face" note, checked 1:1 against gh /
 * cover): swept asymmetric fringe with two tall pointed forehead windows and a central clump hooking to the right eye,
 * big irises tucked under the lash, rounder coral D/U mouth (no fang), drooping triangular ear-fins with a fluffy pale
 * underside, hair gradient lightening from the shoulders, side locks curling in over the cheeks, a thick J tail whose
 * stem + fluke clear the hair (belly band on the outer edge), a shorter bell skirt showing striped stockings, a real
 * two-loop sash bow, spread-finger open hands, 8 uneven ruffle lobes, keyhole crown shine.
 * Fidelity round 2 (critics vs gh / cover at matched scale): heavy fringe (the forehead only shows through two narrow,
 * low windows + two small notches; pointed locks reach lash level over the outer irises), crown shine = a horizontal
 * lumpy bean + strips along the head curve (no keyhole), round wide chibi head (the hair billows out under the fins, side
 * locks curve outward), floppy convex ear-fins with 3 uneven fur tufts, long hair layered into 3 big S-lobes per side with
 * curl notches, filled lock gaps and darker inner locks (light only at the tips), wider front curls, a short thick J tail
 * tucked under the hair with a leaf-shaped fluke standing up-right beside it, a full bell skirt + thick two-tier
 * petticoat down to the Mary-Janes (single garter band, only shows on kicks), wider stance / chunkier shoes, solid navy
 * bodice straps + bigger shoulder ruffles, a 1.4x butterfly bow tie, one-loop apron sash, steel-blue irises, small brows,
 * a thinner ahoge, rounded ruffle ends.
 *
 * ── Units ─────────────────────────────────────────────────────────────────────────────────────────────────────
 * Rig units at s=1, feet at (pose.x, pose.y). x → screen-right (unflipped), h = height above the feet, canvas y = −h.
 * At s=1 she is 360 tall: ahoge tip h 360, ruffle top h 343, hair crown h 314, chin h 146.
 *
 * ── CAST.fish(ctx, pose) → { l, r, head, mouth }  (WORLD coords; l/r = centres of the screen-left/right hands) ──
 * pose (all optional):
 *   placement  x, y, s=1, flip=false, rot=0 (rad, about the feet), sq=1 (>1 = wider/shorter), dy (rig units × s),
 *              alpha (0 → nothing drawn, points still returned)
 *   face       face: open|happy|sing|wink|shock|smug|sleepy|determined|dizzy|cry · mouth 0..1 · blink 0..1 ·
 *              look [dx,dy] −1..1 · headTilt rad (pivot = chin (0,146)) · blush 0..1.5 (default 1) · sparkle · sweat 0..1
 *   arms       lArm/rArm deg for the SCREEN-left/right arm: 0 down, 90 sideways, 180 up, <0 across the body.
 *              lBend/rBend deg of elbow bend toward the body. Strong bends (≳100) with a low upper arm FOLD the hand:
 *                mic   → beside the cheek, mic aimed at the mouth (the cover pose; v1's lArm 32 / lBend 135)
 *                phone → at the cheek / ear, handset aimed at the ear-fin
 *                bare hands, glass, pen, bottle, wrench → fist at chest / shoulder height (h≈130, |x|≈45)
 *              Raised arms (lArm/rArm 150…180) splay outward with a chibi stretch: hands land beside the head at
 *              |x|≈78…90, h≈185…205, never on the face. Hands are always pushed out of the face zone.
 *              lHold/rHold: mic|phone|pen|glass|wrench|bottle|null · lFront/rFront force the arm over the head.
 *              An arm draws over the head when arm>100, *Front, the hand is above the shoulder, or it holds the mic.
 *   body       legL/legR outward kick deg (the kicked leg lengthens, that side of the skirt + petticoat lifts, the
 *              sock + Mary-Jane draw over the petticoat) · tail wag deg (+ = tip swings down-right, − = up-left;
 *              lagged; the fluke turns with the stem end, clamped −20°…+26°; the belly never sinks below h ≈ 10) ·
 *              ears fin flap deg ·
 *              hair −1..1 sway · ahoge −1..1 · skirtFlare 0..1.5 · apronLogo (default true)
 *   extra      rim 0..1.5 (default 0 = off): soft light halo on the dark-navy silhouette parts (tail, hem, shoes,
 *              fins) for very small figures on the night backgrounds.
 *
 * ── CAST.joints(pose) → WORLD points, no drawing (same transform + same solver as fish) ─────────────────────────
 *   { lShoulder, rShoulder, lElbow, rElbow, lHand, rHand, lHandAng, rHandAng, head, headTop, chin, mouth,
 *     lFin, rFin, tailBase, tailTip, feet }
 *   lHand/rHand are exactly fish().l/.r. *HandAng = elbow→hand direction in world radians (props held in the hand
 *   point along it). lFin/rFin = fin tips. tailTip = centre of the fluke. head/headTop/chin/mouth/fins follow headTilt.
 *   Rest values (s=1, unflipped, canvas y = −h): shoulders (∓31, −138), elbows (∓31, −105), hands (∓31, −75);
 *   upper arm 33 / forearm 30 (stretched up to 41.6 / 42 when raised; a folded forearm may foreshorten);
 *   head (0, −232), headTop (0, −314), chin (0, −146), mouth (0, −163), fins (∓160, −186), tailBase (45, −40),
 *   tailTip (180, −104) (fluke centre; the stem ends at (160, −90), fluke tip ≈ (198, −128)), feet (0, 0). Typical hands: mic hold 32/135 → (∓61, −146) · phone 38/128 → (∓61, −150) ·
 *   fists 34/112 → (∓40, −124) · arms up 150/10 → (∓88, −189), 178/0 → (∓79, −203) · point 125/−10 → (∓89, −174).
 *   Chapters should attach props with CAST.joints (never re-derive the arm maths: the solver folds / splays / stretches).
 *
 * ── CAST.groove(t, style, amt) → partial pose (v1 numbers, unchanged) ─────────────────────────────────────────
 * Helpers kept with v1 signatures: CAST.bow(ctx,x,y,s,col,lw[,shortTails]), CAST.whaleIcon(ctx,x,y,s,col,spout),
 * CAST.prop(ctx,kind,x,y,ang,side,lw,layer[,aim]), CAST.wrench(ctx,x,y,s,lw), CAST.taperPath(ctx,pts,w0,w1), CAST.bez.
 *
 * Pure: output depends only on the arguments (no clocks, no randomness, no state between calls; the only module
 * state is a cache of pose-independent Path2D geometry).
 */
(function () {
  const L = window.LIB, P = L.P;
  const CAST = (window.CAST = {});
  const D2R = Math.PI / 180;
  const clamp = L.clamp, lerp = L.lerp;
  const rgba = L.rgba;

  /* ================= private palette (CHARACTER_SPEC §4, hair desaturated toward gh, irises lighter) ================= */
  const PAL = {
    ink: "#1a1626",
    hairTop: "#525e86", hairMid: "#5b678f", hairLight: "#6f91bf", hairTip: "#88b0da",
    hairShade: "#3b4470", hairDeep: "#2c335b", hairShine: "#86a3d2", hairShineHi: "#bcd2f0",
    hairLine: "#303a6a", bangTip: "#8a93b9", bangEdge: "#262a4a",
    finTop: "#40436f", finSheen: "#5a638c", finShade: "#33355b", finUnder: "#b8bed9", finFluff: "#eef0f8",
    skin: "#fef5ea", skinShade: "#f6dcd2", blush: "#fdd2c7", blushCore: "#f9b3ad", blushHatch: "#ef9591",
    lash: "#291b23", lashBrown: "#6b3d38", eyeWhite: "#fdfbfb", eyeWhiteShade: "#d9dcee",
    irisTop: "#262d5c", iris1: "#35467f", iris2: "#5a7fb5", iris3: "#8fb3dc", irisGlow: "#c4dcf0",
    pupil: "#1f2350", highlight: "#ffffff",
    mouthLine: "#7a3a3e", mouthIn: "#c9605f", mouthIn2: "#e07e78", tongue: "#f7a8a2",
    navy: "#404169", navyShade: "#353353", navyLight: "#545c8c", sleeve: "#464975", bowTie: "#34375d",
    white: "#fdfcf9", whiteShade: "#d6d0df", whiteDeep: "#bebaca",
    gold: "#dcb28e", goldShade: "#b58a6c", goldLight: "#f3d2b0",
    brooch: "#73a7d9", broochDark: "#3b6395",
    bow: "#77adda", bowShade: "#5e86b7", bowDark: "#3b6395",
    sock: "#f7f5fa", sockShade: "#d9d3e3", sockBand: "#333357",
    shoe: "#424164", shoeShade: "#343454", shoeGloss: "#6b6e94",
    tail: "#474b76", tailShade: "#35385b", tailBelly: "#8088b1", tailBellyShade: "#6c73a0",
    emblem: "#3b3f6a", tear: "#bfe8ff",
  };
  const A_ = {
    pupil85: rgba(PAL.pupil, 0.85),
    brow: rgba(PAL.hairLine, 0.7),
    browHair: rgba(PAL.hairLine, 0.25),
    lid: rgba(PAL.lashBrown, 0.7),
    crease: rgba(PAL.blushHatch, 0.6),
    glow: rgba(PAL.irisGlow, 0.9),
    glow2: rgba(PAL.iris3, 0.9),
    chin: "rgba(60,52,92,0.22)",
    skinSh: rgba(PAL.skinShade, 0.9),
    bangShadow: rgba(PAL.skinShade, 0.8),
    deep: rgba(PAL.hairDeep, 0.5),
    waveHi: "rgba(205,230,250,0.45)",
    ruffShade: rgba(PAL.hairShade, 0.8),
    bangLow: "#48527c",
    gapShade: rgba(PAL.hairShade, 0.72),
    celShade: rgba(PAL.hairShade, 0.6),
    fineStrand: rgba(PAL.hairLine, 0.78),
    tipEdge: rgba(PAL.hairLine, 0.85),
    curtSep: rgba(PAL.hairShade, 0.7),
    lockLine: rgba(PAL.hairLine, 0.6),
    bowSh: "rgba(22,28,80,0.20)",
    bowCr: "rgba(22,28,80,0.45)",
    fingers: rgba(PAL.lashBrown, 0.45),
    shockLines: "rgba(111,134,200,0.75)",
    whiteSoft: rgba(PAL.whiteShade, 0.6),
    shineSoft: rgba(PAL.hairShine, 0.7),
    lockGap: rgba(PAL.hairDeep, 0.5),
    innerLock: rgba(PAL.hairDeep, 0.2),
  };

  /* ================= path helpers (public ones keep the v1 signatures) ================= */
  function taperPath(ctx, pts, w0, w1) {
    const n = pts.length, left = [], right = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const w = lerp(w0, w1, i / (n - 1)) / 2;
      left.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
      right.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
    return { left, right };
  }
  function bez(p0, p1, p2, p3, t) {
    const u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ];
  }
  CAST.taperPath = taperPath;
  CAST.bez = bez;

  const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const sstep = (a, b, x) => smooth((x - a) / (b - a));
  // soft linear ramp a→b: linear in the middle, rounded ends (peak slope ≈ 1.1/(b−a), unlike smoothstep's 1.5/(b−a))
  const sramp = (a, b, x) => {
    const t = clamp((x - a) / (b - a)), e = 0.18, k = 2 * e * (1 - e);
    if (t < e) return (t * t) / k;
    if (t > 1 - e) return 1 - ((1 - t) * (1 - t)) / k;
    return (t - e / 2) / (1 - e);
  };
  const rot2 = (x, y, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [x * c - y * s, x * s + y * c];
  };
  const rotAbout = (q, c, a) => {
    if (!a) return [q[0], q[1]];
    const r = rot2(q[0] - c[0], q[1] - c[1], a);
    return [r[0] + c[0], r[1] + c[1]];
  };
  function cub(a, b, c, d, n, out) {
    out = out || [];
    for (let i = out.length ? 1 : 0; i <= n; i++) out.push(bez(a, b, c, d, i / n));
    return out;
  }
  function quad(a, c, b, n) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
    return out;
  }
  // smooth polyline through midpoints (on a Path2D or ctx)
  function smoothTo(pa, Q, move) {
    const n = Q.length;
    if (move) pa.moveTo(Q[0][0], Q[0][1]);
    else pa.lineTo(Q[0][0], Q[0][1]);
    for (let i = 1; i < n - 1; i++) pa.quadraticCurveTo(Q[i][0], Q[i][1], (Q[i][0] + Q[i + 1][0]) / 2, (Q[i][1] + Q[i + 1][1]) / 2);
    pa.lineTo(Q[n - 1][0], Q[n - 1][1]);
  }
  // variable-width ribbon along pts; wf(u, i) = full width. Returns { path, A, B }
  function ribbon(pts, wf, into) {
    const n = pts.length, A = [], B = [];
    for (let i = 0; i < n; i++) {
      const a = pts[i > 0 ? i - 1 : 0], b = pts[i < n - 1 ? i + 1 : n - 1];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const w = wf(i / (n - 1), i) / 2;
      A.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
      B.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    const path = into || new Path2D();
    smoothTo(path, A, true);
    smoothTo(path, B.slice().reverse(), false);
    path.closePath();
    return { path, A, B };
  }
  // Catmull-Rom through canvas points (3rd element truthy = sharp corner); closed or open; cont = continue sub-path
  function spline(pa, pts, closed, cont) {
    const n = pts.length;
    if (cont) pa.lineTo(pts[0][0], pts[0][1]);
    else pa.moveTo(pts[0][0], pts[0][1]);
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)];
      const p1 = pts[i], p2 = pts[(i + 1) % n];
      const p3 = pts[closed ? (i + 2) % n : Math.min(n - 1, i + 2)];
      const t1 = p1[2] ? 0 : 1 / 6, t2 = p2[2] ? 0 : 1 / 6;
      pa.bezierCurveTo(
        p1[0] + (p2[0] - p0[0]) * t1, p1[1] + (p2[1] - p0[1]) * t1,
        p2[0] - (p3[0] - p1[0]) * t2, p2[1] - (p3[1] - p1[1]) * t2,
        p2[0], p2[1]
      );
    }
    if (closed) pa.closePath();
    return pa;
  }
  // mini path language in canvas coords: ['M',x,y,'L',x,y,'Q',cx,cy,x,y,'C',x1,y1,x2,y2,x,y,'Z'], mirror mx, point map f
  function trace(pa, d, mx, f) {
    mx = mx || 1;
    let i = 0;
    const Pt = (x, y) => (f ? f(x * mx, y) : [x * mx, y]);
    while (i < d.length) {
      const c = d[i++];
      if (c === "M" || c === "L") {
        const q = Pt(d[i], d[i + 1]);
        i += 2;
        if (c === "M") pa.moveTo(q[0], q[1]);
        else pa.lineTo(q[0], q[1]);
      } else if (c === "Q") {
        const a = Pt(d[i], d[i + 1]), b = Pt(d[i + 2], d[i + 3]);
        i += 4;
        pa.quadraticCurveTo(a[0], a[1], b[0], b[1]);
      } else if (c === "C") {
        const a = Pt(d[i], d[i + 1]), b = Pt(d[i + 2], d[i + 3]), e = Pt(d[i + 4], d[i + 5]);
        i += 6;
        pa.bezierCurveTo(a[0], a[1], b[0], b[1], e[0], e[1]);
      } else if (c === "Z") pa.closePath();
    }
    return pa;
  }
  const PCACHE = new Map();
  const path = (d, mx, f) => {
    if (f) return trace(new Path2D(), d, mx, f);
    mx = mx || 1;
    let e = PCACHE.get(d);
    if (!e) PCACHE.set(d, (e = {}));
    return e[mx] || (e[mx] = trace(new Path2D(), d, mx, null));
  };
  const both = (d) => {
    const pa = new Path2D();
    trace(pa, d, 1);
    trace(pa, d, -1);
    return pa;
  };
  // (x, h) helpers for shapes written in height units (ported from candidate B)
  const M = (c, x, h) => c.moveTo(x, -h);
  const Ln = (c, x, h) => c.lineTo(x, -h);
  const Q = (c, x1, h1, x, h) => c.quadraticCurveTo(x1, -h1, x, -h);
  const B = (c, x1, h1, x2, h2, x, h) => c.bezierCurveTo(x1, -h1, x2, -h2, x, -h);
  const Hp = (pts) => pts.map((v) => [v[0], -v[1], v[2]]);
  // tapered lock on a Path2D: cubic spine P0..P3 in (x,h), widths at P0, P1, P2 (0 at the tip)
  function lockPath(c, P0, P1, P2, P3, w0, w1, w2) {
    const nrm = (a, b) => {
      const dx = b[0] - a[0], dh = b[1] - a[1], l = Math.hypot(dx, dh) || 1;
      return [-dh / l, dx / l];
    };
    const n0 = nrm(P0, P1), n1 = nrm(P0, P2), n2 = nrm(P1, P3);
    const o = (p, n, w, sg) => [p[0] + n[0] * w * 0.5 * sg, p[1] + n[1] * w * 0.5 * sg];
    const a0 = o(P0, n0, w0, 1), a1 = o(P1, n1, w1, 1), a2 = o(P2, n2, w2, 1);
    const b0 = o(P0, n0, w0, -1), b1 = o(P1, n1, w1, -1), b2 = o(P2, n2, w2, -1);
    M(c, a0[0], a0[1]);
    B(c, a1[0], a1[1], a2[0], a2[1], P3[0], P3[1]);
    B(c, b2[0], b2[1], b1[0], b1[1], b0[0], b0[1]);
    c.closePath();
  }
  function inkFill(ctx, fill, lw, pa) {
    ctx.fillStyle = fill;
    ctx.lineWidth = lw;
    ctx.strokeStyle = PAL.ink;
    if (pa) {
      ctx.fill(pa);
      ctx.stroke(pa);
    } else {
      ctx.fill();
      ctx.stroke();
    }
  }
  // level of detail: lw = (1.6 + s) / s grows as she gets smaller; hairline details are skipped below s ≈ 0.85
  // and fabric texture ticks (pleats, lace ticks) only from s ≈ 1.9 up (close-ups), where they read
  const FINE = 2.85, TEX = 1.85;
  function fillP(ctx, pa, col) {
    ctx.fillStyle = col;
    ctx.fill(pa);
  }
  function strokeP(ctx, pa, col, w) {
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.stroke(pa);
  }
  // one vertical gradient for the long hair (back hair + shoulder locks): navy down to the shoulders (h 148), then a
  // long ramp so the hair is still mid blue at the hips and only the curled tips (h 30-50) are sky-blue (gh / cover).
  // Two stops on purpose (Skia's fast path; the midpoint #6d87b0 at h 92 is the gh mid blue).
  function hairGrad(ctx) {
    const g = ctx.createLinearGradient(0, -148, 0, -36);
    g.addColorStop(0, PAL.hairTop);
    g.addColorStop(1, PAL.hairTip);
    return g;
  }
  // scalloped edge along sample points (bump outward on the side given by sgn)
  function scallopTo(pa, pts, bump, sgn) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const l = Math.hypot(nx, ny) || 1;
      pa.quadraticCurveTo(mx + (nx / l) * bump * sgn, my + (ny / l) * bump * sgn, b[0], b[1]);
    }
  }

  /* ================= SKELETON (shared by fish() and joints()) ================= */
  const SH_X = 31, SH_Y = -138, UA = 33, FA = 30, NECK = [0, -146];

  // half-width of the "no hand centres here" zone at height h (face + hand radius + margin); smooth in h
  const KEEP = [[140, 0], [146, 26], [150, 44], [156, 58], [164, 68], [176, 74], [250, 74], [262, 60]];
  function keepX(h) {
    if (h <= 140 || h >= 262) return 0;
    for (let i = 1; i < KEEP.length; i++) {
      if (h <= KEEP[i][0]) {
        const u = smooth((h - KEEP[i - 1][0]) / (KEEP[i][0] - KEEP[i - 1][0]));
        return lerp(KEEP[i - 1][1], KEEP[i][1], u);
      }
    }
    return 0;
  }
  function ik(S, T, l1, l2, ref) {
    const dx = T[0] - S[0], dy = T[1] - S[1];
    let d = Math.hypot(dx, dy) || 1e-3;
    if (d > l1 + l2 - 0.5) {
      const k = (d + 0.5) / (l1 + l2);
      l1 *= k;
      l2 *= k;
    }
    d = Math.max(d, Math.abs(l1 - l2) + 0.01);
    const ux = dx / d, uy = dy / d;
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const mx = S[0] + ux * a, my = S[1] + uy * a;
    const e1 = [mx - uy * h, my + ux * h], e2 = [mx + uy * h, my - ux * h];
    const d1 = (e1[0] - ref[0]) ** 2 + (e1[1] - ref[1]) ** 2, d2 = (e2[0] - ref[0]) ** 2 + (e2[1] - ref[1]) ** 2;
    return d1 <= d2 ? e1 : e2;
  }
  // where a strongly bent, low arm folds the hand (and its elbow) to, per prop: [hand, elbow]. The forearm may
  // foreshorten (it comes toward the viewer), like the gh fists; the elbow stays low at her side.
  function foldTarget(side, a, hold, front) {
    const da = clamp(a - 32, -30, 30), dh = clamp(a - 32, -40, 40) * 0.1;
    if (hold === "mic") return [[side * (64 + da * 0.12), -(148 + dh)], [side * 56, -116]]; // beside the cheek (cover)
    if (hold === "phone") return [[side * (68 + da * 0.12), -(156 + dh)], [side * 58, -120]]; // at the ear
    if (front && !hold) return [[side * 44, -(146 + dh * 0.5)], [side * 43, -112]]; // "shh" / pointing at herself
    return [[side * (44 + da * 0.15), -(128 + dh)], [side * 49, -107]]; // fists / glass / pen at the chest
  }
  function armSolve(p, side) {
    const a = (side < 0 ? p.lArm : p.rArm) || 0;
    const b = (side < 0 ? p.lBend : p.rBend) || 0;
    const hold = (side < 0 ? p.lHold : p.rHold) || null;
    const front = !!(side < 0 ? p.lFront : p.rFront);
    const sh = [side * SH_X, SH_Y];
    const dir = (deg) => [side * Math.sin(deg * D2R), Math.cos(deg * D2R)];
    // raised arms: elbow splays out, chibi stretch (forearm a little more), forearm never folds in over the face
    const raise = sstep(90, 170, a);
    const l1 = UA * (1 + 0.26 * raise), l2 = FA * (1 + 0.4 * raise);
    const u = a > 90 ? 90 + (a - 90) * 0.42 : a;
    let f = a - b + (a > 90 ? (a - u) * 0.25 : 0);
    if (a > 100) f = Math.min(f, lerp(172, 160, sstep(100, 150, a)));
    const d1 = dir(u), d2 = dir(f);
    let el = [sh[0] + d1[0] * l1, sh[1] + d1[1] * l1];
    let hd = [el[0] + d2[0] * l2, el[1] + d2[1] * l2];
    // strong bend + low upper arm → fold (soft ramp keeps the hand speed ≈ ≤1.2 units per degree of bend)
    const far = hold === "mic" || hold === "phone";
    const w = (far ? sramp(64, 146, b) : sramp(68, 126, b)) * (1 - sstep(62, 118, a));
    let T = hd;
    if (w > 0) {
      const tg = foldTarget(side, a, hold, front);
      T = [lerp(hd[0], tg[0][0], w), lerp(hd[1], tg[0][1], w)];
      el = [lerp(el[0], tg[1][0], w), lerp(el[1], tg[1][1], w)];
      hd = T;
    }
    const kx = keepX(-T[1]);
    if (kx > 0 && Math.abs(T[0]) < kx) {
      const sg = Math.abs(T[0]) < 2 ? side : Math.sign(T[0]);
      T = [sg * kx, T[1]];
      if (w <= 0) el = ik(sh, T, l1, l2, el);
      hd = T;
    }
    const ux = el[0] - sh[0], uy = el[1] - sh[1], ul = Math.hypot(ux, uy) || 1;
    const vx = hd[0] - el[0], vy = hd[1] - el[1], vl = Math.hypot(vx, vy) || 1;
    const late = a > 100 || front || hd[1] < SH_Y || hold === "mic";
    return {
      side, a, b, hold, sh, el, hd, late,
      d1: [ux / ul, uy / ul], d2: [vx / vl, vy / vl], ang: Math.atan2(vy, vx),
    };
  }

  /* tail: centre line (x, canvas y) + widths. A short, thick J tucked under the hair (gh / cover): the floor run sits
     under the hair tips with its belly at h ≈ 16, turns up tightly at x ≈ 150-165 and ends at the stem top (160, −90),
     where a leaf-shaped fluke stands up-right beside the hair (tip ≈ (198, −128), fluke centre ≈ (180, −104)) */
  const TAIL_PTS = [[45, -44], [76, -33], [104, -30], [128, -33], [145, -43], [153, -58], [157, -74], [160, -90]];
  const TAIL_W = [30, 29, 28, 26, 23, 20, 18, 16];
  const TAIL_END = TAIL_PTS[TAIL_PTS.length - 1], FLUKE_C = [180, -104];
  const TAIL_BASE = [45, -40];
  function catmull(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  }
  const TAIL_S = (() => {
    const pts = [], ws = [], n = TAIL_PTS.length, SUB = 4;
    for (let i = 0; i < n - 1; i++) {
      const p0 = TAIL_PTS[Math.max(0, i - 1)], p1 = TAIL_PTS[i], p2 = TAIL_PTS[i + 1], p3 = TAIL_PTS[Math.min(n - 1, i + 2)];
      for (let k = 0; k < SUB; k++) {
        pts.push(catmull(p0, p1, p2, p3, k / SUB));
        ws.push(lerp(TAIL_W[i], TAIL_W[i + 1], k / SUB));
      }
    }
    pts.push(TAIL_PTS[n - 1].slice());
    ws.push(TAIL_W[n - 1]);
    return { pts, ws };
  })();
  function tailSolve(p) {
    const wag = clamp(p.tail || 0, -45, 45) * D2R;
    const src = TAIL_S.pts, ws = TAIL_S.ws, N = src.length;
    const pts = new Array(N);
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      // lagged wag: the bend grows toward the tip; the belly never sinks through the floor
      const q = rotAbout(src[i], TAIL_BASE, wag * (wag < 0 ? 0.3 : 0.45) * Math.pow(u, 1.35));
      q[1] = Math.min(q[1], -(ws[i] * 0.5 + 10));
      pts[i] = q;
    }
    // fluke rotation relative to its rest pose (it follows the stem's end tangent, clamped)
    const th = clamp(wag * (wag < 0 ? 0.3 : 0.45) * 1.3, -20 * D2R, 26 * D2R);
    return { pts, ws, tip: pts[N - 1], th };
  }
  // fluke frame: the fluke is drawn in rest world coordinates; FM = translate(tip) · rotate(th) · translate(−TAIL_END)
  function flukeFrame(T) {
    const c = Math.cos(T.th), sn = Math.sin(T.th), ox = TAIL_END[0], oy = TAIL_END[1];
    return { a: c, b: sn, c: -sn, d: c, e: T.tip[0] - (c * ox - sn * oy), f: T.tip[1] - (sn * ox + c * oy) };
  }
  function legSolve(p, side) {
    const kick = Math.max(-15, (side < 0 ? p.legL : p.legR) || 0);
    const ang = (6 + kick * 1.1) * D2R; // outward from straight down
    const len = Math.min(44 * (1 + 0.6 * Math.sin(Math.max(0, kick) * D2R)), 44 / Math.cos(Math.min(ang, 1.4)) - 0.5);
    return { side, kick, hip: [side * 18, -44], ang, len, over: sstep(8, 24, kick) };
  }
  const FIN_ROOT = [92, -205], FIN_TIP = [160, -186];
  function finXf(ears, m) {
    const a = (ears || 0) * D2R, c = Math.cos(a), s = Math.sin(a);
    return (x, y) => {
      const dx = x - FIN_ROOT[0], dy = y - FIN_ROOT[1];
      return [m * (FIN_ROOT[0] + dx * c - dy * s), FIN_ROOT[1] + dx * s + dy * c];
    };
  }
  function xform(p) {
    const s = p.s || 1, sq = p.sq || 1, fx = p.flip ? -1 : 1, r0 = p.rot || 0;
    const ox = p.x || 0, oy = (p.y || 0) + (p.dy || 0) * s;
    const c = Math.cos(r0), sn = Math.sin(r0), sx = s * sq * fx, sy = s / sq;
    const tilt = p.headTilt || 0;
    const pt = (x, y) => {
      const lx = x * sx, ly = y * sy;
      return { x: ox + lx * c - ly * sn, y: oy + lx * sn + ly * c };
    };
    const hp = (x, y) => {
      const q = rotAbout([x, y], NECK, tilt);
      return pt(q[0], q[1]);
    };
    const ang = (a) => {
      const vx = Math.cos(a) * sx, vy = Math.sin(a) * sy;
      return Math.atan2(vx * sn + vy * c, vx * c - vy * sn);
    };
    return { pt, hp, ang };
  }

  /* ================= TAIL ================= */
  // leaf-shaped fluke (gh / cover), rest world coords: from a small notch on the stem's left edge the convex leading
  // edge rises to a pointed tip up-right; the full, rounded trailing edge bulges back down to the stem's right edge
  // (wound like the tail ribbon: opposite windings would cancel under the nonzero fill and punch a hole at the joint)
  const FLUKE = ["M", 157, -82, "L", 167, -75, "C", 181, -77, 192, -84, 198, -93, "C", 206, -104, 206, -120, 198, -128.5,
    "C", 194, -126, 189, -124, 182, -121.5, "C", 170, -117, 160, -110, 156, -100, "Q", 154, -92, 151, -84, "Z"];
  const FLUKE_SH = ["M", 198, -128.5, "C", 206, -120, 206, -104, 198, -93, "C", 192, -84, 181, -77, 167, -75,
    "C", 178, -85, 188, -95, 193, -106, "C", 196, -114, 197.5, -121, 198, -128.5, "Z"];
  const FLUKE_HI = ["M", 160, -104, "C", 166, -112, 176, -117, 188, -121];
  function tailGeom(p) {
    const T = tailSolve(p);
    const R = ribbon(T.pts, (u, i) => T.ws[i]);
    const FM = flukeFrame(T);
    const body = new Path2D();
    body.addPath(R.path);
    body.addPath(path(FLUKE), FM);
    return { T, R, FM, body };
  }
  function tail(ctx, p, lw, G) {
    const { T, R, FM, body } = G;
    const pts = T.pts, N = pts.length;
    strokeP(ctx, body, PAL.ink, lw * 2);
    fillP(ctx, body, PAL.tail);
    // top-edge shade of the tube + inner half of the fluke
    const i2 = N - 3;
    const sh = new Path2D(), topIn = [];
    for (let i = 1; i <= i2; i++) topIn.push([lerp(R.B[i][0], pts[i][0], 0.42), lerp(R.B[i][1], pts[i][1], 0.42)]);
    smoothTo(sh, R.B.slice(1, i2 + 1), true);
    smoothTo(sh, topIn.reverse(), false);
    sh.closePath();
    sh.addPath(path(FLUKE_SH), FM);
    fillP(ctx, sh, PAL.tailShade);
    if (lw < TEX) {
      const hi = new Path2D();
      hi.addPath(path(FLUKE_HI), FM);
      strokeP(ctx, hi, PAL.navyLight, lw * 0.55);
    }
    // light belly band on the OUTER (convex, bottom / right) edge of the J; it tapers to a point on the edge as the
    // stem turns up (no squared-off cap)
    const i0 = 1, i1 = N - 8;
    const bel = new Path2D(), belIn = [];
    for (let i = i0; i <= i1; i++) {
      const u = (i - i0) / (i1 - i0), k = 0.66 * Math.pow(1 - u, 0.75);
      belIn.push([lerp(R.A[i][0], pts[i][0], k), lerp(R.A[i][1], pts[i][1], k)]);
    }
    smoothTo(bel, R.A.slice(i0, i1 + 1), true);
    smoothTo(bel, belIn.slice().reverse(), false);
    bel.closePath();
    fillP(ctx, bel, PAL.tailBelly);
    const bl = new Path2D();
    smoothTo(bl, belIn.slice(0, -2), true);
    strokeP(ctx, bl, PAL.tailBellyShade, lw * 0.45);
  }

  /* ================= BACK HAIR (gradient silhouette, darker inner locks, filled lock gaps, crest highlights) ========== */
  // right outline (x, h): crown → billowing out right under the fins (round, wide chibi head, gh) → three big wavy
  // lobes separated by deep curl notches → bottom centre; 3rd value = sharp corner (notches / tips)
  const BACK_R = [
    [0, 268, 1], [70, 268], [98, 262], [107, 240], [112, 218], [115, 200], [118, 186], [121, 172], [126, 160],
    [135, 149], [139, 138], [133, 131], [144, 121, 1], [126, 124, 1],
    [138, 115], [148, 104], [149, 92], [142, 85], [155, 76, 1], [135, 78, 1],
    [147, 68], [152, 56], [146, 46], [154, 34, 1], [134, 39, 1],
    [123, 43], [113, 35], [104, 27, 1], [88, 26], [70, 30], [46, 37], [20, 45],
  ];
  const BACK_ALL = BACK_R.concat(BACK_R.slice(1).map((v) => [-v[0], v[1], v[2]]).reverse());
  // lock gaps: tapered dark ribbons that run down the mass and end exactly in the curl notches
  const BACK_GAPS = [
    [[104, 182], [117, 166], [111, 150], [121, 136], [126, 124]],
    [[96, 158], [113, 140], [106, 122], [121, 104], [118, 92], [135, 78]],
    [[94, 128], [111, 110], [104, 92], [120, 74], [117, 58], [134, 39]],
  ];
  // darker inner locks (closer to the body, in shadow) overlapping the lighter outer mass, each ending in a pointed
  // curl tip that flicks outward
  const BACK_INNER = [
    [[70, 166], [92, 160], [104, 144], [106, 124], [102, 108], [109, 90], [114, 74], [108, 62, 1], [103, 74], [95, 90],
      [86, 110], [72, 128], [60, 150]],
    [[92, 150], [108, 144], [118, 128], [117, 114], [124, 104], [126, 96, 1], [118, 100], [108, 110], [98, 126], [88, 140]],
  ];
  // one thin highlight on each lobe crest
  const BACK_WAVES = [
    [[129, 154], [137, 144], [136, 133]],
    [[139, 118], [148, 106], [147, 92]],
    [[143, 71], [150, 60], [146, 49]],
  ];
  function hairMap(p) {
    const sw = p.hair || 0, a0 = (p.headTilt || 0) * 0.85;
    if (!sw && !a0) return null;
    return (x, y) => {
      const h = -y;
      if (a0) {
        const a = a0 * smooth((h - 110) / 90);
        if (a) {
          const q = rotAbout([x, y], NECK, a);
          x = q[0];
          y = q[1];
        }
      }
      const g = Math.pow(clamp((200 - h) / 165), 1.3);
      return [x + sw * 24 * g, y - Math.abs(sw) * 3 * g];
    };
  }
  const BACK_STATIC = {};
  function backHairGeom(f) {
    if (!f && BACK_STATIC.hair) return BACK_STATIC;
    const map = (v) => (f ? f(v[0], -v[1]) : [v[0], -v[1]]);
    const hair = spline(new Path2D(), BACK_ALL.map((v) => { const q = map(v); q[2] = v[2]; return q; }), true);
    const gaps = new Path2D(), inner = new Path2D(), waves = new Path2D();
    const sm = (pts) => {
      const out = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], d = pts[Math.min(pts.length - 1, i + 2)];
        for (let k = 0; k < 3; k++) out.push(catmull(a, b, c, d, k / 3));
      }
      out.push(pts[pts.length - 1]);
      return out;
    };
    for (const m of [-1, 1]) {
      for (const s of BACK_GAPS) {
        const q = s.map(([x, h]) => map([m * x, h]));
        ribbon(sm(q), (u) => 7.5 * Math.pow(Math.sin(Math.PI * Math.min(u * 1.15, 1)), 0.8) + 0.4, gaps);
      }
      for (const s of BACK_INNER) spline(inner, s.map(([x, h, c]) => { const q = map([m * x, h]); q[2] = c; return q; }), true);
      for (const s of BACK_WAVES) {
        const q = s.map(([x, h]) => map([m * (x - 3), h]));
        const r = cub(q[0], [lerp(q[0][0], q[1][0], 0.7), lerp(q[0][1], q[1][1], 0.7)], [lerp(q[2][0], q[1][0], 0.7), lerp(q[2][1], q[1][1], 0.7)], q[2], 6);
        ribbon(r, (u) => 6 * Math.sin(Math.PI * u) + 0.3, waves);
      }
    }
    const G = { hair, gaps, inner, waves };
    if (!f) Object.assign(BACK_STATIC, G);
    return G;
  }
  function backHair(ctx, p, lw, hg) {
    const G = backHairGeom(hairMap(p));
    ctx.fillStyle = hg;
    ctx.fill(G.hair);
    // deep inner layer around the neck / behind the torso (shows between the waves and the body)
    ctx.fillStyle = A_.deep;
    L.ellipse(ctx, 0, -144, 72, 50);
    ctx.fill();
    // layered locks: darker inner locks over the lighter outer mass, filled tapered gaps into the curl notches
    fillP(ctx, G.inner, A_.innerLock);
    fillP(ctx, G.gaps, A_.lockGap);
    if (lw < FINE) fillP(ctx, G.waves, A_.waveHi);
    strokeP(ctx, G.hair, PAL.ink, lw);
  }

  /* ================= LEGS (white socks, navy band, chunky Mary-Janes) ================= */
  function legFrame(ctx, Lg) {
    ctx.translate(Lg.hip[0], Lg.hip[1]);
    ctx.rotate(-Lg.side * Lg.ang);
  }
  // shoe in the leg frame: sole centre at (side*2.5, len), counter-rotated so it stays flat-ish
  function shoeFrame(ctx, Lg) {
    ctx.translate(Lg.side * 2.5, Lg.len);
    ctx.rotate(Lg.side * Lg.ang * 0.55);
    ctx.scale(1.35, 1.15);
  }
  const SHOE = ["M", -12, -8, "C", -13.5, -1.5, -8, 0.6, 0, 0.6, "C", 8, 0.6, 13.5, -1.5, 12, -8, "C", 11, -14.5, 6, -16.5, 0, -16.5, "C", -6, -16.5, -11, -14.5, -12, -8, "Z"];
  const SHOE_SH = ["M", 12, -8, "C", 13.5, -1.5, 8, 0.6, 0, 0.6, "C", 6, -2.5, 10, -5, 12, -8, "Z"];
  const STRAP = ["M", -8.5, -13.5, "Q", 0, -11, 8.5, -13.5];
  function drawLeg(ctx, Lg, lw, part) {
    const len = Lg.len;
    ctx.save();
    legFrame(ctx, Lg);
    if (part !== "low") {
      L.rr(ctx, -7, -6, 14, len - 4, 6.5);
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = lw * 1.6;
      ctx.stroke();
      ctx.fillStyle = PAL.skin;
      ctx.fill();
    }
    // white stocking with a single navy garter band at its top (cover): standing, the long petticoat hides it all but a
    // sliver of white sock above the Mary-Janes; the band only shows on kicks
    ctx.beginPath();
    ctx.moveTo(-7, len - 36);
    ctx.lineTo(7, len - 36);
    ctx.lineTo(7, len - 10);
    ctx.quadraticCurveTo(7, len - 3.5, 0, len - 3.5);
    ctx.quadraticCurveTo(-7, len - 3.5, -7, len - 10);
    ctx.closePath();
    if (part === "low") {
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = lw * 1.6;
      ctx.stroke();
    }
    ctx.fillStyle = PAL.sock;
    ctx.fill();
    ctx.fillStyle = PAL.sockShade;
    ctx.fillRect(Lg.side * 3 - 1.5, len - 21, 3.2, 12);
    ctx.fillStyle = PAL.sockBand;
    ctx.fillRect(-7, len - 36, 14, 3.6);
    // Mary-Jane
    ctx.save();
    shoeFrame(ctx, Lg);
    const sp = path(SHOE);
    strokeP(ctx, sp, PAL.ink, lw * 1.6);
    fillP(ctx, sp, PAL.shoe);
    fillP(ctx, path(SHOE_SH), PAL.shoeShade);
    strokeP(ctx, path(STRAP), PAL.shoeShade, 2.8);
    ctx.fillStyle = PAL.gold;
    L.rr(ctx, Lg.side * 6.5 - 1.9, -15.2, 3.8, 3.4, 0.8);
    ctx.fill();
    ctx.fillStyle = PAL.shoeGloss;
    L.ellipse(ctx, -4.5, -9, 3.8, 1.9, -0.3);
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  /* ================= PETTICOAT / SKIRT / APRON ================= */
  // skirt map: flare + per-side kick lift, 0 at the waist flare, full at the hem (applied to every skirt shape)
  function skirtMap(p, Lg) {
    const fl = clamp(p.skirtFlare || 0, 0, 1.5);
    const kl = Math.max(0, Lg[0].kick), kr = Math.max(0, Lg[1].kick);
    if (!fl && !kl && !kr) return null;
    return (x, y) => {
      const kk = clamp((92 + y) / 62);
      if (!kk) return [x, y];
      const wR = sstep(-34, 34, x);
      const lift = fl * 4 + lerp(kl, kr, wR) * 0.36;
      const spread = fl * 10 + lerp(kl, kr, wR) * 0.1;
      return [x + Math.sign(x) * spread * kk, y - lift * kk];
    };
  }
  // full bell skirt flaring to its widest at the hem (±92); the hem is a "smile" (sides h 40, centre h 31), and the
  // thick two-tier petticoat reaches h 18, so the chunky Mary-Janes sit right under it (gh)
  const SKIRT = ["M", -27, -98, "C", -44, -99, -61, -93, -70, -81, "C", -79, -69, -89, -53, -92, -40, "Q", 0, -22, 92, -40, "C", 89, -53, 79, -69, 70, -81, "C", 61, -93, 44, -99, 27, -98, "Z"];
  const SKIRT_SH = ["M", 44, -97, "C", 57, -96, 65, -90, 70, -81, "C", 79, -69, 89, -53, 92, -40, "Q", 71, -36, 49, -33.6, "C", 57, -51, 56, -78, 44, -97, "Z"];
  const SKIRT_FOLDS = ["M", -52, -92, "Q", -60, -64, -66, -35.6, "M", 56, -90, "Q", 64, -62, 70, -36.2, "M", -24, -96, "Q", -28, -80, -30, -70];
  const HEM_GOLD = ["M", -84, -45, "Q", 0, -31, 84, -45];
  // thin gold vine along the hem band (gh embroidery) + a few leaf sprigs
  const HEM_VINE = [
    "M", -72.8, -43.7, "Q", -65.5, -50.4, -58.2, -45, "Q", -52, -40.5, -45.8, -45,
    "M", -31.2, -40.8, "Q", -25, -47, -18.7, -41.2,
    "M", -25, -44, "Q", -27, -50, -22.9, -52.1,
    "M", 18.7, -41.2, "Q", 25, -47, 31.2, -40.8,
    "M", 25, -44, "Q", 27, -50, 22.9, -52.1,
    "M", 45.8, -45, "Q", 52, -40.5, 58.2, -45, "Q", 65.5, -50.4, 72.8, -43.7,
    "M", -68.6, -47.1, "Q", -70.7, -52.9, -66.6, -56.3,
    "M", 68.6, -47.1, "Q", 70.7, -52.9, 66.6, -56.3,
    "M", -65.5, -72.5, "Q", -61.8, -78.5, -58, -74.5,
    "M", -61.8, -75.5, "Q", -61.8, -80.5, -59, -82.5,
    "M", 65.5, -72.5, "Q", 61.8, -78.5, 58, -74.5,
    "M", 61.8, -75.5, "Q", 61.8, -80.5, 59, -82.5,
  ];
  function petticoatGeom(f) {
    const Pt = (x, y) => (f ? f(x, y) : [x, y]);
    const pt = new Path2D();
    let q = Pt(-88, -42);
    pt.moveTo(q[0], q[1]);
    q = Pt(88, -42);
    pt.lineTo(q[0], q[1]);
    const edge = quad(Pt(84, -24), Pt(0, -12), Pt(-84, -24), 12);
    pt.lineTo(edge[0][0], edge[0][1]);
    scallopTo(pt, edge, 5, 1);
    pt.closePath();
    const row2 = quad(Pt(83, -34), Pt(0, -16), Pt(-83, -34), 11);
    const r2 = new Path2D();
    r2.moveTo(row2[0][0], row2[0][1]);
    scallopTo(r2, row2, 3.4, 1);
    const tk = new Path2D();
    for (let i = 1; i < edge.length - 1; i++) {
      tk.moveTo(edge[i][0], edge[i][1] - 0.5);
      tk.lineTo(edge[i][0], edge[i][1] - 4.5);
    }
    for (let i = 1; i < row2.length - 1; i++) {
      tk.moveTo(row2[i][0], row2[i][1] - 0.5);
      tk.lineTo(row2[i][0], row2[i][1] - 4);
    }
    const shade = new Path2D();
    const a = Pt(-80, -38), c = Pt(0, -22), b = Pt(80, -38);
    shade.moveTo(a[0], a[1]);
    shade.quadraticCurveTo(c[0], c[1], b[0], b[1]);
    return { pt, edge, r2, row2, shade, tk };
  }
  let PETTI_STATIC = null;
  function petticoat(ctx, p, lw, f) {
    const G = f ? petticoatGeom(f) : PETTI_STATIC || (PETTI_STATIC = petticoatGeom(null));
    fillP(ctx, G.pt, PAL.white);
    ctx.save();
    ctx.lineCap = "butt";
    strokeP(ctx, G.shade, PAL.whiteDeep, 8);
    ctx.restore();
    // second (upper) ruffle row + pleat ticks (one stroke)
    if (lw < FINE) strokeP(ctx, G.r2, PAL.whiteShade, lw * 0.45);
    if (lw < TEX) strokeP(ctx, G.tk, PAL.whiteShade, lw * 0.4);
    strokeP(ctx, G.pt, PAL.ink, lw * 0.8);
  }
  function goldBow(pa, x, y) {
    pa.moveTo(x, y);
    pa.lineTo(x - 3.5, y + 8);
    pa.lineTo(x - 1.5, y + 8.5);
    pa.lineTo(x, y + 1);
    pa.lineTo(x + 1.5, y + 8.5);
    pa.lineTo(x + 3.5, y + 8);
    pa.closePath();
    for (const s of [-1, 1]) {
      pa.moveTo(x, y);
      pa.bezierCurveTo(x + s * 2, y - 5, x + s * 7, y - 5, x + s * 6.5, y - 1);
      pa.bezierCurveTo(x + s * 6.5, y + 3, x + s * 2, y + 3, x, y);
      pa.closePath();
    }
    pa.moveTo(x + 1.6, y);
    pa.arc(x, y, 1.6, 0, Math.PI * 2);
    pa.closePath();
  }
  function skirtGeom(f) {
    const Pt = (x, y) => (f ? f(x, y) : [x, y]);
    const tabs = new Path2D(), gb = new Path2D();
    for (const m of [-1, 1]) {
      const a = Pt(m * 51, -70), b = Pt(m * 59, -70), c = Pt(m * 60, -34.8), d = Pt(m * 50, -33.7);
      tabs.moveTo(a[0], a[1]);
      tabs.lineTo(b[0], b[1]);
      tabs.lineTo(c[0], c[1]);
      tabs.lineTo(d[0], d[1]);
      tabs.closePath();
      const q = Pt(m * 55, -55);
      goldBow(gb, q[0], q[1]);
    }
    const sh = new Path2D();
    sh.addPath(path(SKIRT_SH, 1, f));
    sh.addPath(tabs);
    const gold = new Path2D();
    gold.addPath(path(HEM_GOLD, 1, f));
    gold.addPath(path(HEM_VINE, 1, f));
    return { sk: path(SKIRT, 1, f), sh, folds: path(SKIRT_FOLDS, 1, f), gold, gb };
  }
  let SKIRT_STATIC = null;
  function skirt(ctx, p, lw, f) {
    const G = f ? skirtGeom(f) : SKIRT_STATIC || (SKIRT_STATIC = skirtGeom(null));
    fillP(ctx, G.sk, PAL.navy);
    fillP(ctx, G.sh, PAL.navyShade);
    if (lw < FINE) strokeP(ctx, G.folds, PAL.navyShade, lw * 0.5);
    strokeP(ctx, G.gold, PAL.gold, lw * 0.38);
    fillP(ctx, G.gb, PAL.gold);
    strokeP(ctx, G.sk, PAL.ink, lw);
  }
  // apron: sampled panel edge; ruffle band 5 wide outside it
  const APRON_EDGE = (() => {
    const pts = cub([-30, -100], [-36, -88], [-44, -76], [-44, -63], 5);
    cub([-44, -63], [-44, -53], [-24, -49], [0, -49], 4, pts);
    cub([0, -49], [24, -49], [44, -53], [44, -63], 4, pts);
    cub([44, -63], [44, -76], [36, -88], [30, -100], 5, pts);
    return pts;
  })();
  const APRON = (() => {
    const n = APRON_EDGE.length, OUT = [];
    for (let i = 0; i < n; i++) {
      const a = APRON_EDGE[Math.max(0, i - 1)], b = APRON_EDGE[Math.min(n - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const l = Math.hypot(nx, ny) || 1;
      nx /= l; ny /= l;
      const q = APRON_EDGE[i];
      if (nx * q[0] + ny * (q[1] + 75) < 0) { nx = -nx; ny = -ny; }
      OUT.push([q[0] + nx * 6.5, q[1] + ny * 6.5]);
    }
    const out = new Path2D();
    out.moveTo(APRON_EDGE[0][0], APRON_EDGE[0][1]);
    out.lineTo(OUT[1][0], OUT[1][1]);
    scallopTo(out, OUT.slice(1, -1), 3, 1);
    out.lineTo(APRON_EDGE[n - 1][0], APRON_EDGE[n - 1][1]);
    out.closePath();
    const ticks = new Path2D();
    for (let i = 2; i < n - 2; i++) {
      ticks.moveTo(APRON_EDGE[i][0], APRON_EDGE[i][1]);
      ticks.lineTo(lerp(APRON_EDGE[i][0], OUT[i][0], 0.8), lerp(APRON_EDGE[i][1], OUT[i][1], 0.8));
    }
    const seam = new Path2D();
    smoothTo(seam, APRON_EDGE, true);
    trace(seam, ["M", -14, -96, "Q", -18, -77, -24, -59, "M", 16, -96, "Q", 20, -79, 26, -61]);
    const side = spline(new Path2D(), Hp([[25, 97], [31, 84], [35, 71], [34, 61], [28, 55], [27, 66], [26, 80], [21, 95]]), true);
    return { out, ticks, seam, side };
  })();
  function apron(ctx, p, lw) {
    fillP(ctx, APRON.out, PAL.white);
    fillP(ctx, APRON.side, A_.whiteSoft);
    if (lw < FINE) strokeP(ctx, APRON.seam, PAL.whiteShade, lw * 0.42);
    if (lw < TEX) strokeP(ctx, APRON.ticks, PAL.whiteShade, lw * 0.4);
    strokeP(ctx, APRON.out, PAL.ink, lw * 0.8);
    if (p.apronLogo !== false) CAST.whaleIcon(ctx, 1, -72, 0.36, PAL.emblem, true);
  }

  /* ================= TORSO (white blouse chest, navy straps, pinafore frills, wide belt) ================= */
  const TORSO = (() => {
    // apron sash (cover): ONE big white loop sticking out right of the waist + a tail hanging mostly behind the skirt
    const sash = trace(new Path2D(), [
      "M", 38, -104, "C", 42, -96, 46, -88, 49, -79, "L", 44, -81.5, "L", 40.5, -78, "C", 39.5, -88, 37.5, -96, 35, -103, "Z",
      "M", 36, -107, "C", 40, -121, 58, -125, 63, -114, "C", 66, -104, 52, -99, 36, -103, "Z",
    ]);
    // the loop's shaded inside (reads as a ribbon loop, not a white blob)
    const sashIn = trace(new Path2D(), ["M", 43, -108, "C", 47, -116, 56, -118, 58, -113, "C", 59.5, -108.5, 52, -106, 43, -106.5, "Z"]);
    const sashKnot = trace(new Path2D(), [
      "M", 32.5, -105, "Q", 32.5, -109.5, 36.5, -109.5, "Q", 40.5, -109.5, 40.5, -105, "Q", 40.5, -100.5, 36.5, -100.5, "Q", 32.5, -100.5, 32.5, -105, "Z",
    ]);
    const sashFold = trace(new Path2D(), ["M", 43, -103.5, "Q", 51, -102, 58, -104.5]);
    const bodice = trace(new Path2D(), ["M", -39, -140, "C", -42, -124, -34, -108, -30, -97, "L", 30, -97, "C", 34, -108, 42, -124, 39, -140, "Q", 0, -154, -39, -140, "Z"]);
    const bodSh = trace(new Path2D(), ["M", 30, -146, "Q", 35, -124, 28, -99, "L", 30, -97, "C", 34, -108, 42, -124, 39, -140, "Q", 35, -144.5, 30, -146, "Z"]);
    const blouse = trace(new Path2D(), ["M", -17, -149, "L", 17, -149, "L", 15, -109, "L", -15, -109, "Z"]);
    const pleats = trace(new Path2D(), ["M", -7, -143, "L", -6.5, -111, "M", 7, -143, "L", 6.5, -111]);
    const blouseSh = trace(new Path2D(), ["M", 11, -149, "L", 17, -149, "L", 15, -109, "L", 10, -109, "Z"]);
    const buttons = new Path2D();
    for (const y of [-131, -125, -119]) {
      buttons.moveTo(1.7, y);
      buttons.arc(0, y, 1.7, 0, Math.PI * 2);
    }
    // pinafore: solid navy bodice straps (about 11 wide) between the white shirt (±17) and narrow ruffled white frills
    // that widen from the belt (x 27 to 31) to the shoulders (x 28 to 39), 6 scallops (gh)
    const frills = new Path2D(), frillTicks = new Path2D();
    for (const m of [-1, 1]) {
      frills.moveTo(m * 28, -149);
      frills.lineTo(m * 27, -102);
      const outer = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        outer.push([m * (lerp(30.5, 39, Math.pow(t, 0.85)) + Math.sin(Math.PI * t) * 1.2), lerp(-102, -149, t)]);
      }
      frills.lineTo(outer[0][0], outer[0][1]);
      scallopTo(frills, outer, 3.4, m);
      frills.closePath();
      for (let i = 1; i < 6; i++) {
        frillTicks.moveTo(m * lerp(27, 28, i / 6) + m * 1.5, lerp(-102, -149, i / 6));
        frillTicks.lineTo(outer[i][0] - m * 1.5, outer[i][1] + 0.5);
      }
    }
    // shoulder frill caps: drawn over the sleeve puffs (after the hanging arms) so the ruffles read like gh
    const caps = new Path2D(), capTicks = new Path2D();
    for (const m of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 5; i++) {
        const t = i / 5;
        pts.push([m * (22 + t * 24), -149 + Math.sin(Math.PI * t) * -6.5 + t * 10]);
      }
      caps.moveTo(m * 19, -150);
      caps.lineTo(pts[0][0], pts[0][1]);
      scallopTo(caps, pts, 3.2, -m);
      caps.quadraticCurveTo(m * 40, -132, m * 29, -136);
      caps.quadraticCurveTo(m * 23, -140, m * 19, -150);
      caps.closePath();
      for (let i = 1; i < 5; i++) {
        capTicks.moveTo(pts[i][0], pts[i][1] + 1.2);
        capTicks.lineTo(pts[i][0] - m * 1.2, pts[i][1] + 5.2);
      }
    }
    const belt = trace(new Path2D(), ["M", -29, -112, "L", 29, -112, "L", 28, -96, "L", -28, -96, "Z"]);
    const beltLine = trace(new Path2D(), ["M", -27, -109.5, "L", 27, -109.5]);
    const beltBtn = new Path2D();
    for (const x of [-10, 10]) for (const y of [-106, -100]) {
      beltBtn.moveTo(x + 1.9, y);
      beltBtn.arc(x, y, 1.9, 0, Math.PI * 2);
    }
    // collar frill (B) + bow tie (A) + brooch
    const collar = new Path2D();
    M(collar, -25, 146);
    Q(collar, -13, 152, 0, 150);
    Q(collar, 13, 152, 25, 146);
    for (let i = 0; i < 6; i++) {
      const a = lerp(25, -25, i / 6), b = lerp(25, -25, (i + 1) / 6);
      Q(collar, (a + b) / 2, 137.5, b, 146 - Math.abs(b) * 0.05);
    }
    collar.closePath();
    // big black butterfly bow (about 52 x 23, almost as wide as the shirt panel, gh) with the blue gem on the knot
    const wing = ["M", 4, -143, "C", 11, -153, 19, -156, 25, -151, "Q", 27, -141, 23, -131, "C", 17, -132, 10, -135, 4, -139, "Z"];
    const tie = new Path2D();
    trace(tie, wing, 1);
    trace(tie, wing, -1);
    const tieLines = trace(new Path2D(), ["M", 8.4, -143.6, "Q", 15.4, -147.1, 21, -146.4, "M", 8.4, -138.7, "Q", 14, -137.3, 19.6, -134.5, "M", -8.4, -143.6, "Q", -15.4, -147.1, -21, -146.4, "M", -8.4, -138.7, "Q", -14, -137.3, -19.6, -134.5]);
    const knot = trace(new Path2D(), ["M", -3, -147, "L", 3, -147, "Q", 5.5, -147, 5.5, -144.5, "L", 5.5, -138.5, "Q", 5.5, -136, 3, -136, "L", -3, -136, "Q", -5.5, -136, -5.5, -138.5, "L", -5.5, -144.5, "Q", -5.5, -147, -3, -147, "Z"]);
    const gem = trace(new Path2D(), ["M", 0, -147.2, "L", 4.3, -141.5, "L", 0, -135.8, "L", -4.3, -141.5, "Z"]);
    const gemDark = trace(new Path2D(), ["M", -3.6, -141.5, "L", 3.6, -141.5, "L", 0, -136.7, "Z"]);
    const whites = new Path2D(), ticks = new Path2D(), whiteInk = new Path2D();
    whites.addPath(blouse);
    whites.addPath(frills);
    ticks.addPath(pleats);
    ticks.addPath(frillTicks);
    whiteInk.addPath(blouse);
    whiteInk.addPath(frills);
    return { sash, sashIn, sashKnot, sashFold, bodice, bodSh, whites, blouseSh, ticks, whiteInk, buttons, caps, capTicks, belt, beltLine, beltBtn, collar, tie, tieLines, knot, gem, gemDark };
  })();
  function torso(ctx, p, lw) {
    const T = TORSO;
    inkFill(ctx, PAL.navy, lw, T.bodice);
    fillP(ctx, T.bodSh, PAL.navyShade);
    fillP(ctx, T.whites, PAL.white);
    fillP(ctx, T.blouseSh, A_.whiteSoft);
    if (lw < TEX) strokeP(ctx, T.ticks, PAL.whiteShade, lw * 0.38);
    strokeP(ctx, T.whiteInk, PAL.ink, lw * 0.48);
    fillP(ctx, T.buttons, PAL.navy);
    inkFill(ctx, PAL.navy, lw * 0.7, T.belt);
    if (lw < TEX) strokeP(ctx, T.beltLine, PAL.navyLight, lw * 0.35);
    fillP(ctx, T.beltBtn, PAL.gold);
    if (lw < 1.9) strokeP(ctx, T.beltBtn, PAL.goldShade, lw * 0.25);
    inkFill(ctx, PAL.white, lw * 0.55, T.collar);
    ctx.fillStyle = PAL.whiteShade;
    L.ellipse(ctx, 0, -145.5, 19, 2.6);
    ctx.fill();
    inkFill(ctx, PAL.bowTie, lw * 0.55, T.tie);
    if (lw < TEX) strokeP(ctx, T.tieLines, PAL.navyLight, lw * 0.35);
    inkFill(ctx, PAL.bowTie, lw * 0.5, T.knot);
    fillP(ctx, T.gem, PAL.brooch);
    if (lw < FINE) {
      strokeP(ctx, T.gem, PAL.gold, lw * 0.35);
      fillP(ctx, T.gemDark, PAL.broochDark);
      ctx.fillStyle = "#fff";
      L.circle(ctx, -1.4, -143.8, 1.1);
      ctx.fill();
    }
    ctx.fillStyle = A_.chin;
    L.ellipse(ctx, 0, -147, 17, 3.2);
    ctx.fill();
  }
  function shoulderCaps(ctx, lw) {
    fillP(ctx, TORSO.caps, PAL.white);
    if (lw < TEX) strokeP(ctx, TORSO.capTicks, PAL.whiteShade, lw * 0.35);
    strokeP(ctx, TORSO.caps, PAL.ink, lw * 0.5);
  }

  /* ================= FRONT SHOULDER LOCKS (lighter face-framing locks in front of the shoulders) ================= */
  // wide (about 22) wavy waist-length front curls ending in an outward-flicking pointed tip (gh)
  const FRONT_LOCK = [[64, 176], [80, 169], [90, 152], [93, 136], [91, 122], [96, 110], [101, 98, 1], [90, 102], [80, 110],
    [74, 122], [71, 136], [68, 150], [62, 162]];
  const FRONT_LINE = [[71, 164], [82, 144], [84, 124], [92, 106]];
  function frontLocks(ctx, p, lw, hg) {
    const sw = p.hair || 0, a0 = (p.headTilt || 0) * 0.6;
    // the front curls catch more light than the back mass (gh): they are built FL_DY lower and drawn translated back
    // up, which shifts the shared hair gradient up by FL_DY on them for free (no second gradient)
    const FL_DY = 40;
    const map = (x, h) => {
      let q = [x, -h];
      if (a0) q = rotAbout(q, NECK, a0);
      q[0] += sw * 9 * clamp((180 - h) / 80);
      q[1] += FL_DY;
      return q;
    };
    const pa = new Path2D(), ln = new Path2D();
    for (const m of [-1, 1]) {
      spline(pa, FRONT_LOCK.map(([x, h, s]) => { const q = map(m * x, h); q[2] = s; return q; }), true);
      spline(ln, FRONT_LINE.map(([x, h]) => map(m * x, h)), false);
    }
    ctx.save();
    ctx.translate(0, -FL_DY);
    ctx.fillStyle = hg;
    ctx.fill(pa);
    strokeP(ctx, ln, A_.lockLine, lw * 0.4);
    strokeP(ctx, pa, PAL.ink, lw * 0.8);
    ctx.restore();
  }

  /* ================= ARMS, CUFFS, HANDS ================= */
  const HAND_R = 10.5;
  // open hand blobs [x, y, rx, ry, rot] per side (−1, +1): palm, 4 fingers fanned about the forearm axis, thumb
  const OPEN_HAND = [-1, 1].map((side) => {
    const out = [[0, 0.5, 7.8, 7.4, 0]];
    for (const [a, len] of [[-0.62, 4.8], [-0.2, 5.8], [0.2, 5.6], [0.6, 4.6]]) {
      const d = 8.2 + len * 0.55;
      out.push([Math.sin(a) * d, 0.5 + Math.cos(a) * d, 2.55, len, -a]);
    }
    out.push([side * 8.2, -2, 2.7, 4.6, -side * 1.05]);
    return out;
  });
  function lerpAng(a, b, t) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  }
  // prop axis: mic → toward the mouth when the hand is near the face; phone → toward the ear-fin
  function propAim(A, tilt) {
    const hold = A.hold;
    if (hold !== "mic" && hold !== "phone") return undefined;
    const tgt = hold === "mic" ? rotAbout([0, -163], NECK, tilt) : rotAbout([A.side * 84, -200], NECK, tilt);
    const dx = tgt[0] - A.hd[0], dy = tgt[1] - A.hd[1];
    const w = 1 - sstep(75, 115, Math.hypot(dx, dy));
    const def = -Math.PI / 2 + (A.ang + Math.PI / 2) * 0.35 + A.side * 0.15;
    if (w <= 0) return def;
    const up = -Math.PI / 2 - A.side * 0.25;
    let at = Math.atan2(dy, dx);
    if (hold === "mic") at = lerpAng(up, at, 0.85);
    return lerpAng(def, at, w);
  }
  function drawMic(ctx, x, y, aim, lw, layer) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(aim + Math.PI / 2);
    if (layer === "back") {
      L.rr(ctx, -4.6, -16, 9.2, 34, 4);
      inkFill(ctx, "#2c2f3d", lw * 0.8);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(-2.8, -12, 1.8, 26);
    } else {
      L.rr(ctx, -6, -19, 12, 5, 2);
      inkFill(ctx, "#5b6078", lw * 0.6);
      L.circle(ctx, 0, -27, 10);
      inkFill(ctx, "#3a3f55", lw * 0.8);
      ctx.strokeStyle = "rgba(160,170,205,0.55)";
      ctx.lineWidth = lw * 0.3;
      ctx.beginPath();
      for (let k = -2; k <= 2; k++) {
        const hw = Math.sqrt(Math.max(0, 81 - (k * 3.6) ** 2));
        ctx.moveTo(-hw, -27 + k * 3.6);
        ctx.lineTo(hw, -27 + k * 3.6);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      L.ellipse(ctx, -4, -31.5, 2.8, 2, -0.5);
      ctx.fill();
    }
    ctx.restore();
  }
  const CUFF = (() => {
    const c = new Path2D();
    c.moveTo(-7.5, -11);
    c.lineTo(7.5, -11);
    c.lineTo(10, -4.5);
    c.quadraticCurveTo(9, -1.5, 6.8, -4);
    c.quadraticCurveTo(5, -1, 2.3, -3.5);
    c.quadraticCurveTo(0, -0.8, -2.3, -3.5);
    c.quadraticCurveTo(-5, -1, -6.8, -4);
    c.quadraticCurveTo(-9, -1.5, -10, -4.5);
    c.closePath();
    const t = new Path2D();
    for (const x of [-4.6, 0, 4.6]) {
      t.moveTo(x, -10);
      t.lineTo(x * 1.1, -5);
    }
    return { c, t };
  })();
  function drawArm(ctx, p, A, lw, tilt) {
    const { side, sh, el, hd, d1, d2, ang, hold } = A;
    const wr = [hd[0] - d2[0] * 10, hd[1] - d2[1] * 10];
    const puff = [sh[0] + d1[0] * 7 + side * 1.5, sh[1] + d1[1] * 7];
    const lwA = lw * 0.85;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // ink pass then colour pass → one merged outline (sleeve polyline + puff)
    const limb = new Path2D();
    limb.moveTo(sh[0], sh[1]);
    limb.lineTo(el[0], el[1]);
    limb.lineTo(wr[0], wr[1]);
    const pf = new Path2D();
    pf.arc(puff[0], puff[1], 13 + lwA, 0, Math.PI * 2);
    strokeP(ctx, limb, PAL.ink, 17 + lwA * 2);
    fillP(ctx, pf, PAL.ink);
    strokeP(ctx, limb, PAL.sleeve, 17);
    ctx.fillStyle = PAL.sleeve;
    L.circle(ctx, puff[0], puff[1], 13);
    ctx.fill();
    // cel shade on the lower-right side of each segment
    const sp = new Path2D();
    const shadeSeg = (a, b, off) => {
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const l = Math.hypot(nx, ny) || 1;
      nx /= l; ny /= l;
      if (nx + ny < 0) { nx = -nx; ny = -ny; }
      sp.moveTo(a[0] + nx * off, a[1] + ny * off);
      sp.lineTo(b[0] + nx * off, b[1] + ny * off);
    };
    shadeSeg([sh[0] + d1[0] * 8, sh[1] + d1[1] * 8], el, 5.4);
    shadeSeg(el, wr, 4.8);
    strokeP(ctx, sp, PAL.navyShade, 5);
    // puff highlight
    if (lw < 2.2) {
      ctx.strokeStyle = PAL.navyLight;
      ctx.lineWidth = lw * 0.8;
      ctx.beginPath();
      ctx.arc(puff[0], puff[1], 8.5, Math.PI * 1.1, Math.PI * 1.55);
      ctx.stroke();
    }
    // gold rings near the wrist
    const px = -d2[1], py = d2[0];
    ctx.strokeStyle = PAL.gold;
    ctx.lineWidth = lw * 0.32;
    ctx.beginPath();
    for (const k of [5, 8]) {
      const cx = wr[0] - d2[0] * k, cy = wr[1] - d2[1] * k;
      ctx.moveTo(cx - px * 7.6, cy - py * 7.6);
      ctx.lineTo(cx + px * 7.6, cy + py * 7.6);
    }
    ctx.stroke();
    // lace cuff frill (hand frame: +y along the forearm)
    ctx.save();
    ctx.translate(hd[0], hd[1]);
    ctx.rotate(ang - Math.PI / 2);
    inkFill(ctx, PAL.white, lw * 0.55, CUFF.c);
    if (lw < TEX) strokeP(ctx, CUFF.t, PAL.whiteShade, lw * 0.3);
    ctx.restore();
    const aim = propAim(A, tilt);
    if (hold === "mic") drawMic(ctx, hd[0], hd[1], aim, lw, "back");
    else if (hold) CAST.prop(ctx, hold, hd[0], hd[1], ang, side, lw, "back", aim);
    // hand
    ctx.save();
    ctx.translate(hd[0], hd[1]);
    ctx.rotate(ang - Math.PI / 2);
    if (!hold && A.a > 95) {
      // open hand: palm + 4 spread fingers + thumb (hand frame: +y along the forearm)
      const blobs = OPEN_HAND[side < 0 ? 0 : 1];
      const ob = lw * 0.42;
      ctx.fillStyle = PAL.ink;
      ctx.beginPath();
      for (const [x, y, rx, ry, r] of blobs) {
        ctx.moveTo(x + (rx + ob) * Math.cos(r), y + (rx + ob) * Math.sin(r));
        ctx.ellipse(x, y, rx + ob, ry + ob, r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = PAL.skin;
      ctx.beginPath();
      for (const [x, y, rx, ry, r] of blobs) {
        ctx.moveTo(x + rx * Math.cos(r), y + rx * Math.sin(r));
        ctx.ellipse(x, y, rx, ry, r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.strokeStyle = A_.skinSh;
      ctx.lineWidth = lw * 0.35;
      ctx.beginPath();
      ctx.arc(0, 1, 5.5, 0.3, 1.6);
      ctx.stroke();
    } else {
      L.circle(ctx, 0, 0, HAND_R);
      inkFill(ctx, PAL.skin, lw * 0.75);
      ctx.fillStyle = PAL.skinShade;
      ctx.beginPath();
      ctx.arc(0, 0, HAND_R - 0.8, -0.2, 1.9);
      ctx.quadraticCurveTo(2.8, 3.4, HAND_R - 0.9, -1.6);
      ctx.fill();
      if (lw < 2.2) {
        ctx.strokeStyle = A_.fingers;
        ctx.lineWidth = lw * 0.28;
        ctx.beginPath();
        for (const x of [-3, 0.2, 3.4]) {
          ctx.moveTo(x, 4);
          ctx.lineTo(x + 0.3, 7.6);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
    if (hold === "mic") drawMic(ctx, hd[0], hd[1], aim, lw, "front");
    else if (hold) CAST.prop(ctx, hold, hd[0], hd[1], ang, side, lw, "front", aim);
  }

  /* ================= HEAD: fins ================= */
  // whale ear-fin (gh / cover): a floppy, drooping ear: convex top edge (near-flat at the root, curving down to a
  // pointed tip out and ~35-40° down); a pale lavender crescent underneath (deepest at the root) that breaks into 3
  // uneven pointed fur tufts pointing down-back (largest at the root); two soft fluff strokes. The root hides behind
  // the billowing side hair.
  const FIN_BODY = ["M", 86, -228, "C", 112, -230, 144, -214, 160, -186, "C", 143, -191, 116, -197, 90, -199, "Z"];
  const FIN_SHADE = ["M", 94, -211, "C", 116, -210, 143, -200, 157, -188.5, "L", 160, -186, "C", 143, -191, 116, -197, 90, -199, "Z"];
  const FIN_SHEEN = ["M", 106, -226, "C", 124, -225, 142, -212, 151, -199];
  // fringe as (x, h[, sharp]) points: along the fin's lower edge to the tip, then back along the tufted crescent
  const FIN_FRINGE = [[90, 199, 1], [116, 196.5], [142, 190.5], [160, 186, 1], [152, 182.5], [145, 181.5], [138, 177.5, 1],
    [136.5, 183.5, 1], [130, 182.5], [123, 178.5], [116.5, 174.5, 1], [114.5, 183.5, 1], [108, 182], [101, 176.5], [95, 171.5, 1],
    [93, 181], [90, 190]];
  const FIN_FLUFF = ["M", 149, -185.5, "Q", 145, -184.5, 141, -182.5, "M", 131, -188.5, "Q", 125, -187, 120, -183, "M", 111, -191, "Q", 104, -188.5, 99, -183];
  function finPaths(ears) {
    const src = [null, FIN_FLUFF, FIN_BODY, FIN_SHADE, FIN_SHEEN];
    const out = src.map(() => new Path2D());
    for (const m of [-1, 1]) {
      const f = finXf(ears, m);
      spline(out[0], FIN_FRINGE.map(([x, h, c]) => { const q = f(x, -h); q[2] = c; return q; }), true);
      for (let i = 1; i < src.length; i++) trace(out[i], src[i], 1, f);
    }
    const ink = new Path2D();
    ink.addPath(out[0]);
    ink.addPath(out[2]);
    out.push(ink);
    return out;
  }
  let FIN_STATIC = null;
  function fins(ctx, p, lw) {
    const ears = p.ears || 0;
    const F = ears ? finPaths(ears) : FIN_STATIC || (FIN_STATIC = finPaths(0));
    fillP(ctx, F[0], PAL.finUnder);
    if (lw < FINE) strokeP(ctx, F[1], PAL.finFluff, lw * 0.55);
    fillP(ctx, F[2], PAL.finTop);
    fillP(ctx, F[3], PAL.finShade);
    if (lw < FINE) strokeP(ctx, F[4], PAL.finSheen, lw * 0.9);
    strokeP(ctx, F[5], PAL.ink, lw * 0.9);
  }

  /* ================= HEAD: face (B's mochi shape) ================= */
  const FACE_R = [[58, 262], [61, 230], [62.5, 200], [61, 178], [56, 163], [44, 152.5], [26, 147.5], [0, 146]];
  const FACE_PTS = Hp(FACE_R.map(([x, h]) => [-x, h]).concat(FACE_R.slice(0, -1).reverse()));
  const FACE_P = spline(new Path2D(), FACE_PTS, true);
  const FACE_LINE = spline(new Path2D(), FACE_PTS.slice(2, FACE_PTS.length - 2), false);

  /* ================= HEAD: bangs (heavy, swept, asymmetric fringe, gh / cover) ================= */
  // The part sits left of centre; one broad central clump sweeps down and to screen-right between the eyes and ends in a
  // pointed tip at the right eye's inner corner (plus a short middle wisp and a left sub-tip over the left eye's inner
  // lash). The forehead only shows through two narrow windows (apexes (-33, 238) and (27, 238)) and two small notches;
  // pointed clumps (R2 / L2) come down over the outer irises and the outer clumps to the outer lash corners. Everything
  // is drawn after the eyes, so the tips overlap the lashes.
  const BANG_START = [67, 229];
  // lower edge, right temple -> left temple: [c1x,c1h,c2x,c2h,x,h] cubic (straight-ish chords -> sharp apexes)
  // Heavy fringe (gh): the forehead only shows through two narrow, low windows (~16-20 wide × ~30 tall, apexes at
  // h 238) and two small notches; pointed locks come down to lash level over the outer half of each eye.
  const BANG_EDGE = [
    [65, 221, 62, 211, 61, 203],          // 0 R1 outer clump tip at the right eye's outer corner (over the side lock -> hairLine)
    [58, 212, 54, 222, 50, 226],          // 1 small notch
    [47, 219, 44, 211, 42, 205],          // 2 R2 tip over the right eye's outer iris
    [37, 215, 31, 229, 27, 238],          // 3 right window, right edge -> apex
    [19, 222, 12, 205, 13, 190],          // 4 central clump right edge, hooks right to the main tip (right eye inner corner)
    [10, 194, 6, 199, 3, 204],            // 5 back up to a notch
    [0, 200, -4, 195.5, -9, 193],         // 6 short middle wisp tip
    [-11, 197, -13, 202, -15, 206],       // 7 notch
    [-17, 202, -20, 199, -23, 197],       // 8 left sub-tip over the left eye's inner lash
    [-26, 210, -30, 226, -33, 238],       // 9 left window, right edge -> apex
    [-36, 224, -40, 212, -44, 205],       // 10 L2 tip over the left eye's outer iris
    [-47, 214, -51, 223, -53, 226],       // 11 small notch
    [-56, 219, -58, 212, -61, 206],       // 12 L1 outer clump tip at the left eye's outer corner
    [-63, 214, -67, 226, -73, 236],       // 13 (over the side lock -> hairLine, not ink)
  ];
  const BANG_TIPS_R = [0, 2, 4, 6, 8, 10, 12]; // each clump's right edge (cel-shaded, light from the upper-left)
  const BANG_LAST = BANG_EDGE.length - 1;
  const segEnd = (i) => (i < 0 ? BANG_START : BANG_EDGE[i].slice(-2));
  const bangSeg = (c, s) => (s.length === 4 ? Q(c, s[0], s[1], s[2], s[3]) : B(c, s[0], s[1], s[2], s[3], s[4], s[5]));
  const BANGS = (() => {
    const bp = new Path2D();
    M(bp, -97, 252);
    B(bp, -97, 300, -54, 323, 0, 323);
    B(bp, 54, 323, 97, 300, 97, 252);
    B(bp, 86, 246, 72, 240, BANG_START[0], BANG_START[1]);
    for (const s of BANG_EDGE) bangSeg(bp, s);
    B(bp, -80, 244, -90, 248, -97, 252);
    bp.closePath();
    // (no clip needed: every shade below is built inside the fringe silhouette)
    // cel shade just under the ruffle: a crescent below the crown arc
    const ruff = new Path2D();
    M(ruff, -97, 252);
    B(ruff, -97, 300, -54, 323, 0, 323);
    B(ruff, 54, 323, 97, 300, 97, 252);
    B(ruff, 94, 290, 50, 311, 0, 312);
    B(ruff, -50, 311, -94, 290, -97, 252);
    ruff.closePath();
    // lock separations: tapered S-curves from the apexes / notches up toward the part (x = -6), unequal lengths
    const gaps = new Path2D();
    lockPath(gaps, [27, 239], [24, 256], [16, 276], [5, 298], 3.8, 2.6, 1.3);
    lockPath(gaps, [-33, 239], [-33, 256], [-28, 276], [-18, 296], 3.8, 2.6, 1.3);
    lockPath(gaps, [3, 205], [0, 222], [-1, 238], [-6, 258], 2.8, 1.9, 0.9);
    lockPath(gaps, [-15, 207], [-18, 224], [-19, 242], [-15, 264], 2.8, 2, 0.9);
    lockPath(gaps, [66, 231], [64, 250], [58, 271], [47, 290], 3, 2, 1);
    lockPath(gaps, [-71, 238], [-68, 256], [-62, 275], [-52, 292], 3, 2, 1);
    lockPath(gaps, [50, 227], [48, 243], [43, 262], [35, 281], 2.6, 1.8, 0.8);
    lockPath(gaps, [-53, 227], [-53, 243], [-49, 262], [-41, 281], 2.6, 1.8, 0.8);
    // cel shade along each clump's right edge: a one-sided band on the hair side of the edge
    const segPts = (i, n) => {
      const a = segEnd(i - 1), sg = BANG_EDGE[i], out = [];
      for (let k = 0; k <= n; k++) {
        const t = k / n, u = 1 - t;
        const q = sg.length === 4
          ? [u * u * a[0] + 2 * u * t * sg[0] + t * t * sg[2], u * u * a[1] + 2 * u * t * sg[1] + t * t * sg[3]]
          : bez(a, [sg[0], sg[1]], [sg[2], sg[3]], [sg[4], sg[5]], t);
        out.push([q[0], -q[1]]);
      }
      return out;
    };
    const cel = new Path2D();
    for (const i of BANG_TIPS_R) {
      const pts = segPts(i, 10), n = pts.length, inner = [];
      for (let k = 0; k < n; k++) {
        const a = pts[Math.max(0, k - 1)], b = pts[Math.min(n - 1, k + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        const w = 4.2 * Math.pow(Math.sin((Math.PI * k) / (n - 1)), 0.7);
        inner.push([pts[k][0] - (dy / l) * w, pts[k][1] + (dx / l) * w]);
      }
      smoothTo(cel, pts, true);
      smoothTo(cel, inner.reverse(), false);
      cel.closePath();
    }
    // crown shine = a wide, uneven "angel ring" band (gh / cover): one horizontal, lumpy bean just left of the part
    // (no vertical axis: it must not read as a keyhole / gem), a small separate lobe below-left, and short strand-aligned
    // strips spread along the head curve (the outer ones lower)
    const shine = new Path2D();
    M(shine, -30, 271);
    B(shine, -29, 279, -14, 282, -4, 279);
    B(shine, 4, 277, 6, 271, 1, 268.5);
    B(shine, -3, 267, -7, 264, -13, 263.5);
    B(shine, -21, 263, -31, 265, -30, 271);
    shine.closePath();
    shine.moveTo(-18.2, -261);
    shine.ellipse(-22, -261, 4, 2.4, -0.25, 0, Math.PI * 2);
    shine.closePath();
    for (const [x, h, w, len] of [[-40, 267, 2.1, 9.5], [-52, 261, 1.8, 7.6], [-63, 253, 1.4, 5.4], [16, 268, 2.3, 10], [29, 263.5, 2, 8], [42, 257, 1.6, 6]]) {
      const r = -x / 170;
      shine.moveTo(x + w * Math.cos(r), -h + w * Math.sin(r));
      shine.ellipse(x, -h, w, len, r, 0, Math.PI * 2);
      shine.closePath();
    }
    // thin 1-unit glint along the bean's upper edge
    const hi = new Path2D();
    hi.ellipse(-15, -279, 7, 1.1, -0.04, 0, Math.PI * 2);
    // fine strands following the sweep (one runs into the central clump; the outer ones stay out of the windows)
    const fine = new Path2D();
    M(fine, -9, 254);
    B(fine, -9, 236, -3, 218, 8, 202);
    M(fine, -36, 296);
    B(fine, -48, 280, -58, 262, -64, 240);
    M(fine, 30, 294);
    B(fine, 42, 276, 50, 256, 55, 236);
    // edges: ink only where hair meets skin (segments 1..last-1); hairLine over the side locks (0 and last)
    const ink = new Path2D(), hairEdge = new Path2D();
    M(hairEdge, BANG_START[0], BANG_START[1]);
    bangSeg(hairEdge, BANG_EDGE[0]);
    const e0 = segEnd(0);
    M(ink, e0[0], e0[1]);
    for (let i = 1; i <= BANG_LAST - 1; i++) bangSeg(ink, BANG_EDGE[i]);
    const e8 = segEnd(BANG_LAST - 1);
    M(hairEdge, e8[0], e8[1]);
    bangSeg(hairEdge, BANG_EDGE[BANG_LAST]);
    // part line, left of centre (stops above the shine)
    M(fine, -4, 314);
    Q(fine, -5.5, 303, -7, 290);
    fine.addPath(hairEdge);
    const shade = new Path2D();
    shade.addPath(ruff);
    shade.addPath(gaps);
    shade.addPath(cel);
    return { bp, shade, shine, hi, fine, ink };
  })();

  /* ================= HEAD: side locks (B's curtains: inward-curling tips, dark framing separations) ================= */
  const CURT = (() => {
    const body = new Path2D(), sep = new Path2D(), str = new Path2D(), skin = new Path2D(), out = new Path2D(), lines = new Path2D();
    for (const s of [-1, 1]) {
      const c = {
        moveTo: (x, y) => body.moveTo(s * x, y),
        bezierCurveTo: (a, b, c2, d, e, f) => body.bezierCurveTo(s * a, b, s * c2, d, s * e, f),
        closePath: () => body.closePath(),
      };
      M(c, 62, 266);
      B(c, 60, 240, 60, 215, 61.5, 195);
      B(c, 62.5, 179, 57, 161, 47, 151);
      B(c, 56, 156, 62.5, 165, 66, 175);
      B(c, 68.5, 163, 67, 152, 63, 143);
      B(c, 73, 149, 83, 156, 90, 160);
      B(c, 95, 156, 103, 151, 114, 150);
      B(c, 108, 158, 101, 166, 100, 176);
      B(c, 100, 188, 112, 200, 113, 218);
      B(c, 113, 236, 103, 258, 86, 274);
      c.closePath();
      const mir = (pts) => pts.map(([x, h]) => [s * x, h]);
      const lp = (a, b, c2, d, w0, w1, w2) => {
        const q = mir([a, b, c2, d]);
        lockPath(sep, q[0], q[1], q[2], q[3], w0, w1, w2);
      };
      lp([66, 175], [70, 200], [71, 230], [69, 262], 3, 2.2, 1.2);
      lp([90, 161], [93, 186], [92, 214], [92, 246], 2.6, 1.6, 0.8);
      M(str, s * 64, 244);
      B(str, s * 65.5, 215, s * 65, 188, s * 57, 163);
      M(str, s * 78, 238);
      B(str, s * 80, 205, s * 77, 172, s * 66, 149);
      M(skin, s * 60.1, 232);
      B(skin, s * 60, 215, s * 60.5, 205, s * 61.5, 195);
      B(skin, s * 62.5, 179, s * 57, 161, s * 47, 151);
      B(skin, s * 56, 156, s * 62.5, 165, s * 66, 175);
      M(out, s * 105, 158.5);
      B(out, s * 102, 166, s * 100, 170, s * 100, 176);
      B(out, s * 100, 188, s * 112, 200, s * 113, 218);
      B(out, s * 113, 236, s * 103, 258, s * 86, 274);
    }
    lines.addPath(body);
    lines.addPath(str);
    return { body, sep, lines, skin, out };
  })();

  function faceSkin(ctx, p, lw) {
    fillP(ctx, FACE_P, PAL.skin);
    // hair shadow of the fringe on the upper forehead (a band under the skin-side edge, fills the window apexes) so the
    // eyes stay the brightest part of the face
    ctx.save();
    ctx.translate(0.8, 3.5);
    strokeP(ctx, BANGS.ink, A_.bangShadow, 7.5);
    ctx.restore();
    strokeP(ctx, FACE_LINE, PAL.ink, lw * 0.8);
    ctx.fillStyle = rgba(PAL.blushHatch, 0.8);
    L.circle(ctx, 0.5, -177.5, 0.85);
    ctx.fill();
  }
  function blush(ctx, p, lw) {
    const f = p.face || "open";
    let bl = p.blush === undefined ? 1 : p.blush;
    if (f === "shock") bl *= 0.5;
    if (bl <= 0) return;
    const a = Math.min(1, bl);
    const hatch = f === "happy" || f === "sing" ? (bl >= 1 ? 0.4 + clamp((bl - 1) * 2) * 0.6 : 0) : clamp((bl - 1) * 2);
    for (const m of [-1, 1]) {
      ctx.save();
      ctx.translate(m * 46, -167);
      ctx.scale(1, 0.6);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
      g.addColorStop(0, rgba(PAL.blushCore, 0.85 * a));
      g.addColorStop(0.5, rgba(PAL.blushCore, 0.5 * a));
      g.addColorStop(1, rgba(PAL.blush, 0));
      ctx.fillStyle = g;
      L.circle(ctx, 0, 0, 18);
      ctx.fill();
      ctx.restore();
    }
    if (hatch > 0) {
      ctx.strokeStyle = rgba(PAL.blushHatch, hatch);
      ctx.lineWidth = Math.max(0.6, lw * 0.28);
      ctx.beginPath();
      for (const m of [-1, 1]) {
        for (const k of [-5.5, 0, 5.5]) {
          ctx.moveTo(m * 46 + k - 1.7, -163.8);
          ctx.lineTo(m * 46 + k + 1.7, -170.2);
        }
      }
      ctx.stroke();
    }
  }

  /* ================= HEAD: eyes (A's arched lash + heavy outer wedge; world-locked highlights) ================= */
  // outward coordinate u (>0 away from the face centre); X = m*u
  const LASH_OPEN = [[16, -200], [24, -211], [46, -213], [57, -197]];
  const LASH_CLOSED = [[16, -193], [26, -187], [44, -186], [56, -192]];
  const LASH_SMUG = [[16, -195], [26, -197.5], [44, -196], [57, -189]];
  const LASH_DET = [[16, -197], [24, -203], [46, -212], [57, -199]];
  const lashW = (u) => (u < 0.4 ? lerp(1.6, 5.2, smooth(u / 0.4)) : u < 0.78 ? lerp(5.2, 4.3, (u - 0.4) / 0.38) : lerp(4.3, 1.2, smooth((u - 0.78) / 0.22)));
  function eyeOpen(ctx, p, m, f, o, look, lw, kF) {
    const shock = f === "shock";
    const base = f === "smug" ? LASH_SMUG : f === "determined" ? LASH_DET : LASH_OPEN;
    const lift = shock ? 3 : 0;
    const Lp = base.map((q, i) => [m * q[0], lerp(LASH_CLOSED[i][1], q[1], o) - lift]);
    if (o < 0.15) {
      closedLine(ctx, m, lw, kF, false);
      return;
    }
    const fx = p.flip ? -1 : 1; // highlights keep the same WORLD direction (upper-left) in both eyes, also when flipped
    ctx.save();
    if (shock) {
      ctx.translate(m * 35, -190);
      ctx.scale(1.15, 1.15);
      ctx.translate(-m * 35, 190);
    }
    const wp = new Path2D();
    wp.moveTo(Lp[0][0], Lp[0][1]);
    wp.bezierCurveTo(Lp[1][0], Lp[1][1], Lp[2][0], Lp[2][1], Lp[3][0], Lp[3][1]);
    wp.bezierCurveTo(m * 56.5, -181, m * 45, -171, m * 34, -171);
    wp.bezierCurveTo(m * 23, -171, m * 16, -185, Lp[0][0], Lp[0][1]);
    wp.closePath();
    fillP(ctx, wp, PAL.eyeWhite);
    ctx.save();
    ctx.clip(wp);
    // lash shadow band on the white (thin: the big iris tucks straight under the lash)
    ctx.beginPath();
    ctx.moveTo(Lp[0][0], Lp[0][1] + 3.5);
    ctx.bezierCurveTo(Lp[1][0], Lp[1][1] + 4, Lp[2][0], Lp[2][1] + 4, Lp[3][0], Lp[3][1] + 3.5);
    ctx.lineTo(Lp[3][0], Lp[3][1] - 20);
    ctx.lineTo(Lp[0][0], Lp[0][1] - 20);
    ctx.closePath();
    ctx.fillStyle = PAL.eyeWhiteShade;
    ctx.fill();
    // iris: big (≈80 % of the eye width, top clipped under the lash, white only at the outer-lower corner, gh):
    // dark indigo top → light sky-blue bottom, thin darker rim
    const ix = m * (shock ? 33 : 34.5) + look[0] * 4, iy = (shock ? -188.5 : -191) + look[1] * 3;
    const irx = shock ? 7 : 16, iry = shock ? 9 : 20.5;
    const g = ctx.createLinearGradient(0, iy - iry, 0, iy + iry);
    g.addColorStop(0, PAL.irisTop);
    g.addColorStop(0.35, PAL.iris1);
    g.addColorStop(0.66, PAL.iris2);
    g.addColorStop(0.9, PAL.iris3);
    g.addColorStop(1, PAL.irisGlow);
    L.ellipse(ctx, ix, iy, irx, iry);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = PAL.pupil;
    ctx.lineWidth = Math.max(0.7, lw * 0.32);
    ctx.stroke();
    if (!shock) {
      ctx.fillStyle = A_.pupil85;
      L.ellipse(ctx, ix, iy - 3.5, 6.5, 9.5);
      ctx.fill();
      // lower glow bubble, two cel steps
      ctx.fillStyle = A_.glow2;
      L.ellipse(ctx, ix + 1, iy + 12, 9, 5);
      ctx.fill();
      ctx.fillStyle = A_.glow;
      L.ellipse(ctx, ix + 1, iy + 13.5, 5, 2.6);
      ctx.fill();
      ctx.fillStyle = PAL.highlight;
      if (p.sparkle) {
        L.star(ctx, ix - 5 * fx, iy - 8, 6.6, 1.9, 4, 0);
        ctx.fill();
        L.star(ctx, ix + 6 * fx, iy + 6, 3, 1, 4, 0);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(ix - 5.5 * fx, iy - 8.5, 5, 4.6, -0.3 * fx, 0, Math.PI * 2);
        ctx.moveTo(ix + 6 * fx + 2.1, iy + 6);
        ctx.arc(ix + 6 * fx, iy + 6, 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.irisGlow;
        L.circle(ctx, ix + 6 * fx, iy - 9, 1.4);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = PAL.highlight;
      L.circle(ctx, ix - 2 * fx, iy - 3, 2.2);
      ctx.fill();
    }
    ctx.restore();
    // lower lid (outer half)
    if (lw < FINE) {
      ctx.strokeStyle = A_.lid;
      ctx.lineWidth = lw * 0.32;
      ctx.beginPath();
      ctx.moveTo(m * 51, -177);
      ctx.quadraticCurveTo(m * 45, -172.5, m * 38, -171.6);
      ctx.stroke();
    }
    // filled upper lash: arched, carried down the outer side of the eye as a heavy dark wedge (gh)
    const lp = cub(Lp[0], Lp[1], Lp[2], Lp[3], 12);
    for (const t of [0.12, 0.24, 0.34]) lp.push(bez(Lp[3], [m * 56.5, -181], [m * 45, -171], [m * 34, -171], t));
    const kW = (shock ? 0.72 : 1) * kF;
    const br = ribbon(lp.slice(7).map((q) => [q[0] - m * 0.6, q[1] + 1.8]), (u) => lerp(2.4, 1.6, u) * kF);
    fillP(ctx, br.path, PAL.lashBrown);
    const R = ribbon(lp, (u) => lashW(u) * kW);
    fillP(ctx, R.path, PAL.lash);
    // outer flick + two ticks
    const e = Lp[3];
    ctx.beginPath();
    ctx.moveTo(e[0] - m * 4, e[1] - 3.2 * kW);
    ctx.quadraticCurveTo(e[0] + m * 2.5, e[1] - 3.5, e[0] + m * 5, e[1] - 6.5);
    ctx.quadraticCurveTo(e[0] + m * 2.5, e[1] + 0.5, e[0] - m * 1, e[1] + 1.4 * kW);
    ctx.closePath();
    for (const i of [8, 10]) {
      const q = R.B[i], a = lp[i - 1], b = lp[i + 1];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl; ty /= tl;
      ctx.moveTo(q[0] - tx * 1.6, q[1] - ty * 1.6 + 0.6);
      ctx.lineTo(q[0] + m * 2.6 - tx * 0.4, q[1] - 3.6 * kF);
      ctx.lineTo(q[0] + tx * 1.4, q[1] + ty * 1.4 + 0.6);
      ctx.closePath();
    }
    ctx.fillStyle = PAL.lash;
    ctx.fill();
    // double-eyelid crease
    if (o > 0.6 && !shock && f !== "smug" && lw < FINE) {
      ctx.strokeStyle = A_.crease;
      ctx.lineWidth = lw * 0.28;
      ctx.beginPath();
      ctx.moveTo(m * 25, Lp[1][1] - 3.5);
      ctx.quadraticCurveTo(m * 34, Lp[1][1] - 6, m * 43, Lp[2][1] - 3.5);
      ctx.stroke();
    }
    ctx.restore();
  }
  const arcLash = (pts, kF, wMax, wEnd) => ribbon(pts, (u) => (wEnd + (wMax - wEnd) * Math.sin(Math.PI * u)) * kF);
  function eyeArc(ctx, m, lw, kF) {
    // ^ closed happy eye (cover): thick filled crescent, convex up, outer end hooks down, 3 outer lash ticks
    const lp = cub([m * 18, -195], [m * 23, -207], [m * 45, -211], [m * 56.5, -191], 12);
    fillP(ctx, arcLash(lp.map((q) => [q[0], q[1] + 2.2]), kF, 3, 1.2).path, PAL.lashBrown);
    const R = arcLash(lp, kF, 5, 1.6);
    fillP(ctx, R.path, PAL.lash);
    ctx.fillStyle = PAL.lash;
    ctx.beginPath();
    for (const [i, len] of [[8, 4.4], [10, 5.2], [12, 4.6]]) {
      const q = R.B[i];
      ctx.moveTo(q[0] - m * 1.6, q[1] + 1.2);
      ctx.lineTo(q[0] + m * 3.6, q[1] - len * kF);
      ctx.lineTo(q[0] + m * 1.6, q[1] + 1.6);
      ctx.closePath();
    }
    ctx.fill();
  }
  function closedLine(ctx, m, lw, kF, lashes) {
    // "‿" closed / sleepy line
    const lp = cub([m * 16, -194], [m * 24, -187], [m * 44, -186], [m * 55, -193], 12);
    fillP(ctx, arcLash(lp, kF, 3.2, 1.2).path, PAL.lash);
    if (lashes) {
      ctx.strokeStyle = PAL.lash;
      ctx.lineWidth = lw * 0.4 * kF;
      ctx.beginPath();
      for (const i of [7, 9, 11]) {
        const q = lp[i];
        ctx.moveTo(q[0], q[1] + 1);
        ctx.lineTo(q[0] + m * 2, q[1] + 4.6);
      }
      ctx.stroke();
    }
  }
  const EYE_DX = 3, EYE_S = 1.05;
  function eyes(ctx, p, lw) {
    const f = p.face || "open";
    const blink = clamp(p.blink || 0);
    const look = p.look || (f === "smug" ? [0.75, 0.2] : [0, 0]);
    const kF = Math.max(1, Math.sqrt(lw / 2.6));
    for (const m of [-1, 1]) {
      ctx.save();
      ctx.translate(m * (36.5 + EYE_DX), -191);
      ctx.scale(EYE_S, EYE_S);
      ctx.translate(-m * 36.5, 191);
      if (f === "happy" || f === "sing" || (f === "wink" && m > 0)) eyeArc(ctx, m, lw, kF);
      else if (f === "sleepy") closedLine(ctx, m, lw, kF, true);
      else if (f === "dizzy") {
        ctx.strokeStyle = PAL.lash;
        ctx.lineWidth = lw * 0.46 * kF;
        ctx.beginPath();
        const cx = m * 35, cy = -189;
        for (let i = 0; i <= 34; i++) {
          const a = (i / 34) * Math.PI * 5 * m, r = 1 + (i / 34) * 12.5;
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.95;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        const lp = cub([m * 18, -203], [m * 26, -209], [m * 44, -210], [m * 54, -200], 10);
        fillP(ctx, arcLash(lp, kF, 2.4, 0.8).path, PAL.lash);
      } else if (f === "cry") {
        const pts = [[m * 52, -205], [m * 42, -201], [m * 30, -196.5], [m * 19, -192.5], [m * 30, -188.5], [m * 42, -184], [m * 52, -180]];
        fillP(ctx, ribbon(pts, (u) => (1.2 + 2.8 * (1 - Math.abs(u - 0.5) * 2)) * kF).path, PAL.lash);
        const tx = m * 30;
        ctx.beginPath();
        ctx.moveTo(tx, -180);
        ctx.quadraticCurveTo(tx - 5.5, -168, tx, -163.5);
        ctx.quadraticCurveTo(tx + 5.5, -168, tx, -180);
        inkFill(ctx, PAL.tear, lw * 0.3);
        ctx.fillStyle = "#fff";
        L.circle(ctx, tx - 1.4, -168.5, 1.1);
        ctx.fill();
      } else {
        const o = f === "wink" ? 1 : 1 - blink * (f === "shock" ? 0.6 : 1);
        eyeOpen(ctx, p, m, f, o, look, lw, kF);
      }
      ctx.restore();
    }
  }
  // brows: drawn once under the bangs (visible in the forehead windows) and once over them at 25 %
  function browPath(p) {
    const f = p.face || "open";
    const pa = new Path2D();
    for (const m of [-1, 1]) {
      let ri = 0, ro = 0, ar = 0;
      if (f === "happy" || f === "sing") { ri = 3; ro = 3; ar = 2; }
      else if (f === "wink") { ri = 2; ro = 2.5; ar = 1; }
      else if (f === "shock") { ri = 7; ro = 7; ar = 4; }
      else if (f === "smug") { ri = m < 0 ? -1 : 0.5; ro = m < 0 ? -1.5 : 0.5; ar = -2; }
      else if (f === "sleepy") { ri = -2; ro = -5; ar = -1; }
      else if (f === "determined") { ri = -5; ro = 1; ar = -1.5; }
      else if (f === "dizzy") { ri = m < 0 ? 3 : -1; ro = m < 0 ? -1 : 3; ar = 1; }
      else if (f === "cry") { ri = 5; ro = -2; ar = -1; }
      const a = [m * 27, -224 - ri], b = [m * 46, -224 - ro];
      const c = [m * 36.5, (a[1] + b[1]) / 2 - 3 - ar];
      const pts = quad(a, c, b, 8);
      if (f === "dizzy") pts.forEach((q, i) => (q[1] += Math.sin(i * 1.4) * 1.2));
      ribbon(pts, (u) => lerp(1.35, 0.4, u), pa);
    }
    return pa;
  }
  const CRY_MOUTH = ["M", -9, -157, "C", -9, -166, -5, -170.5, 0, -170.5, "C", 5, -170.5, 9, -166, 9, -157, "Q", 4.5, -160, 0, -157.5, "Q", -4.5, -155, -9, -157, "Z"];
  const MOUTH_DEF = { open: 0.15, happy: 0.45, sing: 0.55, wink: 0.3 };
  function mouth(ctx, p, lw) {
    const f = p.face || "open";
    let m = p.mouth;
    if (m === undefined) m = MOUTH_DEF[f] || 0;
    m = clamp(m);
    const lwM = Math.max(0.9, lw * 0.42);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const openShape = (pa, fillCol, tongueY, tw, th) => {
      fillP(ctx, pa, fillCol);
      ctx.save();
      ctx.clip(pa);
      ctx.fillStyle = PAL.tongue;
      L.ellipse(ctx, 0, tongueY, tw, th);
      ctx.fill();
      ctx.restore();
      strokeP(ctx, pa, PAL.mouthLine, lwM);
    };
    if (f === "shock") {
      const rx = 3.6 + 2 * m, ry = 5 + 3 * m, cy = -169 + ry;
      const pa = new Path2D();
      pa.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2);
      openShape(pa, PAL.mouthIn, cy + ry, rx * 0.8, ry * 0.5);
      return;
    }
    if (f === "cry") {
      openShape(path(CRY_MOUTH), PAL.mouthIn, -156, 7, 4);
      return;
    }
    if (m < 0.08) {
      ctx.strokeStyle = PAL.mouthLine;
      ctx.lineWidth = lwM * 1.1;
      ctx.beginPath();
      if (f === "smug") {
        ctx.moveTo(-8, -166);
        ctx.quadraticCurveTo(-4, -159.5, 0, -164);
        ctx.quadraticCurveTo(4, -159.5, 8, -166);
      } else if (f === "dizzy") {
        ctx.moveTo(-8, -164);
        ctx.quadraticCurveTo(-4, -168, 0, -164);
        ctx.quadraticCurveTo(4, -160, 8, -164);
      } else if (f === "sleepy") {
        const pa = new Path2D();
        pa.ellipse(0, -163, 2.3, 2.7, 0, 0, Math.PI * 2);
        fillP(ctx, pa, PAL.mouthIn2);
        strokeP(ctx, pa, PAL.mouthLine, lwM);
        return;
      } else if (f === "determined") {
        ctx.moveTo(-5.5, -164);
        ctx.quadraticCurveTo(0, -165.5, 5.5, -164);
      } else {
        ctx.moveTo(-4.8, -165.5);
        ctx.quadraticCurveTo(0, -157.5, 4.8, -165.5);
      }
      ctx.stroke();
      return;
    }
    // open D / U (gently curved top, round bottom, about as tall as wide: gh ≈16 × 16); happy / sing grow to the
    // cover's "ah" (≈21 × 19) when belting
    const big = f === "happy" || f === "sing" ? smooth((m - 0.5) / 0.35) : 0;
    const top = -170 - big;
    const w = lerp(5, 9.4, smooth(m / 0.7)) + 2.2 * big, d = 6 + 16 * m;
    const round = smooth((m - 0.7) / 0.3) * (1 - big * 0.7);
    const tcy = top + 3 - round * 4.5;
    const pa = new Path2D();
    pa.moveTo(-w, top);
    pa.quadraticCurveTo(0, tcy, w, top);
    pa.bezierCurveTo(w + 0.9, top + d * 0.78, w * 0.62, top + d, 0, top + d);
    pa.bezierCurveTo(-w * 0.62, top + d, -w - 0.9, top + d * 0.78, -w, top);
    pa.closePath();
    ctx.save();
    if (f === "smug") {
      ctx.translate(2, -166);
      ctx.rotate(-0.2);
      ctx.translate(-2, 166);
    }
    openShape(pa, m < 0.3 ? PAL.mouthIn2 : PAL.mouthIn, top + d * 1.02, w * 0.8, d * 0.46);
    ctx.restore();
  }
  function curtains(ctx, lw) {
    fillP(ctx, CURT.body, PAL.hairTop);
    fillP(ctx, CURT.sep, A_.curtSep);
    if (lw < FINE) strokeP(ctx, CURT.lines, PAL.hairLine, lw * 0.45);
    strokeP(ctx, CURT.skin, PAL.bangEdge, lw * 0.7);
    strokeP(ctx, CURT.out, PAL.ink, lw);
  }
  function bangs(ctx, lw) {
    const G = BANGS;
    // slightly lighter at the crown, deeper toward the face (gh)
    const g = ctx.createLinearGradient(0, -300, 0, -212);
    g.addColorStop(0, PAL.hairMid);
    g.addColorStop(1, A_.bangLow);
    fillP(ctx, G.bp, g);
    fillP(ctx, G.shade, A_.gapShade);
    // small figures: the ring is softer so it never pops out as an emblem
    fillP(ctx, G.shine, lw < FINE ? PAL.hairShine : A_.shineSoft);
    if (lw < FINE) {
      fillP(ctx, G.hi, PAL.hairShineHi);
      strokeP(ctx, G.fine, A_.fineStrand, lw * 0.42);
    }
    strokeP(ctx, G.ink, PAL.bangEdge, lw * 0.7);
  }
  // ahoge: a single hair curl (8.5 at its thickest, gh), both ends tapered, curl tip hanging down-left
  const AHOGE_PTS = (() => {
    const a = cub([-4, -318], [-6, -350], [-24, -366], [-44, -363], 9);
    return cub([-44, -363], [-60, -360], [-69, -348], [-70, -331], 8, a);
  })();
  const ahogeW = (u) => (u < 0.45 ? lerp(4, 8.5, smooth(u / 0.45)) : 8.5 * Math.pow(1 - (u - 0.45) / 0.55, 0.85));
  function ahoge(ctx, p, lw) {
    const a = clamp(p.ahoge || 0, -1.5, 1.5) * 0.3;
    let pts = AHOGE_PTS;
    if (a) {
      const pv = AHOGE_PTS[8], c = Math.cos(a), s = Math.sin(a);
      pts = AHOGE_PTS.map((q, i) => {
        if (i <= 8) return q;
        const k = Math.min(1, (i - 8) / 4), dx = q[0] - pv[0], dy = q[1] - pv[1];
        const r = [pv[0] + dx * c - dy * s, pv[1] + dx * s + dy * c];
        return [lerp(q[0], r[0], k), lerp(q[1], r[1], k)];
      });
    }
    const R = ribbon(pts, ahogeW);
    inkFill(ctx, PAL.hairTop, lw * 0.9, R.path);
    const sh = new Path2D();
    smoothTo(sh, pts.slice(4, 9).map((q, i) => [lerp(q[0], R.B[i + 4][0], 0.4), lerp(q[1], R.B[i + 4][1], 0.4)]), true);
    strokeP(ctx, sh, PAL.hairShine, lw * 0.6);
  }
  // headdress: 10 box-pleat lobes, lavender inner third, ink-outlined white band, tilted ~4° clockwise (gh)
  const RUFFLE = (() => {
    const cy = -250, t0 = Math.PI * 0.985, t1 = Math.PI * 2.02, N = 8, dt = (t1 - t0) / N;
    const KL = [1, 0.978, 1.018, 0.986, 1.012, 0.972, 1.008, 0.99]; // per-lobe size (uneven, hand-made look)
    const E = (rx, ry, t) => [Math.cos(t) * rx, cy + Math.sin(t) * ry];
    const pa = new Path2D();
    let q = E(90, 64, t0);
    pa.moveTo(q[0], q[1]);
    let k0 = E(103, 72, t0 - 0.07);
    q = E(100, 85, t0);
    pa.quadraticCurveTo(k0[0], k0[1], q[0], q[1]);
    for (let i = 0; i < N; i++) {
      const ta = t0 + dt * i, tb = ta + dt;
      const k = KL[i], c1 = E(100 + 9.5 * k * k, 85 + 13 * k * k, ta + dt * 0.03), c2 = E(100 + 9.5 * k * k, 85 + 13 * k * k, tb - dt * 0.03), e = E(100, 85, tb);
      pa.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], e[0], e[1]);
    }
    q = E(90, 64, t1);
    k0 = E(103, 72, t1 + 0.07);
    pa.quadraticCurveTo(k0[0], k0[1], q[0], q[1]);
    pa.ellipse(0, cy, 90, 64, 0, t1, t0, true);
    pa.closePath();
    const inner = new Path2D();
    inner.ellipse(0, cy, 97, 75, 0, t0, t1);
    inner.ellipse(0, cy, 90, 64, 0, t1, t0, true);
    inner.closePath();
    for (let i = 1; i < N; i++) {
      const t = t0 + dt * i;
      const a = E(96.5, 73, t - dt * 0.2), b = E(100.5, 86, t), c = E(96.5, 73, t + dt * 0.2), k = E(103.5, 90, t);
      inner.moveTo(a[0], a[1]);
      inner.quadraticCurveTo(k[0], k[1], b[0], b[1]);
      inner.quadraticCurveTo(k[0], k[1], c[0], c[1]);
      inner.closePath();
    }
    const band = new Path2D();
    band.ellipse(0, cy, 95.5, 70.5, 0, t0, t1);
    band.ellipse(0, cy, 90, 64, 0, t1, t0, true);
    band.closePath();
    const pleats = new Path2D();
    for (let i = 0; i < N; i++) {
      for (const f of [0.28 + (i % 3) * 0.04, 0.68 - (i % 2) * 0.05]) {
        const t = t0 + dt * (i + f);
        const a = E(99, 78, t), b = E(102 + KL[i] * 1.5, 86.5 + KL[i] * 3, t);
        pleats.moveTo(a[0], a[1]);
        pleats.lineTo(b[0], b[1]);
      }
    }
    const bandLine = new Path2D();
    bandLine.ellipse(0, cy, 92.8, 67.3, 0, t0 + 0.03, t1 - 0.03);
    return { pa, inner, band, pleats, bandLine };
  })();
  const RUFFLE_TILT = 4 * D2R;
  function ruffle(ctx, lw) {
    const R = RUFFLE;
    ctx.save();
    ctx.translate(0, -250);
    ctx.rotate(RUFFLE_TILT);
    ctx.translate(0, 250);
    fillP(ctx, R.pa, PAL.white);
    fillP(ctx, R.inner, PAL.whiteShade);
    strokeP(ctx, R.pa, PAL.ink, lw * 0.9);
    fillP(ctx, R.band, PAL.white);
    if (lw < TEX) strokeP(ctx, R.pleats, PAL.whiteShade, lw * 0.4);
    if (lw < FINE) strokeP(ctx, R.bandLine, PAL.whiteShade, lw * 0.35);
    strokeP(ctx, R.band, PAL.ink, lw * 0.6);
    // head bow on the screen-right end of the band, above the right fin root
    ctx.translate(104, -242);
    ctx.rotate(-22 * D2R);
    CAST.bow(ctx, 0, 0, 0.9, PAL.bow, lw, true);
    ctx.restore();
  }
  function head(ctx, p, lw) {
    const tilt = p.headTilt || 0;
    ctx.save();
    if (tilt) {
      ctx.translate(0, -146);
      ctx.rotate(tilt);
      ctx.translate(0, 146);
    }
    const f = p.face || "open";
    fins(ctx, p, lw);
    faceSkin(ctx, p, lw);
    blush(ctx, p, lw);
    eyes(ctx, p, lw);
    const bp = browPath(p);
    fillP(ctx, bp, A_.brow);
    mouth(ctx, p, lw);
    curtains(ctx, lw);
    bangs(ctx, lw);
    fillP(ctx, bp, A_.browHair);
    if (f === "shock") {
      ctx.strokeStyle = A_.shockLines;
      ctx.lineWidth = Math.max(0.8, lw * 0.4);
      ctx.beginPath();
      for (const x of [22, 29, 36]) {
        ctx.moveTo(x, -241 + (x - 22) * 0.25);
        ctx.lineTo(x, -226);
      }
      ctx.stroke();
    }
    ahoge(ctx, p, lw);
    ruffle(ctx, lw);
    if (p.sweat) {
      ctx.save();
      ctx.globalAlpha *= clamp(p.sweat);
      ctx.beginPath();
      ctx.moveTo(74, -246);
      ctx.quadraticCurveTo(65, -229, 74, -225);
      ctx.quadraticCurveTo(83, -229, 74, -246);
      inkFill(ctx, PAL.tear, lw * 0.6);
      ctx.fillStyle = "#fff";
      L.ellipse(ctx, 71.5, -231, 1.3, 2.2, 0.3);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  /* ================= opt-in rim halo (one wide-stroke pass on the dark-navy silhouette parts) ================= */
  function rimPass(ctx, p, lw, s, rim, TG, Lg, skf) {
    const R = (1.0 + 0.9 * s) / s * Math.min(1.5, rim);
    ctx.save();
    ctx.strokeStyle = `rgba(168,198,255,${Math.min(0.6, 0.3 * rim)})`;
    ctx.lineWidth = lw * 2 + R * 2;
    ctx.stroke(TG.body);
    ctx.lineWidth = lw + R * 2;
    const PG = skf ? petticoatGeom(skf) : PETTI_STATIC || (PETTI_STATIC = petticoatGeom(null));
    ctx.stroke(PG.pt);
    ctx.stroke(path(SKIRT, 1, skf));
    for (const g of Lg) {
      ctx.save();
      legFrame(ctx, g);
      shoeFrame(ctx, g);
      ctx.stroke(path(SHOE));
      ctx.restore();
    }
    const tilt = p.headTilt || 0;
    if (tilt) {
      ctx.translate(0, -146);
      ctx.rotate(tilt);
      ctx.translate(0, 146);
    }
    const F = p.ears ? finPaths(p.ears) : FIN_STATIC || (FIN_STATIC = finPaths(0));
    ctx.stroke(F[2]);
    ctx.stroke(F[0]);
    ctx.restore();
  }

  /* ================= PUBLIC HELPERS ================= */
  /** ribbon bow. s=1 → ~54 wide. shortTails (optional 7th arg) = two tiny stubs instead of long ribbon tails */
  const BOW = (() => {
    const tails = [new Path2D(), new Path2D()], loops = new Path2D(), shade = new Path2D(), crease = new Path2D();
    for (const sx of [-1, 1]) {
      const t = tails[0];
      t.moveTo(sx * 2, 2);
      t.bezierCurveTo(sx * 6, 8, sx * 9, 16, sx * 12, 24);
      t.lineTo(sx * 7.5, 21);
      t.lineTo(sx * 4.5, 24.5);
      t.bezierCurveTo(sx * 4, 16, sx * 2, 9, -sx * 1, 4);
      t.closePath();
      const u = tails[1];
      u.moveTo(sx * 2, 3);
      u.quadraticCurveTo(sx * 6, 8, sx * 8.5, 13);
      u.lineTo(sx * 4.5, 12.5);
      u.quadraticCurveTo(sx * 3, 8, -sx * 0.5, 5);
      u.closePath();
      loops.moveTo(0, 0);
      loops.bezierCurveTo(sx * 6, -15, sx * 26, -19, sx * 27, -5);
      loops.bezierCurveTo(sx * 28, 8, sx * 12, 11, 0, 0);
      loops.closePath();
      shade.moveTo(sx * 3, 0);
      shade.bezierCurveTo(sx * 10, 5, sx * 22, 6, sx * 26, -2);
      shade.bezierCurveTo(sx * 25, 5, sx * 12, 8, sx * 3, 0);
      shade.closePath();
      crease.moveTo(sx * 5, -2);
      crease.quadraticCurveTo(sx * 12, -8, sx * 18, -8);
      crease.moveTo(sx * 6, 1);
      crease.quadraticCurveTo(sx * 12, 2, sx * 17, 0);
    }
    const knot = trace(new Path2D(), ["M", -1.5, -6.5, "L", 1.5, -6.5, "Q", 5.5, -6.5, 5.5, -2.5, "L", 5.5, 2.5, "Q", 5.5, 6.5, 1.5, 6.5, "L", -1.5, 6.5, "Q", -5.5, 6.5, -5.5, 2.5, "L", -5.5, -2.5, "Q", -5.5, -6.5, -1.5, -6.5, "Z"]);
    const knotCrease = trace(new Path2D(), ["M", -1.5, -4, "Q", 0.5, 0, -1.5, 4]);
    return { tails, loops, shade, crease, knot, knotCrease };
  })();
  /** ribbon bow. s=1 → ~54 wide. shortTails (optional 7th arg) = two tiny stubs instead of long ribbon tails */
  CAST.bow = (ctx, x, y, s, col, lw, shortTails) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const l = lw / s;
    ctx.lineJoin = "round";
    inkFill(ctx, col, l * 0.9, BOW.tails[shortTails ? 1 : 0]);
    inkFill(ctx, col, l, BOW.loops);
    fillP(ctx, BOW.shade, A_.bowSh);
    strokeP(ctx, BOW.crease, A_.bowCr, l * 0.45);
    inkFill(ctx, col, l, BOW.knot);
    strokeP(ctx, BOW.knotCrease, A_.bowCr, l * 0.45);
    ctx.restore();
  };

  /** cute whale emblem (apron badge, UI avatar, logos). s=1 → ~60px wide (unchanged from v1) */
  CAST.whaleIcon = (ctx, x, y, s = 1, col = P.dress, spout = true) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-30, 4);
    ctx.bezierCurveTo(-30, -16, -6, -22, 10, -14);
    ctx.bezierCurveTo(22, -8, 24, 4, 20, 10);
    ctx.bezierCurveTo(26, 8, 32, 0, 34, -10);
    ctx.bezierCurveTo(40, -4, 38, 8, 30, 12);
    ctx.bezierCurveTo(22, 20, -10, 22, -24, 16);
    ctx.bezierCurveTo(-30, 13, -30, 8, -30, 4);
    ctx.fill();
    ctx.fillStyle = "#fff";
    L.circle(ctx, -16, -4, 2.6);
    ctx.fill();
    if (spout) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-6, -22);
      ctx.lineTo(-6, -32);
      ctx.moveTo(-6, -30);
      ctx.quadraticCurveTo(-14, -38, -18, -32);
      ctx.moveTo(-6, -30);
      ctx.quadraticCurveTo(2, -38, 6, -32);
      ctx.stroke();
    }
    ctx.restore();
  };

  /** hand props. ang = forearm direction; aim (optional) = axis the prop points along (mic → mouth, phone → ear) */
  CAST.prop = (ctx, kind, x, y, ang, side, lw, layer, aim) => {
    const lean = ang + Math.PI / 2;
    if (kind === "mic") {
      drawMic(ctx, x, y, aim !== undefined ? aim : -Math.PI / 2 + lean * 0.35 + side * 0.15, lw, layer);
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    if (kind === "phone") {
      if (aim !== undefined) {
        ctx.rotate(aim + Math.PI / 2);
        ctx.translate(0, -9); // the earpiece end reaches up to the ear
      } else ctx.rotate(lean * 0.3);
      if (layer === "front") {
        ctx.beginPath();
        ctx.moveTo(-7, -31);
        ctx.quadraticCurveTo(-12, 0, -7, 31);
        ctx.lineTo(4, 31);
        ctx.quadraticCurveTo(-1, 0, 4, -31);
        ctx.closePath();
        inkFill(ctx, P.pink, lw * 0.75);
        for (const yy of [-31, 31]) {
          L.ellipse(ctx, -3.5, yy, 11, 7.5);
          inkFill(ctx, P.pink, lw * 0.75);
        }
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        L.ellipse(ctx, -7, -33, 3.6, 2);
        ctx.fill();
      }
    } else if (kind === "pen") {
      ctx.rotate(lean * 0.4 - side * 0.5);
      if (layer === "front") {
        L.rr(ctx, -5, -52, 10, 58, 4);
        inkFill(ctx, P.json, lw * 0.8);
        ctx.beginPath();
        ctx.moveTo(-5, 6);
        ctx.lineTo(0, 18);
        ctx.lineTo(5, 6);
        inkFill(ctx, PAL.ink, lw * 0.6);
      }
    } else if (kind === "glass") {
      ctx.rotate(lean * 0.15 + side * 0.25);
      if (layer === "front") {
        ctx.beginPath();
        ctx.moveTo(-14, -50);
        ctx.quadraticCurveTo(-16, -22, 0, -18);
        ctx.quadraticCurveTo(16, -22, 14, -50);
        ctx.closePath();
        ctx.fillStyle = L.rgba("#e8f4ff", 0.35);
        ctx.fill();
        ctx.save();
        ctx.clip();
        ctx.fillStyle = "#b0305e";
        ctx.fillRect(-16, -38, 32, 22);
        ctx.restore();
        ctx.strokeStyle = PAL.ink;
        ctx.lineWidth = lw * 0.7;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(0, 4);
        ctx.moveTo(-10, 6);
        ctx.lineTo(10, 6);
        ctx.stroke();
      }
    } else if (kind === "wrench") {
      ctx.rotate(lean * 0.4);
      if (layer === "front") CAST.wrench(ctx, 0, -26, 0.8, lw);
    } else if (kind === "bottle") {
      ctx.rotate(lean * 0.3 + 0.9 * side);
      if (layer === "front") {
        L.rr(ctx, -10, -40, 20, 44, 6);
        inkFill(ctx, "#3a1030", lw * 0.8);
        L.rr(ctx, -4, -58, 8, 20, 3);
        inkFill(ctx, "#3a1030", lw * 0.8);
        L.rr(ctx, -9, -26, 18, 14, 2);
        ctx.fillStyle = P.amber;
        ctx.fill();
      }
    }
    ctx.restore();
  };

  CAST.wrench = (ctx, x, y, s, lw = 3) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-6, 34);
    ctx.lineTo(-6, -10);
    ctx.bezierCurveTo(-22, -14, -24, -36, -12, -44);
    ctx.lineTo(-8, -30);
    ctx.lineTo(8, -30);
    ctx.lineTo(12, -44);
    ctx.bezierCurveTo(24, -36, 22, -14, 6, -10);
    ctx.lineTo(6, 34);
    ctx.quadraticCurveTo(0, 40, -6, 34);
    ctx.closePath();
    inkFill(ctx, "#c9d4ee", lw / s);
    ctx.restore();
  };

  /* ================= THE RIG ================= */
  CAST.fish = (ctx, p) => {
    const s = p.s || 1, sq = p.sq || 1;
    const AL = armSolve(p, -1), AR = armSolve(p, 1);
    const T = xform(p);
    const hand = (A) => T.pt(A.hd[0], A.hd[1]);
    const out = { l: hand(AL), r: hand(AR), head: T.hp(0, -232), mouth: T.hp(0, -163) };
    const alpha = p.alpha === undefined ? 1 : p.alpha;
    if (alpha <= 0) return out;
    ctx.save();
    ctx.translate(p.x || 0, (p.y || 0) + (p.dy || 0) * s);
    if (p.rot) ctx.rotate(p.rot);
    ctx.scale(s * sq * (p.flip ? -1 : 1), s / sq);
    if (alpha < 1) ctx.globalAlpha *= alpha;
    const lw = (1.6 + 1.0 * s) / s;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const tilt = p.headTilt || 0;
    const Lg = [legSolve(p, -1), legSolve(p, 1)];
    const skf = skirtMap(p, Lg);
    const TG = tailGeom(p);
    const hg = hairGrad(ctx);
    if (p.rim > 0) rimPass(ctx, p, lw, s, p.rim, TG, Lg, skf);
    tail(ctx, p, lw, TG);
    backHair(ctx, p, lw, hg);
    // standing legs are hidden down to the socks: only the sock + shoe are drawn until the leg kicks out
    drawLeg(ctx, Lg[0], lw, Lg[0].kick > 4 ? "all" : "low");
    drawLeg(ctx, Lg[1], lw, Lg[1].kick > 4 ? "all" : "low");
    petticoat(ctx, p, lw, skf);
    // a kicked leg's sock + shoe come over the petticoat (fades in with the kick, no layer pop)
    for (const g of Lg) {
      if (g.over > 0) {
        ctx.save();
        ctx.globalAlpha *= g.over;
        drawLeg(ctx, g, lw, "low");
        ctx.restore();
      }
    }
    // apron sash bow (behind the right hip: drawn before the skirt so the skirt overlaps its lower loop)
    inkFill(ctx, PAL.white, lw * 0.7, TORSO.sash);
    fillP(ctx, TORSO.sashIn, PAL.whiteShade);
    inkFill(ctx, PAL.white, lw * 0.6, TORSO.sashKnot);
    if (lw < FINE) strokeP(ctx, TORSO.sashFold, PAL.whiteShade, lw * 0.4);
    skirt(ctx, p, lw, skf);
    apron(ctx, p, lw);
    torso(ctx, p, lw);
    frontLocks(ctx, p, lw, hg);
    if (!AL.late) drawArm(ctx, p, AL, lw, tilt);
    if (!AR.late) drawArm(ctx, p, AR, lw, tilt);
    shoulderCaps(ctx, lw);
    head(ctx, p, lw);
    if (AL.late) drawArm(ctx, p, AL, lw, tilt);
    if (AR.late) drawArm(ctx, p, AR, lw, tilt);
    ctx.restore();
    return out;
  };

  /** CAST.joints(pose) → world points for attaching props / effects (no drawing). Same transform + solver as fish. */
  CAST.joints = (p) => {
    const T = xform(p);
    const AL = armSolve(p, -1), AR = armSolve(p, 1);
    const TS = tailSolve(p);
    const lf = finXf(p.ears, -1)(FIN_TIP[0], FIN_TIP[1]), rf = finXf(p.ears, 1)(FIN_TIP[0], FIN_TIP[1]);
    return {
      lShoulder: T.pt(AL.sh[0], AL.sh[1]),
      rShoulder: T.pt(AR.sh[0], AR.sh[1]),
      lElbow: T.pt(AL.el[0], AL.el[1]),
      rElbow: T.pt(AR.el[0], AR.el[1]),
      lHand: T.pt(AL.hd[0], AL.hd[1]),
      rHand: T.pt(AR.hd[0], AR.hd[1]),
      lHandAng: T.ang(AL.ang),
      rHandAng: T.ang(AR.ang),
      head: T.hp(0, -232),
      headTop: T.hp(0, -314),
      chin: T.hp(0, -146),
      mouth: T.hp(0, -163),
      lFin: T.hp(lf[0], lf[1]),
      rFin: T.hp(rf[0], rf[1]),
      tailBase: T.pt(TAIL_BASE[0], TAIL_BASE[1]),
      tailTip: (() => {
        const F = flukeFrame(TS);
        return T.pt(F.a * FLUKE_C[0] + F.c * FLUKE_C[1] + F.e, F.b * FLUKE_C[0] + F.d * FLUKE_C[1] + F.f);
      })(),
      feet: T.pt(0, 0),
    };
  };

  /* ================= ready-made moves (beat-driven; v1 numbers, unchanged) ================= */
  CAST.groove = (t, style = "swing", amt = 1) => {
    const sw = L.sway(t, 2), pu = L.pulse(t, 6), hop = L.hop(t), bob = L.bob(t);
    const blinkCycle = (t * 0.37) % 1;
    const blink = blinkCycle > 0.96 ? Math.sin(((blinkCycle - 0.96) / 0.04) * Math.PI) : 0;
    const base = {
      blink,
      hair: sw * 0.8 * amt,
      tail: sw * 18 * amt,
      ears: -pu * 10 * amt,
      sq: 1 + pu * 0.05 * amt,
      rot: sw * 0.05 * amt,
      ahoge: sw,
    };
    if (style === "idle") return { ...base, rot: sw * 0.02, lArm: 12, rArm: 12, lBend: 20, rBend: 20 };
    if (style === "sing")
      return {
        ...base,
        face: "sing",
        mouth: 0.35 + 0.5 * Math.abs(Math.sin(L.bp(t) * Math.PI)),
        lArm: 32, lBend: 135, lHold: "mic",
        rArm: 70 + sw * 25 * amt, rBend: 20 + pu * 20,
      };
    if (style === "hop") return { ...base, dy: -hop * 40 * amt, legL: hop * 30, legR: hop * 30, lArm: 150 + sw * 10, rArm: 150 - sw * 10, lBend: 10, rBend: 10 };
    if (style === "strut") return { ...base, legL: Math.max(0, sw) * 35 * amt, legR: Math.max(0, -sw) * 35 * amt, lArm: 20 + sw * 25, rArm: 20 - sw * 25, lBend: 40, rBend: 40, dy: -bob * 10 };
    if (style === "point") return { ...base, rArm: 125, rBend: -10, lArm: 25, lBend: 90 };
    return { ...base, lArm: 55 + sw * 30 * amt, rArm: 55 - sw * 30 * amt, lBend: 60, rBend: 60, legL: Math.max(0, sw) * 18 * amt, legR: Math.max(0, -sw) * 18 * amt, dy: -bob * 12 * amt };
  };
})();
