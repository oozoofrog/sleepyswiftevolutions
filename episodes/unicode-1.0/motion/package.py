"""Build the portable scan reader and its narration tracks."""
from pathlib import Path
import base64
import csv
import json
import math
import subprocess
import sys

from zoom_detail import build_type_plate

HERE = Path(__file__).resolve().parent
EPISODE = HERE.parent
subprocess.run([str(EPISODE.parents[1]/"node_modules/.bin/tsx"), str(EPISODE.parents[1]/"scripts/lint-korean.ts")], check=True)
work = Path(sys.argv[1])
work.mkdir(parents=True, exist_ok=True)
with (EPISODE / "narration.tsv").open() as stream:
    captions = {r["key"]: r["ko"] for r in csv.DictReader(stream, delimiter="\t")}
new = {key: caption for key, caption, speech in json.loads((HERE / "lines.json").read_text())}
captions.update(new)
chapters = {
    "mapping": ["open", "china", "japan", "korea"],
    "grid": ["axis-row", "axis-col", "axis-cell", "axis-code"],
    "forms": ["pair", "lower", "keep"],
    "grain": ["grain-edge", "grain-layers", "grain-rejoin"],
}
def uri(path, mime):
    return "data:" + mime + ";base64," + base64.b64encode(path.read_bytes()).decode()
data = {"images": {k: uri(HERE / (k + ".png"), "image/png") for k in ("row", "forms", "paper")}, "chapters": {}}
plate, local_tone, bounds = build_type_plate(HERE, work)
data["plate"] = bounds
data["images"]["typePlate"] = uri(plate, "image/webp")
data["images"]["typeTone"] = uri(local_tone, "image/png")
for mode, keys in chapters.items():
    rate = 48000
    audio = bytearray(round(0.5 * rate) * 2)
    cues = []
    for key in keys:
        source = EPISODE / "audio" / ("motion" if key in new else "long") / (key + ".mp3")
        raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(source), "-ar", str(rate), "-ac", "1", "-f", "s16le", "-"])
        start = len(audio) / (2 * rate)
        audio.extend(raw)
        cues.append(dict(key=key, caption=captions[key], start=start, end=len(audio) / (2 * rate)))
        audio.extend(bytes(round(0.45 * rate) * 2))
    frames = math.ceil((len(audio) / (2 * rate) + 1.65) * 24)
    audio.extend(bytes(frames * (rate // 24) * 2 - len(audio)))
    track = work / (mode + ".m4a")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(rate), "-ac", "1", "-i", "-", "-c:a", "aac", "-b:a", "112k", str(track)], input=audio, check=True)
    data["chapters"][mode] = dict(cues=cues, duration=frames / 24, frames=frames, audio=uri(track, "audio/mp4"))
template = (HERE / "viewer.template.html").read_text()
(HERE / "초판-스캔.html").write_text(template.replace("/*DATA*/", json.dumps(data, ensure_ascii=False)).replace("/*MOTION*/", (HERE / "motion.js").read_text()))
