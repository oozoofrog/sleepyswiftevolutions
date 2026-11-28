---
type: chronicle
date: "2026-11-28"
---

# YouTube publication of the Unicode chronology episode and Short

The creator requested publishing the Unicode chronology episode to YouTube first (`"일단 유니코드를 유튜브에 올려주세요"`).

## Channel, playlist, and live URLs

- **Channel**: `잠이오는 스위프트 진화의 역사` (`UCCtGyB0lbnsT0ES0Yuwhwjg`, verified empty of prior Unicode uploads across 20 existing items before upload).
- **Playlist**: `유니코드 연대기` (`PLfEnlqRjmO_8`, `public` · [유니코드 연대기 재생목록](https://www.youtube.com/playlist?list=PLfEnlqRjmO_8)).
- **Landscape (`16:9`)**: [유니코드 1.0 연대기 — 한 획에 붙은 세 번호](https://youtu.be/eVXZMR9GoK8) (`eVXZMR9GoK8`, `privacy=public`, `processing=succeeded`, `PT7M13S`, uploaded at `2026-11-28T01:03:21.561Z`).
- **Short (`9:16`)**: [유니코드 1.0 연대기 — 한 획에 붙은 세 번호 #Shorts](https://www.youtube.com/shorts/UvNizJ4WiqE) (`UvNizJ4WiqE`, `privacy=public`, `processing=succeeded`, `PT2M51S`, uploaded at `2026-11-28T01:04:11.825Z`).

## Thumbnails, captions, and API-to-Studio completion

- Prepared `71`-cue (`long`) and `26`-cue (`short`) SRT caption tracks in `ko`, `en`, `ja`, and `zh-Hans` under [subtitles](../../episodes/unicode-1.0/out/subtitles/) and rendered custom archival thumbnails via [thumb.py](../../episodes/unicode-1.0/thumb.py) (`1280x720` [unicode-chronology-thumb.jpg](../../episodes/unicode-1.0/out/unicode-chronology-thumb.jpg) and `1080x1920` [unicode-chronology-short-thumb.jpg](../../episodes/unicode-1.0/out/unicode-chronology-short-thumb.jpg)).
- [upload.ts](../../episodes/unicode-1.0/upload.ts) created playlist `PLfEnlqRjmO_8`, uploaded both public videos, attached all four Long caption tracks (`en`, `ja`, `ko`, `zh-Hans`) and Short `ko`, and added both videos to `PLfEnlqRjmO_8`.
- When YouTube Data API hit `429 Too Many Requests` on `thumbnails.set` and `403 quotaExceeded` on Short multi-language `captions.insert`, completed only the missing items in Chrome YouTube Studio on `잠이오는 스위프트 진화의 역사`: uploaded and saved both Long and Short custom thumbnails (`"변경사항이 저장됨"` / `"모든 변경사항이 저장되었습니다."`) and published Short's `en`, `ja`, and `zh-Hans` subtitle tracks (`게시됨`).
- Reopened Studio pages for both videos and ran `./node_modules/.bin/tsx episodes/unicode-1.0/upload.ts --verify-only`, confirming `privacy=public`, `upload=processed`, `processing=succeeded`, `captions=en,ja,ko,zh-Hans` on both videos, both videos inside `PLfEnlqRjmO_8`, and saved status in [upload-receipt.json](../../episodes/unicode-1.0/out/upload-receipt.json).
