"""Extract one narrated scene from an episode render for a listening review."""
import argparse
import json
import math
from pathlib import Path
import re
import subprocess
import tempfile


def main():
    parser = argparse.ArgumentParser(description="완성 영상에서 검토할 장면 하나를 MP4로 추출합니다.")
    parser.add_argument("episode", help="예: 1 또는 SE-0001")
    parser.add_argument("format", choices=["long", "short"])
    parser.add_argument("scene", help="script.json의 장면 ID")
    parser.add_argument("output", type=Path, help="새 MP4 경로")
    args = parser.parse_args()
    match = re.fullmatch(r"(?:SE-?)?(\d+)", args.episode, re.I)
    if not match or int(match[1]) < 1:
        parser.error("에피소드 번호를 확인하세요.")
    episode = f"SE-{int(match[1]):04d}"
    root = Path(__file__).resolve().parents[1] / "episodes" / episode
    manifest = json.loads((root / "audio" / args.format / "manifest.json").read_text())
    row = next((s for s in manifest["scenes"] if s["sceneId"] == args.scene), None)
    if not row:
        parser.error("해당 형식에서 장면을 찾을 수 없습니다.")
    aspect = "16x9" if args.format == "long" else "9x16"
    video = root / "out" / f"{episode}-{aspect}.mp4"
    duration = float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video
    ], text=True))
    if not math.isclose(duration, manifest["totalDurationSec"], abs_tol=2 / manifest["fps"]):
        parser.error("영상과 타임라인 길이가 다릅니다. 영상을 다시 렌더링하세요.")
    if args.output.suffix.lower() != ".mp4" or args.output.exists():
        parser.error("아직 사용하지 않은 MP4 경로를 지정하세요.")
    with tempfile.TemporaryDirectory(dir=args.output.parent) as scratch:
        clip = Path(scratch) / "clip.mp4"
        subprocess.run([
            "ffmpeg", "-v", "error", "-ss", str(row["startSec"]), "-i", video,
            "-t", str(row["totalDurationSec"]), "-map", "0:v:0", "-map", "0:a:0",
            "-c:v", "libx264", "-crf", "19", "-c:a", "aac", "-movflags", "+faststart", clip,
        ], check=True)
        args.output.hardlink_to(clip)
    print(args.output.resolve())


if __name__ == "__main__":
    main()
