/* PROPS — shared recurring cast & set pieces. Every function is pure (t is passed in).
 * All sizes: s=1 is the "normal" size noted per prop. Same ink/outline language as CAST.fish.
 */
(function () {
  const L = window.LIB, P = L.P, C = window.CAST;
  const ink = (ctx, fill, lw) => {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = lw;
    ctx.strokeStyle = P.ink;
    ctx.stroke();
  };
  C.ink = ink;

  /* ---------------- chat window (generic AI chat UI, not a copy of any product) ----------------
   * chatWindow(ctx, x, y, w, h, {msgs:[{who:'user'|'fish', text, p:0..1 typed, y?}], title, glow, t})
   * returns {inputX, inputY} centre of the input box (for "she pops out of the input box").
   */
  C.chatWindow = (ctx, x, y, w, h, o = {}) => {
    ctx.save();
    const t = o.t || 0;
    if (o.glow) L.glow(ctx, x + w / 2, y + h / 2, Math.max(w, h) * 0.75, P.cyan, 0.18 * o.glow);
    // frame
    L.rr(ctx, x, y, w, h, 28);
    ctx.fillStyle = "#101a46";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#3a4fa0";
    ctx.stroke();
    // title bar
    ctx.save();
    L.rr(ctx, x, y, w, 64, 28);
    ctx.clip();
    ctx.fillStyle = "#1a2766";
    ctx.fillRect(x, y, w, 64);
    ctx.restore();
    ["#ff6f91", "#ffc85a", "#6fffc8"].forEach((c, i) => {
      ctx.fillStyle = c;
      L.circle(ctx, x + 36 + i * 30, y + 32, 9);
      ctx.fill();
    });
    C.whaleIcon(ctx, x + w / 2 - 70, y + 34, 0.42, P.cyan, false);
    L.text(ctx, o.title || "Whale Chat", x + w / 2 + 10, y + 33, { size: 26, color: "#cfe0ff", weight: 600, align: "center" });
    // messages
    let my = y + 100;
    for (const m of o.msgs || []) {
      const shown = m.text.slice(0, Math.round(m.text.length * L.clamp(m.p === undefined ? 1 : m.p)));
      const fs = m.size || 38;
      ctx.font = `600 ${fs}px "${L.FONT.round}", "${L.FONT.zh}", sans-serif`;
      const tw = Math.max(ctx.measureText(m.text).width, fs * 1.4);
      const bw = tw + 56, bh = fs + 40;
      const isUser = m.who === "user";
      const bx = isUser ? x + w - bw - 40 : x + 110;
      const byy = m.y !== undefined ? m.y : my;
      if (m.p === undefined || m.p > 0 || m.thinking) {
        L.rr(ctx, bx, byy, bw, bh, 24);
        ctx.fillStyle = isUser ? "#2c4bb8" : "#f3f6ff";
        ctx.fill();
        if (!isUser) {
          // avatar
          ctx.fillStyle = "#1f2b5e";
          L.circle(ctx, x + 64, byy + bh / 2, 32);
          ctx.fill();
          C.whaleIcon(ctx, x + 64, byy + bh / 2 + 4, 0.62, P.cyan, false);
        }
        if (m.thinking) {
          for (let k = 0; k < 3; k++) {
            const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 7 - k * 0.9));
            ctx.fillStyle = L.rgba("#1f2b5e", a);
            L.circle(ctx, bx + 36 + k * 26, byy + bh / 2, 8);
            ctx.fill();
          }
        } else {
          L.text(ctx, shown, bx + 28, byy + bh / 2 + 1, { size: fs, color: isUser ? "#fff" : "#1a2255", align: "left", weight: 600 });
        }
      }
      my = byy + bh + 26;
    }
    // input box
    const ix = x + 40, iy = y + h - 96, iw = w - 80, ih = 64;
    L.rr(ctx, ix, iy, iw, ih, 32);
    ctx.fillStyle = "#0b1233";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = o.inputGlow ? L.rgba(P.cyan, 0.6 + 0.4 * o.inputGlow) : "#33458f";
    ctx.stroke();
    if (o.inputText !== undefined) L.text(ctx, o.inputText, ix + 30, iy + ih / 2, { size: 28, color: "#8fa3dd", align: "left", weight: 500 });
    // send button
    ctx.fillStyle = P.bow;
    L.circle(ctx, ix + iw - 32, iy + ih / 2, 22);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(ix + iw - 40, iy + ih / 2 - 10);
    ctx.lineTo(ix + iw - 22, iy + ih / 2);
    ctx.lineTo(ix + iw - 40, iy + ih / 2 + 10);
    ctx.fill();
    ctx.restore();
    return { inputX: ix + iw / 2, inputY: iy + ih / 2, bottom: y + h };
  };

  /* ---------------- JSON code card ----------------
   * jsonCard(ctx, x, y, {lines:[string], p:0..1 typed, w, size, title})  — syntax-coloured, typewriter.
   */
  C.jsonCard = (ctx, x, y, o = {}) => {
    const lines = o.lines || ['{', '  "tool": "sing",', '  "args": { "swing": true }', '}'];
    const fs = o.size || 34, lh = fs * 1.45;
    const w = o.w || 620, h = lines.length * lh + 60;
    ctx.save();
    L.rr(ctx, x, y, w, h, 22);
    ctx.fillStyle = L.rgba("#0a1030", o.bgAlpha === undefined ? 0.92 : o.bgAlpha);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = L.rgba(P.json, 0.8);
    ctx.stroke();
    const total = lines.join("").length;
    let budget = Math.round(total * L.clamp(o.p === undefined ? 1 : o.p));
    ctx.font = `700 ${fs}px "${L.FONT.mono}", monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    lines.forEach((ln, i) => {
      if (budget <= 0) return;
      const s = ln.slice(0, budget);
      budget -= ln.length;
      // tokenise very simply: strings, numbers/bools, punctuation
      let cx = x + 30;
      const cy = y + 30 + lh * (i + 0.5);
      const re = /("[^"]*"?)|(\btrue\b|\bfalse\b|\bnull\b|-?\d+\.?\d*)|([{}\[\]:,])|(\s+)|([^"\s{}\[\]:,]+)/g;
      let m;
      let afterColon = false;
      while ((m = re.exec(s))) {
        const tok = m[0];
        let col = "#dfe7ff";
        if (m[1]) col = afterColon ? P.mint : P.cyan;
        else if (m[2]) col = P.pink;
        else if (m[3]) col = P.json;
        if (m[3] === ":") afterColon = true;
        if (m[3] === ",") afterColon = false;
        ctx.fillStyle = col;
        ctx.fillText(tok, cx, cy);
        cx += ctx.measureText(tok).width;
      }
      if (o.caret !== false && budget <= 0 && budget > -ln.length - 1) {
        ctx.fillStyle = P.cyan;
        if (Math.sin((o.t || 0) * 10) > -0.2) ctx.fillRect(cx + 4, cy - fs * 0.5, 4, fs);
      }
    });
    ctx.restore();
    return { w, h };
  };

  /* ---------------- vintage rotary phone (pink) ---------------- s=1 ≈ 200px wide */
  C.phone = (ctx, x, y, s = 1, o = {}) => {
    const ring = o.ring || 0, lw = 4 / s;
    ctx.save();
    ctx.translate(x, y);
    const shake = ring ? Math.sin((o.t || 0) * 60) * 0.06 * ring : 0;
    ctx.rotate(shake);
    ctx.scale(s, s);
    // base
    ctx.beginPath();
    ctx.moveTo(-90, 40);
    ctx.quadraticCurveTo(-80, -30, 0, -34);
    ctx.quadraticCurveTo(80, -30, 90, 40);
    ctx.closePath();
    ink(ctx, o.color || P.pink, lw);
    // dial
    L.circle(ctx, 0, 6, 34);
    ink(ctx, "#fff2f8", lw);
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI * 0.2 + (i / 10) * Math.PI * 1.6 + (o.dial || 0);
      ctx.fillStyle = P.ink;
      L.circle(ctx, Math.cos(a) * 22, 6 + Math.sin(a) * 22, 4.5);
      ctx.fill();
    }
    // handset (unless lifted)
    if (!o.lifted) {
      ctx.save();
      ctx.translate(0, -44 - ring * 10 * Math.abs(Math.sin((o.t || 0) * 30)));
      L.rr(ctx, -80, -14, 160, 26, 13);
      ink(ctx, o.color || P.pink, lw);
      for (const sx of [-1, 1]) {
        L.ellipse(ctx, sx * 70, -4, 22, 16);
        ink(ctx, o.color || P.pink, lw);
      }
      ctx.restore();
    }
    ctx.restore();
    if (ring > 0) {
      // ring lines
      ctx.save();
      ctx.strokeStyle = L.rgba("#fff", 0.9 * ring);
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      for (const sx of [-1, 1]) {
        for (let k = 0; k < 3; k++) {
          const a = -0.7 + k * 0.7;
          const r0 = 120 * s, r1 = 150 * s;
          ctx.beginPath();
          ctx.moveTo(x + sx * Math.cos(a) * r0, y - 30 * s + Math.sin(a) * r0);
          ctx.lineTo(x + sx * Math.cos(a) * r1, y - 30 * s + Math.sin(a) * r1);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  };

  /* ---------------- payload parcel ---------------- s=1 ≈ 150px box */
  C.parcel = (ctx, x, y, s = 1, o = {}) => {
    const lw = 4 / s;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot || 0);
    ctx.scale(s, s);
    L.rr(ctx, -75, -60, 150, 120, 10);
    ink(ctx, "#e9b77a", lw);
    ctx.fillStyle = "#d59a55";
    ctx.fillRect(-12, -60, 24, 120);
    // label
    L.rr(ctx, -56, -6, 112, 44, 6);
    ink(ctx, "#fffaf0", lw * 0.7);
    L.text(ctx, o.label || "payload", 0, 16, { size: 22, font: L.FONT.mono, color: P.ink, weight: 700 });
    L.text(ctx, "{ }", 0, -34, { size: 30, font: L.FONT.mono, color: "#7a4b1c", weight: 700 });
    if (o.check) {
      // green check stamp
      ctx.save();
      ctx.globalAlpha *= L.clamp(o.check);
      ctx.translate(46, -40);
      ctx.rotate(-0.25);
      ctx.scale(0.6 + 0.4 * L.ease.outBack(L.clamp(o.check)), 0.6 + 0.4 * L.ease.outBack(L.clamp(o.check)));
      L.circle(ctx, 0, 0, 30);
      ink(ctx, P.mint, lw);
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.lineTo(-3, 11);
      ctx.lineTo(15, -12);
      ctx.stroke();
      ctx.restore();
    }
    if (o.num) L.text(ctx, String(o.num), -48, -38, { size: 34, color: P.ink, weight: 700 });
    ctx.restore();
  };

  /* ---------------- API critter ----------------
   * Little rounded TV-box bot with an antenna, screen-face reading "API", stubby legs.
   * s=1 ≈ 130px tall. o = {t, tap: 0..1 foot tapping, wave: 0..1, face:'wait'|'happy'|'sad', hop}
   */
  C.apiBot = (ctx, x, y, s = 1, o = {}) => {
    const t = o.t || 0, lw = 4 / s;
    ctx.save();
    ctx.translate(x, y - (o.hop || 0) * 30 * s);
    ctx.scale(s, s);
    // legs
    const tap = o.tap ? Math.max(0, Math.sin(t * 14)) * 10 * o.tap : 0;
    for (const [sx, lift] of [[-1, 0], [1, tap]]) {
      ctx.save();
      ctx.translate(sx * 20, -24);
      ctx.rotate(sx * lift * 0.02);
      L.rr(ctx, -7, 0, 14, 22 - lift * 0.4, 6);
      ink(ctx, "#c9d4ee", lw);
      L.ellipse(ctx, sx * 3, 22 - lift * 0.6, 13, 7);
      ink(ctx, P.dress, lw);
      ctx.restore();
    }
    // body
    L.rr(ctx, -52, -124, 104, 102, 26);
    ink(ctx, "#8fd3ff", lw);
    // screen
    L.rr(ctx, -38, -110, 76, 56, 14);
    ink(ctx, "#12204e", lw * 0.8);
    const face = o.face || "wait";
    ctx.strokeStyle = P.mint;
    ctx.fillStyle = P.mint;
    ctx.lineWidth = 4;
    if (face === "happy") {
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * 14, -84, 7, Math.PI, 0);
        ctx.stroke();
      }
    } else if (face === "sad") {
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sx * 14 - 7, -88);
        ctx.lineTo(sx * 14 + 7, -84);
        ctx.stroke();
      }
    } else {
      for (const sx of [-1, 1]) {
        L.circle(ctx, sx * 14, -86, 5);
        ctx.fill();
      }
    }
    L.text(ctx, "API", 0, -66, { size: 16, font: L.FONT.mono, color: P.mint, weight: 700 });
    // arms
    const wv = o.wave ? Math.sin(t * 12) * 0.5 * o.wave : 0;
    for (const sx of [-1, 1]) {
      ctx.save();
      ctx.translate(sx * 52, -74);
      ctx.rotate(sx * (0.5 + (sx > 0 ? wv + (o.wave ? -1.8 * o.wave : 0) : 0)));
      L.rr(ctx, -6, 0, 12, 30, 6);
      ink(ctx, "#c9d4ee", lw * 0.8);
      L.circle(ctx, 0, 32, 8);
      ink(ctx, "#fff", lw * 0.8);
      ctx.restore();
    }
    // antenna
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(0, -124);
    ctx.quadraticCurveTo(8 + Math.sin(t * 5) * 6, -140, 0, -154);
    ctx.stroke();
    L.circle(ctx, 0, -156, 8);
    ink(ctx, o.blink && Math.sin(t * 8) > 0 ? P.amber : P.pink, lw * 0.8);
    ctx.restore();
  };

  /* ---------------- ERROR bug ----------------
   * A grumpy red error-dialog creature: window box with "!" badge, stubby legs, X eyes when angry.
   * o = {t, mood:'angry'|'calm'|'happy'|'dizzy', dance:0..1}. happy turns it pink with a heart.
   * s=1 ≈ 170px wide.
   */
  C.errorBug = (ctx, x, y, s = 1, o = {}) => {
    const t = o.t || 0, lw = 4 / s, mood = o.mood || "angry";
    const col = mood === "happy" ? "#ff8fc0" : mood === "calm" ? "#ff8a7a" : P.red;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot || 0);
    ctx.scale(s, s);
    const shake = mood === "angry" ? Math.sin(t * 40) * 3 : 0;
    ctx.translate(shake, 0);
    // legs
    for (const sx of [-1, 1]) {
      const kick = o.dance ? Math.max(0, Math.sin(t * 8 + (sx > 0 ? Math.PI : 0))) * 22 * o.dance : 0;
      ctx.save();
      ctx.translate(sx * 30, -22);
      ctx.rotate(-sx * kick * 0.03);
      L.rr(ctx, -6, 0, 12, 22, 6);
      ink(ctx, "#5a1020", lw);
      ctx.restore();
    }
    // window body
    L.rr(ctx, -84, -124, 168, 104, 16);
    ink(ctx, col, lw);
    L.rr(ctx, -84, -124, 168, 28, 16);
    ink(ctx, mood === "happy" ? "#ff6fb0" : "#c8283f", lw);
    if (mood === "happy") {
      // "OK" + a drawn heart (the fonts have no ♥ glyph)
      L.text(ctx, "OK", -22, -109, { size: 18, font: L.FONT.mono, color: "#fff", weight: 700 });
      L.heart(ctx, 6, -110, 16);
      ctx.fillStyle = "#fff";
      ctx.fill();
    } else {
      L.text(ctx, "ERROR", -10, -109, { size: 18, font: L.FONT.mono, color: "#fff", weight: 700 });
    }
    // close X box
    L.rr(ctx, 54, -120, 22, 20, 5);
    ink(ctx, "#fff", lw * 0.6);
    // face
    ctx.strokeStyle = P.ink;
    ctx.fillStyle = P.ink;
    ctx.lineWidth = 5;
    if (mood === "angry") {
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sx * 26 - 9, -80);
        ctx.lineTo(sx * 26 + 9, -64);
        ctx.moveTo(sx * 26 + 9, -80);
        ctx.lineTo(sx * 26 - 9, -64);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-14, -42);
      ctx.quadraticCurveTo(0, -54, 14, -42);
      ctx.stroke();
    } else if (mood === "dizzy") {
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        for (let a = 0; a < 12; a += 0.4) ctx.lineTo(sx * 26 + Math.cos(a + t * 6) * a * 0.9, -72 + Math.sin(a + t * 6) * a * 0.9);
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    } else {
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * 26, -68, 9, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, -50, 10, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = L.rgba("#ffd1e3", 0.9);
      for (const sx of [-1, 1]) {
        L.ellipse(ctx, sx * 46, -52, 10, 6);
        ctx.fill();
      }
    }
    // badge
    ctx.save();
    ctx.translate(-72, -128);
    ctx.rotate(-0.2);
    if (mood === "happy") {
      L.heart(ctx, 0, 0, 44);
      ink(ctx, P.pink, lw);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(22, 16);
      ctx.lineTo(-22, 16);
      ctx.closePath();
      ink(ctx, P.amber, lw);
      L.text(ctx, "!", 0, 3, { size: 28, color: P.ink, weight: 700 });
    }
    ctx.restore();
    // arms
    for (const sx of [-1, 1]) {
      ctx.save();
      ctx.translate(sx * 84, -70);
      const up = o.armsUp ? -2.2 * o.armsUp : 0;
      ctx.rotate(sx * (0.6 + up) + (o.dance ? Math.sin(t * 8) * 0.4 * o.dance : 0));
      L.rr(ctx, -6, 0, 12, 34, 6);
      ink(ctx, col, lw * 0.8);
      ctx.restore();
    }
    ctx.restore();
  };

  /* ---------------- walking upright bass ----------------
   * o = {t, walk: phase-driving time, face:true}. s=1 ≈ 360px tall. Legs step on beats if you pass beat-phase.
   */
  C.bass = (ctx, x, y, s = 1, o = {}) => {
    const lw = 4 / s, ph = o.phase || 0; // 0..1 per step
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.rotate(Math.sin(ph * Math.PI * 2) * 0.05);
    // legs (little boots)
    for (const [sx, off] of [[-1, 0], [1, 0.5]]) {
      const k = Math.sin((ph + off) * Math.PI * 2);
      ctx.save();
      ctx.translate(sx * 28, -30);
      ctx.rotate(k * 0.35);
      L.rr(ctx, -6, 0, 12, 34 - Math.max(0, k) * 8, 5);
      ink(ctx, P.ink, lw);
      L.ellipse(ctx, 6, 32 - Math.max(0, k) * 8, 14, 8);
      ink(ctx, P.ink, lw);
      ctx.restore();
    }
    // body: figure-eight
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.bezierCurveTo(-96, -30, -104, -120, -58, -150);
    ctx.bezierCurveTo(-78, -176, -70, -220, -40, -238);
    ctx.bezierCurveTo(-60, -270, -30, -300, 0, -300);
    ctx.bezierCurveTo(30, -300, 60, -270, 40, -238);
    ctx.bezierCurveTo(70, -220, 78, -176, 58, -150);
    ctx.bezierCurveTo(104, -120, 96, -30, 0, -30);
    ctx.closePath();
    const g = ctx.createLinearGradient(-90, 0, 90, 0);
    g.addColorStop(0, "#7a3a1c");
    g.addColorStop(0.5, "#c0702e");
    g.addColorStop(1, "#7a3a1c");
    ink(ctx, g, lw);
    // f-holes
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = lw * 1.2;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * 30, -170);
      ctx.bezierCurveTo(sx * 20, -150, sx * 40, -130, sx * 30, -110);
      ctx.stroke();
    }
    // bridge + strings + neck + scroll
    ctx.fillStyle = "#f3d9a6";
    ctx.fillRect(-22, -122, 44, 8);
    ctx.fillStyle = "#2a1a12";
    L.rr(ctx, -10, -420, 20, 240, 6);
    ctx.fill();
    ctx.strokeStyle = "#f4e7c8";
    ctx.lineWidth = 1.6;
    for (let i = -1.5; i <= 1.5; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 5, -414);
      const vib = o.pluck ? Math.sin((o.t || 0) * 90 + i) * 3 * o.pluck : 0;
      ctx.quadraticCurveTo(i * 5 + vib, -260, i * 7, -60);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, -430, 16, 0, Math.PI * 1.6);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#2a1a12";
    ctx.stroke();
    // cute face on the lower bout
    if (o.face !== false) {
      ctx.fillStyle = P.ink;
      for (const sx of [-1, 1]) {
        L.ellipse(ctx, sx * 22, -84, 5, 7);
        ctx.fill();
      }
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -72, 8, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = L.rgba(P.blush, 0.7);
      for (const sx of [-1, 1]) {
        L.ellipse(ctx, sx * 40, -74, 9, 5);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  /* ---------------- audience fishling ----------------
   * round little fish, o={t, color, face:'o'|'happy', cheer:0..1}. s=1 ≈ 80px.
   */
  C.fishling = (ctx, x, y, s = 1, o = {}) => {
    const t = o.t || 0, lw = 3.5 / s, col = o.color || "#6fb8ff";
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 6 + x * 0.01) * 4 * (o.cheer || 0));
    ctx.scale(s * (o.flip ? -1 : 1), s);
    // tail
    const wag = Math.sin(t * 9 + x) * 0.3;
    ctx.save();
    ctx.translate(-34, 0);
    ctx.rotate(wag);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-26, -20);
    ctx.quadraticCurveTo(-18, 0, -26, 20);
    ctx.closePath();
    ink(ctx, col, lw);
    ctx.restore();
    L.ellipse(ctx, 0, 0, 40, 32);
    ink(ctx, col, lw);
    ctx.fillStyle = L.rgba("#ffffff", 0.35);
    L.ellipse(ctx, 6, 12, 24, 12);
    ctx.fill();
    // eye + mouth
    if (o.face === "happy") {
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(14, -6, 7, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#fff";
      L.circle(ctx, 16, -6, 9);
      ctx.fill();
      ctx.fillStyle = P.ink;
      L.circle(ctx, 18, -6, 5);
      ctx.fill();
    }
    ctx.fillStyle = P.ink;
    L.ellipse(ctx, 34, 6, 4, (o.cheer ? 5 : 2.5));
    ctx.fill();
    // little fin arm (waves when cheering)
    ctx.save();
    ctx.translate(-2, 8);
    ctx.rotate(0.6 - (o.cheer || 0) * (1.4 + Math.sin(t * 14 + x) * 0.5));
    ctx.beginPath();
    ctx.ellipse(0, 14, 7, 14, 0, 0, Math.PI * 2);
    ink(ctx, col, lw * 0.8);
    ctx.restore();
    ctx.restore();
  };

  /* ---------------- neon sign box ---------------- */
  C.neonSign = (ctx, x, y, text, o = {}) => {
    const size = o.size || 70;
    ctx.save();
    ctx.font = `400 ${size}px "${o.font || L.FONT.script}", sans-serif`;
    const w = ctx.measureText(text).width + size * 0.9, h = size * 1.5;
    L.rr(ctx, x - w / 2, y - h / 2, w, h, 16);
    ctx.fillStyle = "rgba(8,10,30,0.8)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = L.rgba(o.color || P.pink, 0.35);
    ctx.stroke();
    ctx.restore();
    if (o.on === undefined || o.on > 0) L.glow(ctx, x, y, w * 0.6, o.color || P.pink, 0.22 * (o.on === undefined ? 1 : o.on));
    L.neonText(ctx, text, x, y, { size, color: o.color || P.pink, on: o.on, font: o.font });
  };

  /* ---------------- night city skyline ----------------
   * city(ctx, t, {y: horizon baseline, scroll: px, layers:2, lit: 0..1, keys:true})
   * Windows light up like piano keys on beats when keys=true.
   */
  C.city = (ctx, t, o = {}) => {
    const base = o.y || 900, scroll = o.scroll || 0;
    const layers = [
      { seed: 11, col: "#141c4a", win: "#3b4fa0", hMin: 160, hMax: 380, wMin: 90, wMax: 170, par: 0.4, a: 0.55 },
      { seed: 29, col: "#0e1438", win: "#ffd98a", hMin: 220, hMax: 560, wMin: 120, wMax: 220, par: 1, a: 1 },
    ].slice(2 - (o.layers || 2));
    const bi = L.beatIndex(t);
    for (const ly of layers) {
      const off = scroll * ly.par;
      let xx = -((off % 4000) + 4000) % 4000 - 200;
      let i = Math.floor(off / 150);
      while (xx < L.W + 200) {
        const hsh = L.hash(i * 3.3 + ly.seed);
        const w = L.lerp(ly.wMin, ly.wMax, hsh), h = L.lerp(ly.hMin, ly.hMax, L.hash(i * 7.1 + ly.seed));
        const bx = xx, by = base - h;
        ctx.fillStyle = ly.col;
        ctx.fillRect(bx, by, w - 8, h + 200);
        // roof detail
        if (L.hash(i + ly.seed * 2) > 0.6) ctx.fillRect(bx + w * 0.3, by - 30, w * 0.25, 30);
        // windows
        const cols = Math.max(2, Math.floor((w - 20) / 26)), rows = Math.floor((h - 30) / 36);
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            const k = L.hash2(i * 13 + c + ly.seed, r);
            let lit = k < (o.lit === undefined ? 0.45 : o.lit);
            if (o.keys && ly.par === 1) {
              // piano-key flashes: a column lights on each beat
              const col = (bi + i * 3 + c) % 7 === 0;
              if (col && r > rows * 0.3) lit = true;
            }
            if (!lit) continue;
            ctx.fillStyle = L.rgba(ly.win, 0.55 + 0.45 * L.hash2(c, r + i));
            ctx.fillRect(bx + 12 + c * 26, by + 20 + r * 36, 14, 20);
          }
        xx += w;
        i++;
      }
    }
  };

  /* ---------------- stage: curtains, spotlight, floor ---------------- */
  C.curtains = (ctx, open, o = {}) => {
    const col = o.color || "#1b2a78", t = o.t || 0;
    for (const side of [-1, 1]) {
      const w = L.lerp(L.W / 2 + 40, 220, L.clamp(open));
      ctx.save();
      const x0 = side < 0 ? 0 : L.W - w;
      const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
      g.addColorStop(0, "#0f1850");
      g.addColorStop(0.5, col);
      g.addColorStop(1, "#0f1850");
      ctx.fillStyle = g;
      ctx.beginPath();
      const outer = side < 0 ? 0 : L.W;
      const inner = side < 0 ? x0 + w : x0;
      // outer-top -> inner-top -> (billowing) inner-bottom -> outer-bottom: never self-intersects
      ctx.moveTo(outer, 0);
      ctx.lineTo(inner, 0);
      ctx.quadraticCurveTo(inner + side * -30 * Math.sin(t * 2), L.H * 0.5, inner + side * 40 * (1 - open), L.H);
      ctx.lineTo(outer, L.H);
      ctx.closePath();
      ctx.fill();
      // folds
      ctx.strokeStyle = "rgba(5,8,30,0.45)";
      ctx.lineWidth = 6;
      const n = Math.max(2, Math.floor(w / 90));
      for (let k = 1; k < n; k++) {
        const fx = x0 + (w * k) / n;
        ctx.beginPath();
        ctx.moveTo(fx, 0);
        ctx.quadraticCurveTo(fx + Math.sin(k + t) * 16, L.H * 0.5, fx, L.H);
        ctx.stroke();
      }
      ctx.restore();
    }
    // valance with gold fringe
    ctx.fillStyle = "#16236a";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(L.W, 0);
    ctx.lineTo(L.W, 90);
    for (let k = 12; k >= 0; k--) ctx.quadraticCurveTo(L.W * ((k + 0.5) / 12), 130, L.W * (k / 12), 90);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = P.gold;
    ctx.lineWidth = 5;
    ctx.stroke();
  };
  C.spotlight = (ctx, x, y, o = {}) => {
    const top = o.top === undefined ? -50 : o.top, w = o.w || 360, a = o.alpha === undefined ? 0.35 : o.alpha;
    const col = o.color || "#fff6d6";
    ctx.save();
    const g = ctx.createLinearGradient(0, top, 0, y);
    g.addColorStop(0, L.rgba(col, a * 0.2));
    g.addColorStop(1, L.rgba(col, a));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo((o.srcX === undefined ? x : o.srcX) - 30, top);
    ctx.lineTo((o.srcX === undefined ? x : o.srcX) + 30, top);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x - w / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = L.rgba(col, a * 0.9);
    L.ellipse(ctx, x, y, w / 2, w * 0.09);
    ctx.fill();
    ctx.restore();
  };
  C.stageFloor = (ctx, y = 860) => {
    const g = ctx.createLinearGradient(0, y, 0, L.H);
    g.addColorStop(0, "#2a1c4a");
    g.addColorStop(1, "#0c0a24");
    ctx.fillStyle = g;
    ctx.fillRect(0, y, L.W, L.H - y);
    ctx.strokeStyle = "rgba(255,210,140,0.18)";
    ctx.lineWidth = 3;
    for (let k = -12; k <= 12; k++) {
      ctx.beginPath();
      ctx.moveTo(L.W / 2 + k * 40, y);
      ctx.lineTo(L.W / 2 + k * 180, L.H);
      ctx.stroke();
    }
    ctx.fillStyle = P.gold;
    ctx.fillRect(0, y - 4, L.W, 6);
  };

  /* ---------------- piano keys strip ----------------
   * piano(ctx, x, y, w, h, {pressed: Set/array of white-key indices, n: white keys})
   */
  C.piano = (ctx, x, y, w, h, o = {}) => {
    const n = o.n || 14, kw = w / n, pressed = new Set(o.pressed || []);
    for (let i = 0; i < n; i++) {
      const down = pressed.has(i);
      L.rr(ctx, x + i * kw + 2, y + (down ? 6 : 0), kw - 4, h, 8);
      ctx.fillStyle = down ? "#bfe9ff" : "#f6f8ff";
      ctx.fill();
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 3;
      ctx.stroke();
      if (down) L.glow(ctx, x + (i + 0.5) * kw, y + h * 0.6, kw * 1.2, P.cyan, 0.4);
    }
    for (let i = 0; i < n - 1; i++) {
      if ([2, 6].includes(i % 7)) continue;
      L.rr(ctx, x + (i + 0.68) * kw, y, kw * 0.64, h * 0.6, 6);
      ctx.fillStyle = "#12163a";
      ctx.fill();
    }
  };

  /* ---------------- vinyl record ---------------- */
  C.vinyl = (ctx, x, y, r, rotA = 0, o = {}) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotA);
    L.circle(ctx, 0, 0, r);
    ctx.fillStyle = "#0b0b16";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 2;
    for (let k = r * 0.4; k < r * 0.97; k += 7) {
      L.circle(ctx, 0, 0, k);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(160,200,255,0.25)";
    ctx.lineWidth = r * 0.05;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, -0.9, -0.4);
    ctx.stroke();
    L.circle(ctx, 0, 0, r * 0.34);
    ctx.fillStyle = o.label || P.bow;
    ctx.fill();
    C.whaleIcon(ctx, 0, 4, (r * 0.34) / 48, "#fff", true);
    ctx.fillStyle = "#000";
    L.circle(ctx, 0, 0, r * 0.03);
    ctx.fill();
    ctx.restore();
  };

  /* ---------------- moon ---------------- */
  C.moon = (ctx, x, y, r, o = {}) => {
    L.glow(ctx, x, y, r * 3, "#dfe9ff", 0.25);
    L.circle(ctx, x, y, r);
    ctx.fillStyle = "#f4f1dc";
    ctx.fill();
    ctx.fillStyle = "rgba(200,190,160,0.35)";
    for (const [dx, dy, rr] of [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.12], [-0.05, 0.35, 0.1]]) {
      L.circle(ctx, x + dx * r, y + dy * r, rr * r);
      ctx.fill();
    }
  };

  /* ---------------- big curly brace (drawn, crisp at any size) ---------------- */
  C.brace = (ctx, x, y, h, dir = 1, o = {}) => {
    // dir 1 = "{" , -1 = "}"
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    const w = h * 0.16;
    ctx.beginPath();
    ctx.moveTo(w * 1.2, -h / 2);
    ctx.quadraticCurveTo(0, -h / 2, 0, -h / 2 + w * 1.2);
    ctx.lineTo(0, -w * 0.9);
    ctx.quadraticCurveTo(0, 0, -w, 0);
    ctx.quadraticCurveTo(0, 0, 0, w * 0.9);
    ctx.lineTo(0, h / 2 - w * 1.2);
    ctx.quadraticCurveTo(0, h / 2, w * 1.2, h / 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const lw = o.width || h * 0.075;
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = lw + 8;
    ctx.stroke();
    if (o.glow) {
      ctx.shadowColor = o.color || P.json;
      ctx.shadowBlur = o.glow;
    }
    ctx.strokeStyle = o.color || P.json;
    ctx.lineWidth = lw;
    ctx.stroke();
    ctx.restore();
  };

  /* ---------------- speech / emote bubbles ---------------- */
  C.bubble = (ctx, x, y, text, o = {}) => {
    const size = o.size || 44;
    ctx.save();
    ctx.font = `700 ${size}px "${o.font || L.FONT.round}", "${L.FONT.zh}", sans-serif`;
    const w = ctx.measureText(text).width + size * 1.2, h = size * 1.7;
    const sc = o.pop === undefined ? 1 : L.ease.outBack(L.clamp(o.pop));
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    L.rr(ctx, -w / 2, -h / 2, w, h, h / 2);
    ctx.fillStyle = o.fill || "#fff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = P.ink;
    ctx.stroke();
    // tail
    const tx = o.tail === undefined ? -w * 0.25 : o.tail;
    ctx.beginPath();
    ctx.moveTo(tx - 14, h / 2 - 3);
    ctx.lineTo(tx - 24, h / 2 + 26);
    ctx.lineTo(tx + 12, h / 2 - 3);
    ctx.fillStyle = o.fill || "#fff";
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(tx - 12, h / 2 - 7, 22, 6);
    L.text(ctx, text, 0, 2, { size, color: o.color || P.ink, weight: 700, font: o.font });
    ctx.restore();
  };
})();
