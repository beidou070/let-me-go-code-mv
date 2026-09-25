---
title: "Let Me Go(共创版) — 罐装毕加索 · MV"
message: "让你干活，你怎么唱起来了 — 大肥鱼被叫去调用工具，却把整个夜班唱成了一场摇摆爵士"
canvas: { w: 1920, h: 1080, fps: 30 }
duration: 124.44
mode: collaborative
music: "assets/song.mp3 — swing jazz, 129.2 BPM (beat ≈ 0.465s, bar ≈ 1.86s), 4-bar phrases ≈ 7.4s"
style: "code-drawn chibi anime, clean navy ink outlines, cel fills; night-jazz palette (navy/whale-blue, cyan & pink neon, gold JSON accents)"
---

# STORYBOARD — Let Me Go MV

This video tells fans of 大肥鱼 that when you ask the whale-maid to call a tool, she turns the whole night shift into a swing number instead — and the task never gets done.

Every shot has **one clear focal action that lands on a beat**. Times are absolute song seconds (LRC-aligned). The karaoke band (y ≥ 930) is owned by `index.html` — keep key action above it.
Recurring motifs (keep them consistent across chapters): the **chat window** (the task that never gets done), **tool icons turning into music notes**, **gold JSON braces**, the **API critter**, the **ERROR bug** (enemy → dance partner → friend), the **walking bass**, the **pink rotary phone**.

Chapter boundaries are covered by a global transition wipe in `index.html` (≈0.3s each side) — chapters just hard-start/hard-end.

## Frame 1 — ch1 · hook #1 (0.000–11.559)
status: built · src: compositions/ch1.html · rules: spring-pop-entrance, kinetic-beat-slam, discrete-text-sequence(typewriter), scale-swap-transition, particle-burst
| Time | Lyric | Shot |
|---|---|---|
| 0.00–2.18 | let me go～ | Chat window: user asks 「帮我调用一下天气工具」. Reply "…" then types "let me go～". On the first downbeat 1.44 she SPLASHES out of the input box (spring pop), lands with the mic. |
| 2.18–6.76 | I'm making the calls | Camera pulls back; tiny chat still waiting on the left. She takes the call on the pink rotary phone; every beat a tool-call bubble (weather/calc/search/wrench) pops and morphs into a music note. |
| 6.76–9.51 | let me write the JSON | Gold braces slam on beats 7.15 / 7.64. JSON types `"tool": "weather"` — she scribbles it out and rewrites `"tool": "sing"`. |
| 9.51–11.56 | I'll call the tool | She tosses the wrench (9.99), it flashes into a mic on the beat (10.47), she catches it (10.94) — toast `tool_call: sing()`. |

## Frame 2 — ch2 · hook #2 (11.559–22.616)
status: outline · src: compositions/ch2.html · rules: center-outward-expansion, kinetic-beat-slam, sine-wave-loop, motion-blur-streak
| Time | Lyric | Shot |
|---|---|---|
| 11.56–13.86 | let me go～ | The chat window's frame drops away like stage curtains → she's on a mini stage; spotlight; fishling audience pops in from centre outward. |
| 13.86–18.04 | I'm making the calls | 4-panel comic split; one panel slams in per beat, each a different coloured phone + expression; last bar all four ring together. |
| 18.04–20.74 | let me write the JSON | She hops up a staircase of giant JSON tokens (`{` `"key"` `:` `[` `}`), one step per beat, each step lights gold on landing. |
| 20.74–22.62 | I'll call the tool | At the top she hurls a glowing `call()` arrow — it streaks out the window as a shooting star into the night city (motion-blur streak) → hand-off to the city. |

## Frame 3 — ch3 · verse A (22.616–37.681)
status: outline · src: compositions/ch3.html · rules: multi-phase-camera, sine-wave-loop, counting-dynamic-scale, spring-pop-entrance
| Time | Lyric | Shot |
|---|---|---|
| 22.62–26.85 | The city hums in a minor key | Night skyline, moon; building windows flash like piano keys on beats (minor arpeggio); she strolls a rooftop, camera pans with her. |
| 26.85–30.53 | My screen is glowing like a midnight sea | Her little room at night: monitor glow becomes waves that pour out and flood the room; she floats up happily among bubbles, whale silhouettes swim through the screen. |
| 30.53–33.53 | I check the payload, one, two, three | Three payload parcels arrive on a conveyor; she stamps a ✓ on each on beats 31.97 / 32.46 / 32.93 with big 1·2·3 count-ups. |
| 33.53–37.68 | Got a little API waiting on me | The API critter waits at a door tapping its foot, clock ticking; she peeks in and waves "coming～"; it perks up happy, heart pops. |

## Frame 4 — ch4 · verse B (37.681–52.029)
status: outline · src: compositions/ch4.html · rules: multi-phase-camera, motion-blur-streak, sine-wave-loop, reactive-displacement
| Time | Lyric | Shot |
|---|---|---|
| 37.68–41.64 | The bass goes walking, the cursor slides | The upright bass literally walks across (one step per beat, walking bass line); she rides a giant text cursor like a skateboard beside it; notes trail. |
| 41.64–45.14 | I'm chasing endpoints through neon lights | Neon alley at speed: endpoint signs (`/v1/chat`, `/tools`, `/sing`) dart away; she runs after them; parallax neon, speed streaks. |
| 45.14–48.49 | If the answer's late, I'll pour some wine | Jazz-bar counter; a loading spinner hangs above; she pours wine, the spinner's swirl becomes the swirl in the glass; smug face. |
| 48.49–52.03 | And let the error swing in four-four time | The ERROR bug pops up angry; she takes its hands and they swing-dance; big 1-2-3-4 flash on beats; it turns pink "OK ♥". |

## Frame 5 — ch5 · chorus A (52.029–70.590)
status: outline · src: compositions/ch5.html · rules: spring-pop-entrance, press-release-spring, particle-burst, kinetic-beat-slam
| Time | Lyric | Shot |
|---|---|---|
| 52.03–54.81 | Oh, let me go~ | Jazz club: curtains fly open, spotlight slams onto her, fishling audience cheers, neon "Let me go" sign flickers on. |
| 54.81–58.96 | I'm making the calls | Retro switchboard: she plugs cables into jacks on beats; each plug lights a tool bulb; cables swing. |
| 58.96–63.22 | Let me write the JSON, I'll give it my all | Marquee board of light bulbs spells JSON as she writes; "give it my all" → determined flex, board bursts into gold sparks. |
| 63.22–67.58 | I'll call the tool, let me do it, honey | A toolbox pops open; tools spring out and become a tiny band; on "honey" she winks → heart. |
| 67.58–70.59 | Code and rhythm never cost no money | Price tag `¥0.00` / `tokens: FREE`; zeros rain like coins; code lines scroll as a music staff with notes. |

## Frame 6 — ch6 · chorus B (70.590–86.761)
status: outline · src: compositions/ch6.html · rules: multi-phase-camera, sine-wave-loop, press-release-spring, viewport-change
| Time | Lyric | Shot |
|---|---|---|
| 70.59–77.21 | Yeah, let me go, I'm making the calls | Big dance number on the club stage: she centre, kickline of fishlings + API critter + ERROR (now friend) behind; lights sweep on beats; wide → medium re-frame at 73.9. |
| 77.21–80.32 | A little bit of swing when the system falls | "SYSTEM" dashboard tiles crumble and fall; she swings on a swing hanging from a falling SYSTEM sign, unbothered. |
| 80.32–84.57 | I'll call the tool, let me do it now— | Close-up: a big red CALL TOOL button; wind-up… she slams it (press-release spring). |
| 84.57–86.76 | The groove will show me how | The button morphs into a spinning vinyl record; hypnotic groove spiral; camera dives into the groove. |

## Frame 7 — ch7 · break + scat (86.761–101.482)
status: outline · src: compositions/ch7.html · rules: kinetic-beat-slam, 3d-text-depth-layers, spring-pop-entrance
| Time | Lyric | Shot |
|---|---|---|
| 86.76–90.74 | (instrumental) | Blue-Note record-sleeve world: duotone blue blocks, huge "LET ME GO" in Archivo Black; she plays a big piano with her tail, keys light on beats. |
| 90.74–94.16 | (instrumental) | The user's message pops in: 「……所以工具调用了吗？」 — she shushes it 「嘘～」 and flicks it away with her tail. |
| 94.16–95.76 | Ba-da-ba-doo, the request is due | Sleeve typography slams one syllable per beat: BA·DA·BA·DOO; a "DUE" clock. |
| 95.76–97.63 | Skoo-be-doo, I'm calling you | SKOO·BE·DOO; phone rings; she points at the camera. |
| 97.63–99.47 | Doo-ba-dee, the JSON's free | DOO·BA·DEE; gold braces break out of a cage and fly off like birds. |
| 99.47–101.48 | Shoo-be-doo, let me do it, me! | SHOO·BE·DOO; she points at herself, giant "ME!" slam at the peak (≈100.4). |

## Frame 8 — ch8 · final chorus A (101.482–113.532)
status: outline · src: compositions/ch8.html · rules: sine-wave-loop, particle-burst, multi-phase-camera
| Time | Lyric | Shot |
|---|---|---|
| 101.48–104.52 | So let me go | Quiet moment (low energy): she sits on the edge of the chat window floating in the moonlit sky, legs swinging. |
| 104.52–108.59 | I'm making the calls | Neon phone-lines shoot from her mic across the city, connecting rooftops; windows light up on beats. |
| 108.59–111.26 | Let me write the JSON | JSON fireworks: braces and brackets burst in the sky on beats. |
| 111.26–113.53 | I'll call the tool | She "calls" — everyone answers: API critter, ERROR friend, walking bass, parcels fly in toward the stage. |

## Frame 9 — ch9 · finale + end card (113.532–124.440)
status: outline · src: compositions/ch9.html · rules: particle-burst, sine-wave-loop, viewport-change, spring-pop-entrance
| Time | Lyric | Shot |
|---|---|---|
| 113.53–120.12 | Let me do it… | Grand finale kickline under the moon; confetti; spotlights; she spins, big pose on 118.47. |
| 120.12–122.60 | and swing it all | Final pose, camera pulls back INTO the chat window: her reply reads 「工具调用 0 次 · 歌曲 1 首」; the user answers 「……好吧，再唱一遍」. |
| 122.60–124.44 | (end) | End card: "Let Me Go（共创版）" · 罐装毕加索 · credits (原作 @星落落_oi · 词 DeepSeek · 曲 Suno/豆包 · MV 画面全部由代码绘制). |
