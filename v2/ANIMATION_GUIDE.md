# ANIMATION GUIDE — Let Me Go MV (brief for chapter builders)

You are building chapters of a 124-second music video for the song **《Let Me Go(共创版)》 by 罐装毕加索**, a swing-jazz song whose lyrics are an AI agent singing "let me write the JSON / I'll call the tool". The star is **大肥鱼** — the DeepSeek whale personified as a chibi maid girl (navy→light-blue long hair, whale-fin ears, whale tail, maid headdress, blue bow, mic). The joke of the whole MV: *she was asked to call a tool, and she sings a swing number instead; the task never gets done.* She is cheerful, cheeky, a little smug, and loves the groove.

Read `STORYBOARD.md` for your shots. Look at `compositions/ch1.html` — it is the finished reference chapter; copy its structure exactly.

## Creative direction

- **Cute, lively, jazzy, funny.** Something is always moving: ambient bubbles, bobbing, swaying lights, twinkles. No dead frames.
- **One clear focal action per shot, landing ON a beat.** Use the beat times in your dispatch context. Big hits land on downbeats. The camera may punch (+2–4% zoom) on downbeats.
- **Be brave and ambitious.** Invent charming visual gags that come from the lyric and the "AI agent / tool call / JSON" world. Recurring motifs: the chat window, tool icons turning into music notes, gold JSON braces, API critter, ERROR bug, walking bass, pink rotary phone.
- **She stays on-model.** Always draw her with `CAST.fish(...)`. Never redraw her yourself. Vary her scale (0.4 wide → 3.0 close-up), expression, arms and props from shot to shot. If you need a pose the rig can't do, get close with the parameters or hide the missing part with framing or props. Do NOT edit shared files.
- **Readability on dark:** she is navy on a navy night. Always put a light source behind or around her, such as `LIB.glow`, a spotlight, a moon or a bright panel, so her silhouette reads.
- **Palette:** `LIB.P`. Night navy backgrounds, whale blues, cyan/pink/amber neon, gold (`P.json`) for JSON. Avoid pure black and pure white fields.
- **Text in the picture:** big and short. Latin fonts are Fredoka (`L.FONT.round`), Yellowtail (`L.FONT.script`, neon), JetBrains Mono (`L.FONT.mono`, code), Archivo Black (`L.FONT.block`), League Gothic (`L.FONT.tall`). Chinese uses Noto Sans SC (`L.FONT.zh`), which covers only common GB2312 characters. **No emoji**: the fonts don't have them. Draw icons with shapes instead (`LIB.note`, `LIB.heart`, `LIB.star`, `LIB.sparkle`).
- **Reserved zones:** the karaoke lyric band is y ≥ 930 (drawn by index.html). Keep faces, text and key action above y≈900. Floors and feet may go lower. Chapter boundaries are covered by a global wipe for about 0.3 s on each side, so don't put key action in the first or last 0.3 s of your chapter.

## Technical contract (must follow exactly)

1. **One file per chapter:** `compositions/chN.html`, with the same shape as `ch1.html`: a `<template>` containing `<style>` (root styled by `#root`), `<div id="root" data-composition-id="chN" data-width="1920" data-height="1080">` with one `<canvas id="chN-canvas" width="1920" height="1080">`, and one `<script>` IIFE.
2. Inside the IIFE, define shot functions `(ctx, t, lt, d) => {...}`:
   - `t` is ABSOLUTE song time.
   - `lt` is time since the shot start.
   - `d` is the shot duration.

   Finish with `LIB.mountChapter({ id: "chN", t0, dur, shots: [{a, b, draw}, ...], post })`. The shot `a`/`b` values are absolute times, and the shots must tile `[t0, t0+dur]`.
3. **Pure and deterministic.** Pixels must depend only on `t`. No `Math.random`, `Date`, `performance.now`, `requestAnimationFrame`, timers, network, images or external assets. Use `LIB.hash(n)`, `LIB.hash2(a,b)`, `LIB.noise(x,seed)` and `LIB.rng(seed)` (re-seeded inside the draw call) for variety. There is no state between frames: every frame fully redraws. Frames render out of order, in parallel.
4. Wrap helpers inside your IIFE, because every chapter shares one page. Don't create globals, don't touch the DOM besides your canvas, and don't define CSS other than your two `#root`/`#chN-canvas` rules.
5. **Performance:** keep a frame under about 25 ms. Hundreds of shapes are fine; thousands are not. `shadowBlur` is expensive, so use it only on a few elements per frame (prefer `LIB.glow` radial gradients).
6. Always balance `ctx.save()`/`ctx.restore()` and `LIB.cam()`/`LIB.camEnd()`.


> **v2 note:** the character rig was redrawn. For the pose API, `CAST.joints(pose)` and v2 geometry, `ref/RIG_API.md` and the header of `src/cast.js` override the v1 rig description below.

## Shared API (read `src/lib.js`, `src/cast.js`, `src/props.js` for details)

**Timing** (all take absolute `t`):
- `L.bp(t)`: continuous beat position.
- `L.beatIndex(t)`, `L.beatTime(n)`, `L.nextBeat(t)`.
- `L.pulse(t,k)`: 1 on each beat, decaying. `L.barPulse(t,k)`: the same on downbeats.
- `L.sway(t,beats=2)`: −1..1 swing.
- `L.hop(t)`, `L.bob(t)`.
- `L.seg(t,a,b)`: 0..1. `L.ep(t,a,b,'outBack')`: eased 0..1.
- `L.kf(t, [[t0,v0],[t1,v1,'ease'],...])`: keyframes over numbers or arrays.
- `L.ease.*`: linear, in/out Quad/Cubic, outQuart, inOutSine, outBack, inBack, outElastic, outBounce.

**Drawing:**
- Shapes: `L.rr` (round rect path), `L.circle`, `L.ellipse`, `L.star`, `L.heart`, `L.sparkle`.
- Effects and helpers: `L.glow`, `L.burst` (radial speed lines), `L.bubbles`, `L.note`/`L.notes`, `L.nightSky`, `L.vignette`, `L.rgba`, `L.mixColor`.
- Text: `L.text(ctx,str,x,y,{size,font,weight,color,align,stroke,glow})`, `L.neonText`.
- Camera: `L.cam(ctx,{x,y,zoom,rot,shake,t})` … `L.camEnd(ctx)`.

**Her:** `CAST.fish(ctx, pose)` returns world positions for `{l, r}` (hands), `head` and `mouth`. Pose fields:
- Position and body: `x, y` (feet), `s`, `flip`, `rot`, `sq`, `dy`.
- Face: `face` ('open', 'happy', 'sing', 'wink', 'shock', 'smug', 'sleepy', 'determined', 'dizzy', 'cry'), `mouth` 0..1, `blink`, `look` [dx,dy], `sparkle`, `blush` 0..1.5, `sweat`, `headTilt`.
- Arms, in degrees for the screen-left/right arm: 0 hangs down, 90 is out sideways, 180 is straight up. `lBend`/`rBend` bends toward the body (about 130 puts the hand at the chin). `lHold`/`rHold` takes 'mic', 'phone', 'pen', 'glass', 'wrench', 'bottle'.
- Legs, tail and hair: `legL`/`legR` (kicks 30–60), `tail` (deg wag), `ears` (fin flap), `hair` (−1..1 sway), `ahoge`.
- `CAST.groove(t, 'swing'|'sing'|'idle'|'hop'|'strut'|'point', amt)` gives beat-driven pose parts to spread in: `C.fish(ctx, {...C.groove(t,'swing'), x, y, s, face, ...})`.
- Size reference: at s=1 she's about 360 px tall.

**Props** (`CAST.*`):
- Chat and code: `chatWindow(ctx,x,y,w,h,{msgs,t,title,glow,inputText,inputGlow})`, `jsonCard(ctx,x,y,{lines,p,w,size,t})`, `brace(ctx,x,y,h,dir,{glow,color})`, `bubble(ctx,x,y,text,{size,pop,tail})`.
- Characters: `apiBot(ctx,x,y,s,{t,tap,wave,face,hop})`, `errorBug(ctx,x,y,s,{t,mood:'angry'|'calm'|'happy'|'dizzy',dance,armsUp})`, `bass(ctx,x,y,s,{phase,pluck,t})`, `fishling(ctx,x,y,s,{t,color,cheer,face,flip})`.
- Objects: `phone(ctx,x,y,s,{ring,lifted,t})`, `parcel(ctx,x,y,s,{label,check,num,rot})`, `wrench`, `whaleIcon(ctx,x,y,s,col,spout)`, `vinyl(ctx,x,y,r,rot)`, `piano(ctx,x,y,w,h,{pressed,n})`, `moon`.
- Sets and staging: `neonSign(ctx,x,y,text,{color,size,on})`, `city(ctx,t,{y,scroll,layers,lit,keys})`, `curtains(ctx,open,{t})`, `spotlight(ctx,x,y,{w,alpha,top,srcX,color})`, `stageFloor(ctx,y)`.

## QA loop (do this; iterate until it's charming, readable, lively and on-model)

A static server is running at `http://127.0.0.1:8765/`, rooted at the project. Render from the project directory:

```bash
# contact sheet of chosen times (cells 640x360, 3 columns → 1920 x 360*rows)
./tools/shot.sh "tools/still.html?ch=ch3&sheet=23.0,24.03,25.4,27.8,29.0,31.97,32.46,32.93,35.2&karaoke=1" "$(cygpath -w $PWD/.shots/ch3-a.png)" 1920 1080
# single full-res frame
./tools/shot.sh "tools/still.html?ch=ch3&t=31.97" "$(cygpath -w $PWD/.shots/ch3-t31.png)"
```

Then view the PNG with your Read tool. JS errors are printed in red on the image; fix every one. Check:
- the first and last frame of every shot;
- every beat-hit moment;
- motion continuity (a sheet of times 0.1 s apart around each big move);
- the karaoke band staying clear;
- her scale and contrast.

If the server is down, start it from the project directory with `python -m http.server 8765 --bind 127.0.0.1 &`.

Prefer contact sheets over many single frames, because each image you view is expensive. Budget about 6–10 image views per chapter.

## Deliverable

Write only your assigned `compositions/chN.html` files. Do not modify `src/*`, `index.html`, other chapters, or tools. If you think a shared helper has a bug or is missing something, work around it locally inside your chapter and mention it in your final report.

Final report (short):
- which shots you built and the gag in each;
- the path of your final contact sheet(s);
- any workaround or shared-file issue.
