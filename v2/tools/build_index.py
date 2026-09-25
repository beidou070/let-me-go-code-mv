"""Generate index.html (root composition) from src/song.js: chapter hosts, karaoke lines, wipes, audio."""
import json, pathlib, html as H

root = pathlib.Path(__file__).resolve().parent.parent
s = (root / "src/song.js").read_text(encoding="utf-8")
d = json.loads(s[s.index("{"): s.rindex("}") + 1])

hosts = []
for i, (a, b) in enumerate(d["chapters"]):
    n = i + 1
    hosts.append(
        f'      <div id="ch{n}" data-composition-id="ch{n}" data-composition-src="compositions/ch{n}.html" '
        f'data-start="{a}" data-duration="{round(b - a, 3)}" data-track-index="1" data-width="1920" data-height="1080"></div>'
    )

lines = []
for i, l in enumerate(d["lyrics"]):
    dur = round(l["end"] - l["t"], 3)
    en = H.escape(l["en"])
    zh = H.escape(l["zh"])
    lines.append(
        f'        <div id="k{i}" class="kline">'
        f'<div class="kin"><div class="en"><span class="base" data-layout-allow-overlap="true">{en}</span><span class="fill" data-layout-allow-overlap="true" data-layout-allow-overflow="true">{en}</span></div>'
        f'<div class="zh">{zh}</div></div></div>'
    )

def put(template, target, marker=None, body=""):
    text = (root / template).read_text(encoding="utf-8")
    if marker:
        text = text.replace(marker, body)
    (root / target).write_text(text, encoding="utf-8", newline="\n")


put("tools/index.template.html", "index.html", "<!--HOSTS-->", "\n".join(hosts))
put("tools/karaoke.template.html", "compositions/karaoke.html", "<!--KARAOKE-->", "\n".join(lines))
put("tools/wipes.template.html", "compositions/wipes.html")
print(f"index.html: {len(hosts)} chapters, {len(lines)} karaoke lines")
