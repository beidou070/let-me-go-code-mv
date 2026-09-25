/* CAST — the on-model chibi 大肥鱼 (DeepSeek whale-girl maid) rig.
 *
 * CAST.fish(ctx, pose) draws her with feet on (pose.x, pose.y). At s=1 she is ~360px tall
 * (head top ≈ y-318, ahoge ≈ y-362). Hero close-ups: s 2–3.2. Background: s 0.3–0.6.
 *
 * pose = {
 *   x, y, s=1, flip=false, rot=0 (rad, around feet), sq=1 (>1 squash wide, <1 stretch tall),
 *   face: 'open'|'happy'|'sing'|'wink'|'shock'|'smug'|'sleepy'|'determined'|'dizzy'|'cry',
 *   mouth: 0..1 open amount (0 = closed smile), blink: 0..1, look: [dx,dy] in -1..1,
 *   headTilt: rad, blush: 0..1.5 (default 1), sparkle: bool (star-highlight eyes),
 *   lArm/rArm: deg (SCREEN-left / SCREEN-right arm). 0 = hanging down, 90 = straight out sideways,
 *              180 = straight up, negative = swung across the body.
 *   lBend/rBend: deg elbow bend, positive curls the forearm toward the body centre (e.g. 120 brings a hand to the chin).
 *   lHold/rHold: 'mic'|'phone'|'pen'|'glass'|'wrench'|'bottle'|null  (prop drawn in that hand)
 *   legL/legR: deg outward from straight down (kicks: 40–70), knee lift is faked by pose.y.
 *   tail: deg wag offset, ears: deg fin flap offset, hair: -1..1 sway of hair tips,
 *   sweat: 0..1 (anime sweat drop), apronLogo: true
 * }
 * Everything is pure: pass time-derived values in, get pixels out.
 */
(function () {
  const L = window.LIB, P = L.P;
  const CAST = (window.CAST = {});
  const D2R = Math.PI / 180;

  /* ---------- small path helpers ---------- */
  // tapered stroke along sampled points -> filled polygon
  function taperPath(ctx, pts, w0, w1) {
    const n = pts.length, left = [], right = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const w = L.lerp(w0, w1, i / (n - 1)) / 2;
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
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  CAST.taperPath = taperPath;
  CAST.bez = bez;

  function inkFill(ctx, fill, lw) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = lw;
    ctx.strokeStyle = P.ink;
    ctx.stroke();
  }

  /* ---------- hair gradient ---------- */
  function hairGrad(ctx, y0, y1) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, P.hairTop);
    g.addColorStop(0.45, P.hairMid);
    g.addColorStop(1, P.hairTip);
    return g;
  }

  /* ---------- parts ---------- */
  function backHair(ctx, p, lw) {
    const sw = p.hair || 0;
    // wave offset grows toward the tips so hair swings from the crown
    const W = (x, y) => [x + sw * 24 * L.clamp((y + 210) / 210), y];
    // right-side outline, crown -> tips (mirrored for the left)
    const S0 = [0, -322];
    const segs = [
      ["C", [70, -322], [104, -280], [104, -228]],
      ["C", [104, -196], [126, -188], [120, -156]],
      ["C", [114, -128], [138, -120], [132, -92]],
      ["C", [126, -66], [156, -60], [156, -30]],
      ["Q", [140, -40], [128, -46]],
      ["Q", [132, -22], [124, -2]],
      ["Q", [108, -26], [100, -40]],
      ["Q", [98, -20], [86, -10]],
      ["Q", [76, -30], [62, -46]],
    ];
    ctx.beginPath();
    let q = W(S0[0], S0[1]);
    ctx.moveTo(q[0], q[1]);
    const pts = [S0];
    for (const g of segs) {
      const a = g.slice(1).map((v) => W(v[0], v[1]));
      g[0] === "C" ? ctx.bezierCurveTo(a[0][0], a[0][1], a[1][0], a[1][1], a[2][0], a[2][1]) : ctx.quadraticCurveTo(a[0][0], a[0][1], a[1][0], a[1][1]);
      pts.push(g[g.length - 1]);
    }
    // left side: walk the same segments backwards, mirrored
    const M = (v) => W(-v[0], v[1]);
    let e = M(segs[segs.length - 1][segs[segs.length - 1].length - 1]);
    ctx.lineTo(e[0], e[1]);
    for (let i = segs.length - 1; i >= 0; i--) {
      const g = segs[i], from = pts[i];
      if (g[0] === "C") {
        const c1 = M(g[2]), c2 = M(g[1]), to = M(from);
        ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], to[0], to[1]);
      } else {
        const c = M(g[1]), to = M(from);
        ctx.quadraticCurveTo(c[0], c[1], to[0], to[1]);
      }
    }
    ctx.closePath();
    inkFill(ctx, hairGrad(ctx, -320, -10), lw);
    // inner wave strands
    ctx.save();
    ctx.strokeStyle = L.rgba(P.ink, 0.4);
    ctx.lineWidth = lw * 0.6;
    for (const sgn of [-1, 1]) {
      for (const [x0, x1] of [[92, 118], [104, 138]]) {
        const a = W(sgn * x0, -200), b = W(sgn * (x0 + 18), -150), c = W(sgn * (x1 - 10), -110), d = W(sgn * x1, -54);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.bezierCurveTo(b[0], b[1], c[0], c[1], d[0], d[1]);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function tail(ctx, p, lw) {
    const wag = (p.tail || 0) * D2R;
    ctx.save();
    ctx.translate(14, -92);
    ctx.rotate(wag * 0.45);
    const p0 = [0, 0], p1 = [66, 58], p2 = [128, 44];
    const e = rot(150, -16, wag * 0.7);
    const p3 = [e[0], e[1]];
    const pts = [];
    for (let i = 0; i <= 18; i++) pts.push(bez(p0, p1, p2, p3, i / 18));
    const sides = taperPath(ctx, pts, 46, 18);
    inkFill(ctx, P.fin, lw);
    // pale belly stripe with grooves (underside of the curve)
    ctx.save();
    ctx.beginPath();
    const belly = [], inner = [];
    for (let i = 4; i <= 17; i++) {
      belly.push(sides.left[i]);
      inner.push([L.lerp(sides.left[i][0], pts[i][0], 0.6), L.lerp(sides.left[i][1], pts[i][1], 0.6)]);
    }
    ctx.moveTo(belly[0][0], belly[0][1]);
    for (const v of belly) ctx.lineTo(v[0], v[1]);
    for (let i = inner.length - 1; i >= 0; i--) ctx.lineTo(inner[i][0], inner[i][1]);
    ctx.closePath();
    ctx.fillStyle = P.finLight;
    ctx.fill();
    ctx.strokeStyle = L.rgba(P.ink, 0.35);
    ctx.lineWidth = lw * 0.45;
    for (let i = 6; i < 17; i += 3) {
      ctx.beginPath();
      ctx.moveTo(sides.left[i][0], sides.left[i][1]);
      ctx.lineTo(L.lerp(sides.left[i][0], pts[i][0], 0.55), L.lerp(sides.left[i][1], pts[i][1], 0.55));
      ctx.stroke();
    }
    ctx.restore();
    // flukes: two swept-back lobes, spread across the tail tip
    const end = pts[pts.length - 1], prev = pts[pts.length - 4];
    const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]) + wag * 0.9;
    ctx.save();
    ctx.translate(end[0], end[1]);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.bezierCurveTo(0, -18, 20, -50, 42, -58);
    ctx.bezierCurveTo(52, -40, 44, -16, 30, -5);
    ctx.quadraticCurveTo(22, 0, 30, 5);
    ctx.bezierCurveTo(44, 16, 52, 40, 42, 58);
    ctx.bezierCurveTo(20, 50, 0, 18, -8, 0);
    ctx.closePath();
    inkFill(ctx, P.fin, lw);
    ctx.beginPath();
    ctx.moveTo(2, 6);
    ctx.bezierCurveTo(16, 18, 30, 34, 38, 48);
    ctx.moveTo(2, -6);
    ctx.bezierCurveTo(16, -18, 30, -34, 38, -48);
    ctx.strokeStyle = L.rgba(P.finLight, 0.85);
    ctx.lineWidth = lw * 1.1;
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  function legs(ctx, p, lw) {
    const legOne = (side, deg) => {
      ctx.save();
      ctx.translate(side * 13, -58);
      ctx.rotate(-side * deg * D2R);
      // stocking
      L.rr(ctx, -9, 0, 18, 46, 8);
      inkFill(ctx, P.white, lw * 0.9);
      // navy band at top of thigh-high
      ctx.fillStyle = P.dress;
      ctx.fillRect(-8, 6, 16, 5);
      // shoe
      ctx.beginPath();
      ctx.moveTo(-11, 42);
      ctx.quadraticCurveTo(-12, 56, 0, 57);
      ctx.quadraticCurveTo(13 + side * 2, 57, 12, 44);
      ctx.quadraticCurveTo(0, 38, -11, 42);
      inkFill(ctx, P.dress, lw * 0.9);
      ctx.strokeStyle = P.gold;
      ctx.lineWidth = lw * 0.6;
      ctx.beginPath();
      ctx.moveTo(-8, 44);
      ctx.lineTo(9, 44);
      ctx.stroke();
      ctx.restore();
    };
    legOne(-1, p.legL || 0);
    legOne(1, p.legR || 0);
  }

  function skirt(ctx, p, lw) {
    const fl = (p.skirtFlare || 0) * 10;
    // petticoat frill
    ctx.beginPath();
    ctx.moveTo(-68 - fl, -64);
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const x = L.lerp(-72 - fl, 72 + fl, i / n);
      ctx.quadraticCurveTo(x - 8, -44, x, -52);
    }
    ctx.lineTo(70 + fl, -70);
    ctx.closePath();
    inkFill(ctx, P.white, lw * 0.8);
    // navy bell skirt
    ctx.beginPath();
    ctx.moveTo(-34, -122);
    ctx.bezierCurveTo(-48, -104, -64 - fl, -84, -74 - fl, -60);
    ctx.quadraticCurveTo(0, -48, 74 + fl, -60);
    ctx.bezierCurveTo(64 + fl, -84, 48, -104, 34, -122);
    ctx.closePath();
    inkFill(ctx, P.dress, lw);
    // gold embroidery hem + folds
    ctx.strokeStyle = P.gold;
    ctx.lineWidth = lw * 0.6;
    ctx.beginPath();
    ctx.moveTo(-66 - fl, -66);
    ctx.quadraticCurveTo(0, -56, 66 + fl, -66);
    ctx.stroke();
    ctx.strokeStyle = L.rgba(P.ink, 0.5);
    ctx.lineWidth = lw * 0.5;
    for (const x of [-44, 44]) {
      ctx.beginPath();
      ctx.moveTo(x * 0.55, -110);
      ctx.quadraticCurveTo(x * 0.9, -88, x * 1.25, -62);
      ctx.stroke();
    }
    // little gold bows on skirt
    for (const x of [-52, 52]) {
      ctx.fillStyle = P.gold;
      L.ellipse(ctx, x - 4, -72, 4, 3, 0.4);
      ctx.fill();
      L.ellipse(ctx, x + 4, -72, 4, 3, -0.4);
      ctx.fill();
    }
  }

  function apron(ctx, p, lw) {
    ctx.beginPath();
    ctx.moveTo(-24, -118);
    ctx.bezierCurveTo(-30, -100, -40, -84, -42, -70);
    const n = 7;
    for (let i = 0; i <= n; i++) {
      const x = L.lerp(-42, 42, i / n);
      const y = -66 + Math.sin((i / n) * Math.PI) * 6;
      ctx.quadraticCurveTo(x - 6, y + 9, x, y);
    }
    ctx.bezierCurveTo(40, -84, 30, -100, 24, -118);
    ctx.closePath();
    inkFill(ctx, P.white, lw * 0.9);
    ctx.strokeStyle = L.rgba(P.whiteShade, 1);
    ctx.lineWidth = lw * 0.6;
    ctx.beginPath();
    ctx.moveTo(-8, -110);
    ctx.quadraticCurveTo(-14, -90, -20, -72);
    ctx.stroke();
    if (p.apronLogo !== false) CAST.whaleIcon(ctx, 2, -88, 0.34, P.dress);
  }

  function torso(ctx, p, lw) {
    // bodice
    ctx.beginPath();
    ctx.moveTo(-26, -162);
    ctx.quadraticCurveTo(-30, -140, -24, -118);
    ctx.lineTo(24, -118);
    ctx.quadraticCurveTo(30, -140, 26, -162);
    ctx.quadraticCurveTo(0, -170, -26, -162);
    inkFill(ctx, P.dress, lw);
    // blouse front
    L.rr(ctx, -10, -160, 20, 40, 5);
    inkFill(ctx, P.white, lw * 0.7);
    ctx.fillStyle = P.dress;
    for (const y of [-148, -138, -128]) {
      L.circle(ctx, 0, y, 2.2);
      ctx.fill();
    }
    // waist corset band + gold buttons
    L.rr(ctx, -27, -126, 54, 10, 3);
    inkFill(ctx, P.dressShade, lw * 0.7);
    ctx.fillStyle = P.gold;
    for (const x of [-18, -12, 12, 18]) {
      L.circle(ctx, x, -121, 2);
      ctx.fill();
    }
    // collar + bow + gem
    ctx.beginPath();
    ctx.moveTo(-18, -166);
    ctx.quadraticCurveTo(-10, -156, 0, -160);
    ctx.quadraticCurveTo(10, -156, 18, -166);
    ctx.quadraticCurveTo(0, -172, -18, -166);
    inkFill(ctx, P.white, lw * 0.7);
    CAST.bow(ctx, 0, -159, 0.62, P.dress, lw * 0.8);
    ctx.fillStyle = P.bow;
    L.circle(ctx, 0, -159, 3.2);
    ctx.fill();
    ctx.fillStyle = "#e9f6ff";
    L.circle(ctx, -1, -160, 1.1);
    ctx.fill();
  }

  // returns hand position + direction (for props)
  function arm(ctx, p, side, lw) {
    const up = (side < 0 ? p.lArm : p.rArm) || 0;
    const bend = (side < 0 ? p.lBend : p.rBend) || 0;
    const hold = side < 0 ? p.lHold : p.rHold;
    const sh = [side * 27, -157];
    const dir = (deg) => [side * Math.sin(deg * D2R), Math.cos(deg * D2R)];
    const d1 = dir(up), d2 = dir(up - bend);
    const el = [sh[0] + d1[0] * 36, sh[1] + d1[1] * 36];
    const hd = [el[0] + d2[0] * 33, el[1] + d2[1] * 33];
    // sleeve (puffy upper + slimmer forearm)
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const drawLimb = (w, col) => {
      ctx.beginPath();
      ctx.moveTo(sh[0], sh[1]);
      ctx.lineTo(el[0], el[1]);
      ctx.lineTo(hd[0] - d2[0] * 6, hd[1] - d2[1] * 6);
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.stroke();
    };
    drawLimb(24 + lw * 2, P.ink);
    drawLimb(24, P.dress);
    // puff highlight
    ctx.fillStyle = L.rgba("#5a6fb8", 0.5);
    L.circle(ctx, sh[0] + d1[0] * 8 - side * 3, sh[1] + d1[1] * 8, 6);
    ctx.fill();
    // cuff
    const cf = [hd[0] - d2[0] * 8, hd[1] - d2[1] * 8];
    ctx.save();
    ctx.translate(cf[0], cf[1]);
    ctx.rotate(Math.atan2(d2[1], d2[0]) - Math.PI / 2);
    L.rr(ctx, -14, -5, 28, 10, 4);
    inkFill(ctx, P.white, lw * 0.7);
    ctx.strokeStyle = P.gold;
    ctx.lineWidth = lw * 0.5;
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(12, -2);
    ctx.stroke();
    ctx.restore();
    const handAng = Math.atan2(d2[1], d2[0]);
    // prop behind hand
    if (hold) CAST.prop(ctx, hold, hd[0], hd[1], handAng, side, lw, "back");
    // hand
    L.circle(ctx, hd[0], hd[1], 12);
    inkFill(ctx, P.skin, lw * 0.8);
    if (hold) CAST.prop(ctx, hold, hd[0], hd[1], handAng, side, lw, "front");
    return { x: hd[0], y: hd[1], ang: handAng };
  }

  function face(ctx, p, lw) {
    // skin
    ctx.beginPath();
    ctx.moveTo(-70, -246);
    ctx.bezierCurveTo(-72, -210, -60, -182, -34, -170);
    ctx.quadraticCurveTo(0, -156, 34, -170);
    ctx.bezierCurveTo(60, -182, 72, -210, 70, -246);
    ctx.closePath();
    ctx.fillStyle = P.skin;
    ctx.fill();
    ctx.lineWidth = lw;
    ctx.strokeStyle = P.ink;
    ctx.beginPath();
    ctx.moveTo(-70, -230);
    ctx.bezierCurveTo(-68, -204, -58, -182, -34, -170);
    ctx.quadraticCurveTo(0, -156, 34, -170);
    ctx.bezierCurveTo(58, -182, 68, -204, 70, -230);
    ctx.stroke();
    // hair shadow on forehead
    ctx.fillStyle = L.rgba(P.skinShade, 0.8);
    ctx.beginPath();
    ctx.moveTo(-64, -246);
    ctx.quadraticCurveTo(0, -226, 64, -246);
    ctx.lineTo(64, -250);
    ctx.lineTo(-64, -250);
    ctx.fill();
    // blush
    const bl = p.blush === undefined ? 1 : p.blush;
    if (bl > 0) {
      for (const sx of [-1, 1]) {
        const g = ctx.createRadialGradient(sx * 44, -192, 0, sx * 44, -192, 16);
        g.addColorStop(0, L.rgba(P.blush, 0.75 * Math.min(1, bl)));
        g.addColorStop(1, L.rgba(P.blush, 0));
        ctx.fillStyle = g;
        L.ellipse(ctx, sx * 44, -192, 18, 10);
        ctx.fill();
        if (bl > 1) {
          ctx.strokeStyle = L.rgba(P.mouth, 0.5 * (bl - 1) * 2);
          ctx.lineWidth = lw * 0.5;
          for (let k = -1; k <= 1; k++) {
            ctx.beginPath();
            ctx.moveTo(sx * 44 + k * 6 - 2, -188);
            ctx.lineTo(sx * 44 + k * 6 + 2, -196);
            ctx.stroke();
          }
        }
      }
    }
    eyes(ctx, p, lw);
    mouth(ctx, p, lw);
    if (p.sweat) {
      ctx.save();
      ctx.globalAlpha *= p.sweat;
      ctx.beginPath();
      ctx.moveTo(62, -250);
      ctx.quadraticCurveTo(52, -226, 62, -222);
      ctx.quadraticCurveTo(72, -226, 62, -250);
      inkFill(ctx, "#bfe8ff", lw * 0.6);
      ctx.restore();
    }
  }

  function eyeOpen(ctx, cx, cy, p, lw, open, side) {
    const look = p.look || [0, 0];
    const ry = 19 * open;
    if (open < 0.12) {
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy + 2);
      ctx.quadraticCurveTo(cx, cy + 7, cx + 14, cy + 2);
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = lw * 1.1;
      ctx.stroke();
      return;
    }
    ctx.save();
    // white of eye
    L.ellipse(ctx, cx, cy, 15.5, ry + 1);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.clip();
    // iris
    const ix = cx + look[0] * 4, iy = cy + look[1] * 3 + 1;
    const g = ctx.createLinearGradient(0, iy - 18, 0, iy + 18);
    g.addColorStop(0, "#141d4f");
    g.addColorStop(0.55, "#2f55b4");
    g.addColorStop(1, "#7cc8f5");
    L.ellipse(ctx, ix, iy, 13, 18);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.fillStyle = "#0e1440";
    L.ellipse(ctx, ix, iy - 2, 6, 9);
    ctx.fill();
    if (p.sparkle) {
      L.star(ctx, ix - 1, iy - 3, 9, 3.6, 4, 0);
      ctx.fillStyle = "#fff";
      ctx.fill();
      L.sparkle(ctx, ix + 6, iy + 8, 4, "#fff");
    } else {
      ctx.fillStyle = "#fff";
      L.circle(ctx, ix - 5, iy - 8, 5.2);
      ctx.fill();
      L.circle(ctx, ix + 5, iy + 7, 2.4);
      ctx.fill();
      ctx.fillStyle = L.rgba("#bfe6ff", 0.8);
      L.circle(ctx, ix + 4, iy - 10, 1.8);
      ctx.fill();
    }
    ctx.restore();
    // upper lash line
    ctx.beginPath();
    ctx.moveTo(cx - 17, cy - ry * 0.55);
    ctx.quadraticCurveTo(cx, cy - ry - 5, cx + 17, cy - ry * 0.55);
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = lw * 1.5;
    ctx.stroke();
    // outer flick
    ctx.beginPath();
    const ox = cx + side * 17;
    ctx.moveTo(ox, cy - ry * 0.55);
    ctx.lineTo(ox + side * 5, cy - ry * 0.7);
    ctx.lineWidth = lw * 1.1;
    ctx.stroke();
  }
  function eyeArc(ctx, cx, cy, lw, side) {
    // happy closed ^ with lashes (like the cover)
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy + 4);
    ctx.quadraticCurveTo(cx, cy - 12, cx + 15, cy + 4);
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = lw * 1.4;
    ctx.stroke();
    ctx.lineWidth = lw * 0.9;
    for (let k = 0; k < 3; k++) {
      const x = cx + side * (9 + k * 3.5), y = cy - 1 + k * 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + side * 5, y - 3);
      ctx.stroke();
    }
  }
  function eyes(ctx, p, lw) {
    const f = p.face || "open";
    const blink = p.blink || 0;
    const ey = -210;
    const sides = [[-1, -27], [1, 27]];
    if (f === "happy" || f === "sing") {
      for (const [s, x] of sides) eyeArc(ctx, x, ey, lw, s);
    } else if (f === "wink") {
      eyeOpen(ctx, -27, ey, p, lw, 1, -1); // the open eye never auto-blinks during a wink
      eyeArc(ctx, 27, ey, lw, 1);
    } else if (f === "sleepy") {
      for (const [, x] of sides) {
        ctx.beginPath();
        ctx.moveTo(x - 14, ey + 2);
        ctx.quadraticCurveTo(x, ey + 8, x + 14, ey + 2);
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = lw * 1.3;
        ctx.stroke();
      }
    } else if (f === "dizzy") {
      for (const [, x] of sides) {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 5; a += 0.2) {
          const r = a * 1.1;
          ctx.lineTo(x + Math.cos(a) * r, ey + Math.sin(a) * r);
        }
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = lw;
        ctx.stroke();
      }
    } else if (f === "shock") {
      for (const [, x] of sides) {
        L.ellipse(ctx, x, ey, 14, 17);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = lw * 1.2;
        ctx.stroke();
        ctx.fillStyle = P.ink;
        L.circle(ctx, x, ey + 1, 4);
        ctx.fill();
      }
    } else if (f === "cry") {
      for (const [s, x] of sides) {
        eyeArc(ctx, x, ey + 2, lw, s);
        ctx.fillStyle = L.rgba("#8fd8ff", 0.9);
        ctx.beginPath();
        ctx.moveTo(x - 6, ey + 6);
        ctx.quadraticCurveTo(x - 14, ey + 40, x - 4, ey + 44);
        ctx.quadraticCurveTo(x + 4, ey + 30, x - 6, ey + 6);
        ctx.fill();
      }
    } else {
      // open / smug / determined
      let open = 1 - blink;
      if (f === "smug") open *= 0.62;
      for (const [s, x] of sides) {
        eyeOpen(ctx, x, ey + (f === "smug" ? 3 : 0), p, lw, open, s);
        if (f === "smug") {
          ctx.beginPath();
          ctx.moveTo(x - 17, ey - 8);
          ctx.lineTo(x + 17, ey - 8 + s * 2);
          ctx.strokeStyle = P.ink;
          ctx.lineWidth = lw * 1.6;
          ctx.stroke();
        }
      }
      if (f === "determined") {
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = lw * 1.6;
        for (const [s, x] of sides) {
          ctx.beginPath();
          ctx.moveTo(x - s * 14, ey - 38);
          ctx.lineTo(x + s * 12, ey - 30);
          ctx.stroke();
        }
      }
    }
  }
  function mouth(ctx, p, lw) {
    const f = p.face || "open";
    const m = L.clamp(p.mouth || 0, 0, 1);
    const y = -181;
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = lw;
    if (f === "shock") {
      L.ellipse(ctx, 0, y + 2, 6 + m * 3, 8 + m * 6);
      inkFill(ctx, P.mouth, lw * 0.9);
      return;
    }
    if (m < 0.06) {
      ctx.beginPath();
      if (f === "smug") {
        ctx.moveTo(-10, y - 2);
        ctx.quadraticCurveTo(-5, y + 4, 0, y);
        ctx.quadraticCurveTo(5, y + 4, 10, y - 2);
      } else if (f === "sleepy" || f === "dizzy") {
        ctx.moveTo(-6, y + 1);
        ctx.quadraticCurveTo(0, y - 2, 6, y + 1);
      } else {
        ctx.moveTo(-8, y - 1);
        ctx.quadraticCurveTo(0, y + 6, 8, y - 1);
      }
      ctx.stroke();
      return;
    }
    const w = 10 + m * 5, h = 5 + m * 15;
    ctx.beginPath();
    ctx.moveTo(-w, y - 3);
    ctx.quadraticCurveTo(0, y - 1, w, y - 3);
    ctx.bezierCurveTo(w * 0.9, y + h * 0.9, -w * 0.9, y + h * 0.9, -w, y - 3);
    ctx.closePath();
    ctx.fillStyle = P.mouth;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = P.tongue;
    L.ellipse(ctx, 0, y + h * 0.75, w * 0.7, h * 0.4);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(-w, y - 4, w * 2, 2.5);
    ctx.restore();
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = lw * 0.9;
    ctx.stroke();
  }

  function fins(ctx, p, lw) {
    const flap = (p.ears || 0) * D2R;
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * 62, -216);
      ctx.scale(s, 1);
      ctx.rotate(0.5 + flap);
      ctx.beginPath();
      ctx.moveTo(-6, -18);
      ctx.bezierCurveTo(22, -28, 50, -20, 70, 4);
      ctx.bezierCurveTo(58, 16, 40, 18, 24, 16);
      ctx.bezierCurveTo(12, 16, 2, 16, -6, 14);
      ctx.closePath();
      inkFill(ctx, P.fin, lw);
      // pale underside
      ctx.beginPath();
      ctx.moveTo(4, 8);
      ctx.bezierCurveTo(26, 6, 50, 4, 66, 6);
      ctx.bezierCurveTo(52, 15, 26, 15, 4, 14);
      ctx.fillStyle = P.finLight;
      ctx.fill();
      ctx.strokeStyle = L.rgba(P.ink, 0.4);
      ctx.lineWidth = lw * 0.5;
      for (const x of [18, 32, 46]) {
        ctx.beginPath();
        ctx.moveTo(x, 7);
        ctx.lineTo(x + 3, 13);
        ctx.stroke();
      }
      ctx.strokeStyle = L.rgba("#6d80c4", 0.8);
      ctx.lineWidth = lw * 0.8;
      ctx.beginPath();
      ctx.moveTo(8, -14);
      ctx.quadraticCurveTo(32, -20, 54, -8);
      ctx.stroke();
      ctx.restore();
    }
  }

  function frontHair(ctx, p, lw) {
    const sw = p.hair || 0;
    const grad = hairGrad(ctx, -320, -90);
    // side locks: slim wavy strands framing the cheeks, ending at the chest
    for (const s of [-1, 1]) {
      const w = sw * 6;
      ctx.beginPath();
      ctx.moveTo(s * 56, -262);
      ctx.bezierCurveTo(s * 80, -236, s * 82, -206, s * (74 + w * 0.3), -182);
      ctx.bezierCurveTo(s * (68 + w * 0.5), -164, s * (80 + w * 0.8), -150, s * (72 + w), -126);
      ctx.bezierCurveTo(s * (66 + w * 0.8), -140, s * (60 + w * 0.5), -152, s * (60 + w * 0.3), -170);
      ctx.bezierCurveTo(s * 62, -196, s * 62, -222, s * 46, -248);
      ctx.closePath();
      inkFill(ctx, grad, lw);
    }
    // bangs: a crown cap + pointed locks over the forehead (one long lock between the eyes)
    ctx.beginPath();
    ctx.moveTo(-74, -236);
    ctx.bezierCurveTo(-80, -300, -40, -322, 0, -322);
    ctx.bezierCurveTo(40, -322, 80, -300, 74, -236);
    const tips = [
      [60, -218], [50, -244], [40, -212], [24, -240], [12, -206], [4, -236],
      [-6, -190], [-14, -236], [-22, -214], [-36, -242], [-46, -212], [-56, -240], [-64, -222],
    ];
    for (let i = 0; i < tips.length; i++) {
      const [x, y] = tips[i];
      const prev = i === 0 ? [74, -236] : tips[i - 1];
      ctx.quadraticCurveTo((prev[0] + x) / 2 + (i % 2 ? 2 : -2), (prev[1] + y) / 2 + 4, x, y);
    }
    ctx.quadraticCurveTo(-70, -228, -74, -236);
    ctx.closePath();
    inkFill(ctx, grad, lw);
    // angel-ring shine
    ctx.save();
    ctx.strokeStyle = L.rgba("#7a98e8", 0.75);
    ctx.lineWidth = lw * 2.2;
    ctx.beginPath();
    ctx.arc(0, -236, 60, Math.PI * 1.18, Math.PI * 1.42);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -236, 60, Math.PI * 1.55, Math.PI * 1.7);
    ctx.stroke();
    ctx.restore();
  }

  function headdress(ctx, p, lw) {
    // maid ruffle band over the crown
    const n = 11;
    const pt = (u, r) => {
      const a = Math.PI * (1.08 + 0.84 * u);
      return [Math.cos(a) * r, -250 + Math.sin(a) * r * 0.86];
    };
    ctx.beginPath();
    let s = pt(0, 90);
    ctx.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) {
      const a = pt((i + 0.5) / n, 104), b = pt((i + 1) / n, 90);
      ctx.quadraticCurveTo(a[0], a[1], b[0], b[1]);
    }
    for (let i = n; i >= 0; i--) {
      const q = pt(i / n, 76);
      ctx.lineTo(q[0], q[1]);
    }
    ctx.closePath();
    inkFill(ctx, P.white, lw * 0.9);
    ctx.strokeStyle = L.rgba(P.whiteShade, 1);
    ctx.lineWidth = lw * 0.7;
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const q = pt(i / 20, 82);
      i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
    }
    ctx.stroke();
  }

  function ahoge(ctx, p, lw) {
    const w = (p.ahoge || 0) * 10;
    ctx.beginPath();
    ctx.moveTo(-6, -318);
    ctx.bezierCurveTo(-18 + w, -350, 8 + w, -378, 30 + w, -362);
    ctx.bezierCurveTo(14 + w, -366, -4 + w, -350, 4, -318);
    ctx.closePath();
    inkFill(ctx, P.hairTop, lw * 0.9);
  }

  CAST.bow = (ctx, x, y, s, col, lw) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(sx * 10, -16, sx * 28, -14, sx * 26, 0);
      ctx.bezierCurveTo(sx * 28, 14, sx * 10, 16, 0, 0);
      inkFill(ctx, col, lw / s);
      ctx.beginPath();
      ctx.moveTo(sx * 3, 3);
      ctx.lineTo(sx * 14, 24);
      ctx.lineTo(sx * 8, 22);
      ctx.lineTo(sx * 2, 6);
      inkFill(ctx, col, lw / s);
    }
    L.circle(ctx, 0, 0, 6);
    inkFill(ctx, col, lw / s);
    ctx.restore();
  };

  /** cute whale emblem (apron badge, UI avatar, logos). s=1 → ~60px wide */
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

  /* ---------- hand props ---------- */
  CAST.prop = (ctx, kind, x, y, ang, side, lw, layer) => {
    ctx.save();
    ctx.translate(x, y);
    // props point "up" out of the fist, leaning with the forearm
    const lean = ang + Math.PI / 2; // forearm direction rotated so prop is perpendicular-ish
    if (kind === "mic") {
      ctx.rotate(lean * 0.35 + side * 0.15);
      if (layer === "back") {
        L.rr(ctx, -6, -10, 12, 38, 5);
        inkFill(ctx, "#2c2f3d", lw * 0.8);
      } else {
        L.circle(ctx, 0, -24, 13);
        inkFill(ctx, "#3a3f55", lw * 0.8);
        ctx.strokeStyle = L.rgba("#8e97b8", 0.8);
        ctx.lineWidth = 1.2;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(-11, -24 + k * 4.5);
          ctx.lineTo(11, -24 + k * 4.5);
          ctx.stroke();
        }
        ctx.fillStyle = L.rgba("#fff", 0.5);
        L.circle(ctx, -5, -30, 3.5);
        ctx.fill();
      }
    } else if (kind === "phone") {
      // vintage handset receiver
      ctx.rotate(lean * 0.3);
      if (layer === "front") {
        ctx.beginPath();
        ctx.moveTo(-8, -34);
        ctx.quadraticCurveTo(-14, 0, -8, 34);
        ctx.lineTo(4, 34);
        ctx.quadraticCurveTo(-2, 0, 4, -34);
        ctx.closePath();
        inkFill(ctx, P.pink, lw * 0.8);
        for (const yy of [-34, 34]) {
          L.ellipse(ctx, -4, yy, 12, 8);
          inkFill(ctx, P.pink, lw * 0.8);
        }
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
        inkFill(ctx, P.ink, lw * 0.6);
      }
    } else if (kind === "glass") {
      ctx.rotate(lean * 0.15);
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
        ctx.strokeStyle = P.ink;
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

  /* ---------- the rig ---------- */
  CAST.fish = (ctx, p) => {
    const s = p.s || 1, sq = p.sq || 1;
    ctx.save();
    ctx.translate(p.x || 0, (p.y || 0) + (p.dy || 0) * s);
    if (p.rot) ctx.rotate(p.rot);
    ctx.scale(s * sq * (p.flip ? -1 : 1), s / sq);
    const lw = (2.6 + 1.4 * s) / s;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (p.alpha !== undefined) ctx.globalAlpha *= p.alpha;

    // head pivot for tilt
    const tilt = p.headTilt || 0;
    const withHead = (fn) => {
      ctx.save();
      ctx.translate(0, -166);
      ctx.rotate(tilt);
      ctx.translate(0, 166);
      fn();
      ctx.restore();
    };
    withHead(() => backHair(ctx, p, lw));
    tail(ctx, p, lw);
    legs(ctx, p, lw);
    skirt(ctx, p, lw);
    apron(ctx, p, lw);
    torso(ctx, p, lw);
    const hands = {};
    // arms raised high draw over the head so they stay readable
    const lateL = (p.lArm || 0) > 100 || p.lFront, lateR = (p.rArm || 0) > 100 || p.rFront;
    if (!lateL) hands.l = arm(ctx, p, -1, lw);
    if (!lateR) hands.r = arm(ctx, p, 1, lw);
    withHead(() => {
      face(ctx, p, lw);
      fins(ctx, p, lw);
      frontHair(ctx, p, lw);
      headdress(ctx, p, lw);
      CAST.bow(ctx, 70, -270, 0.72, P.bow, lw);
      ahoge(ctx, p, lw);
    });
    if (lateL) hands.l = arm(ctx, p, -1, lw);
    if (lateR) hands.r = arm(ctx, p, 1, lw);
    ctx.restore();
    // world-space hand positions (approx, ignores rot) for callers that attach effects
    // local rig coords -> world (matches the translate / rotate / scale above, incl. dy and rot)
    const r0 = p.rot || 0, ox = p.x || 0, oy = (p.y || 0) + (p.dy || 0) * s;
    const toWorld = (h) => {
      const lx = h.x * s * sq * (p.flip ? -1 : 1), ly = (h.y * s) / sq;
      return { x: ox + lx * Math.cos(r0) - ly * Math.sin(r0), y: oy + lx * Math.sin(r0) + ly * Math.cos(r0) };
    };
    return { l: toWorld(hands.l), r: toWorld(hands.r), head: toWorld({ x: 0, y: -236 }), mouth: toWorld({ x: 0, y: -178 }) };
  };

  /* ---------- ready-made moves (all beat-driven) ---------- */
  /**
   * CAST.groove(t, style) -> partial pose you spread into CAST.fish({...base, ...CAST.groove(t,'swing')})
   * styles: 'idle' | 'swing' | 'sing' | 'hop' | 'strut' | 'point'
   */
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
    // swing
    return { ...base, lArm: 55 + sw * 30 * amt, rArm: 55 - sw * 30 * amt, lBend: 60, rBend: 60, legL: Math.max(0, sw) * 18 * amt, legR: Math.max(0, -sw) * 18 * amt, dy: -bob * 12 * amt };
  };
})();
