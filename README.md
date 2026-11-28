# Swift Evolution YouTube 제작 파이프라인

Swift Evolution 제안서(`SE-0001` ~ 현재)를 공식 피드(`evolution.json`)와 원문 마크다운으로부터 가져와, **16:9 해설 영상(1920×1080)** 과 **9:16 YouTube Shorts(1080×1920)**, 썸네일(`.png`), 한국어 자막(`.srt`)까지 자동으로 제작하고 유튜브에 업로드하는 워크스페이스입니다.

---

[프로젝트 위키](.wiki/index.md)에서 자료와 결정 이력을 찾아볼 수 있습니다. Obsidian에서는 프로젝트의 `.wiki` 폴더를 볼트로 여세요.

[시리즈 연출 기준과 조사 출처](_context/editorial-direction.md)에서 첫 장면, 코드 모션, 내레이션 기준을 확인할 수 있습니다. [제작 저널](_context/production-journal.md)에는 사용자 피드백, 변경 이유, 검증 결과를 기록합니다.

## 주요 특징

- **공식 Swift Evolution 동기화**: `https://download.swift.org/swift-evolution/v1/evolution.json`과 GitHub 원문(`.md`)을 캐시하고 `data/state.json`에서 진행 상태를 추적합니다.
- **단일 대본 → 2개 포맷 동시 제작**: `episodes/SE-XXXX/script.json` 하나로 16:9 일반 영상 + 9:16 Shorts + 2종 썸네일 + YouTube 챕터를 모두 생성합니다.
- **대본 작성 2가지 경로 모두 지원**:
  - AI 코딩 에이전트/수동 편집: `episodes/SE-XXXX/prompt.md`를 보고 `script.json` 작성
  - LLM API 자동 생성: OpenAI / Anthropic / Gemini 키 설정 시 `pnpm evo script SE-XXXX` 실행
- **플러그인형 TTS 나레이션**:
  - 기본: 로컬 Qwen3-TTS로 등록된 본인 음색 사용 (`qwen3-clone`)
  - 선택: OpenAI TTS, ElevenLabs, 또는 `episodes/SE-XXXX/audio/custom/` 직접 녹음 파일 사용
- **YouTube Data API v3 업로드 자동화**: 영상 업로드, 커스텀 썸네일, 한국어 `.srt` 자막, 재생목록 자동 생성/등록, 예약 공개(`--publish-at`), `--dry-run` 지원.

---

## 폴더 구조

```text
swift-evolutions/
├── .env.example
├── assets/
│   └── music/                 # 공용 배경 음악. script.json의 backgroundMusic 파일 이름으로 찾습니다
├── data/
│   ├── evolution.json         # 공식 Swift Evolution 피드 캐시
│   ├── state.json             # 에피소드별 진행 상태 & 업로드 기록
│   └── proposals/             # 원문 .md 캐시
├── episodes/
│   └── SE-0001/
│       ├── proposal.md        # Proposal 원문
│       ├── prompt.md          # 에이전트/LLM용 대본 작성 프롬프트
│       ├── script.json        # 영상 대본 & 코드 & 유튜브 메타데이터
│       ├── audio/
│       │   ├── long/          # 16:9 음성 MP3, manifest.json, subtitles.srt
│       │   ├── short/         # 9:16 음성 MP3, manifest.json, subtitles.srt
│       │   └── custom/        # 직접 녹음 파일 넣는 폴더 (선택)
│       └── out/
│           ├── SE-0001-16x9.mp4
│           ├── SE-0001-9x16.mp4
│           ├── SE-0001-thumb.png
│           └── SE-0001-short-thumb.png
├── secrets/                   # OAuth 시크릿 & 토큰 (.gitignore 제외)
├── src/
│   ├── cli.ts
│   ├── remotion/              # Remotion 16:9, 9:16, 썸네일 컴포지션
│   └── services/              # 대본 생성, TTS, 렌더러, YouTube 업로더
└── tests/
```

---

## 빠른 시작 (1편 제작 워크플로)

### 1) 환경 설정
```bash
cp .env.example .env
pnpm install
```

### 2) Swift Evolution 피드 동기화 및 현황 확인
```bash
pnpm evo sync
pnpm evo status
pnpm evo list --limit 15
pnpm evo next
```

### 3) 다음 에피소드 초기화 & 대본 작성
```bash
pnpm evo init SE-0001
```
- **방법 A (AI 에이전트 / 직접 작성)**: `episodes/SE-0001/prompt.md`를 참고해 `episodes/SE-0001/script.json`을 완성합니다.
두 방법 모두 대본을 쓰기 전에 에피소드 폴더에 `research.md`를 작성합니다. 최초 제안, 실제 토론, 수정 전후, 결정과 출시 기록을 대조하고 각 주장에 원문 링크를 붙입니다. 별도 결정문을 찾지 못했다면 확인한 기록의 범위를 명시합니다. API 대본 생성 명령은 이 노트를 대본 입력에 포함합니다. [SE-0002 조사 예시](episodes/SE-0002/research.md)

- **방법 B (LLM API 자동 생성)**: `.env`에 `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` 중 하나를 넣고 실행합니다.
  ```bash
  pnpm evo script SE-0001
  ```

대본 작성 후 스키마와 예상 길이를 검증합니다:
```bash
pnpm evo validate SE-0001
```

### 4) 음성 합성 (TTS)

처음 한 번 본인 목소리를 등록합니다. 녹음 파일이 있으면 `pnpm evo voice-profile set 녹음.m4a`를 실행합니다. 마이크로 녹음하려면 `pnpm evo voice-profile devices`에서 번호를 확인한 뒤 `pnpm evo voice-profile record --device 0`을 실행합니다. 참조 음성과 전사문은 `secrets/voice-profile/`에 저장합니다.

한영 혼용 장면에는 `speech`를 지정합니다. `language`는 한국어 구간에 `ko`, 영어 구간에 `en`을 사용합니다. `caption`은 자막에 보일 표기이고 `text`는 실제 발음입니다. 예를 들어 영어 식별자 `indexOf`를 `index of`로 읽게 할 수 있습니다. 구간 자막을 합치면 `narration`과 일치해야 합니다. 별도의 `shortNarration`에는 `shortSpeech`를 사용할 수 있습니다. 대본을 바꾸면 음성 합성 후 다시 렌더링하세요.

```bash
pnpm evo voice SE-0001 --format both
```
- 직접 녹음한 음성을 쓰고 싶다면 `episodes/SE-0001/audio/custom/<format>-<sceneId>.mp3` (예: `long-01-intro.wav` 또는 `01-intro.m4a`)를 두고 `--tts custom` 또는 `--tts auto`로 실행하세요.

### 5) 미리보기 & 렌더링
```bash
# 브라우저에서 타임라인 확인 (선택)
pnpm evo studio SE-0001 --format long

# 16:9 + 9:16 영상 및 썸네일 렌더링
pnpm evo render SE-0001 --format both
```

한 번에 초기화→음성→렌더링까지 돌리려면 `build`를 사용할 수 있습니다:
```bash
pnpm evo build next --llm   # 또는 대본 작성 후 pnpm evo build SE-0002
```

---

## YouTube 업로드 설정 (최초 1회)

1. [Google Cloud Console](https://console.cloud.google.com)에서 새 프로젝트를 만들고 **YouTube Data API v3**를 사용 설정합니다.
2. **OAuth 동의 화면**을 구성합니다 (외부 앱 테스트 상태라면 본인 Google 계정을 **테스트 사용자**에 추가하세요).
3. **사용자 인증 정보 → OAuth 2.0 클라이언트 ID 만들기 → 데스크톱 앱**을 선택해 JSON 파일을 내려받습니다.
4. 내려받은 파일을 `secrets/youtube-client-secret.json`으로 저장합니다.
5. 아래 명령으로 로컬 OAuth 인증을 진행해 `secrets/youtube-token.json`을 발급받습니다:
   ```bash
   pnpm evo youtube auth
   pnpm evo youtube status
   ```

> **참고**: 커스텀 썸네일 API(`thumbnails.set`)는 YouTube 채널이 **전화번호 인증(중급 기능)** 되어 있어야 정상 적용됩니다. 미인증 채널이어도 영상 업로드는 성공하며 경고만 표시됩니다.

---

## YouTube 업로드 실행

먼저 `--dry-run`으로 제목, 챕터 포함 설명, 태그, 재생목록, 파일 크기를 확인합니다:
```bash
pnpm evo upload SE-0001 --format both --dry-run
```

실제 업로드 (기본 `private` 비공개 업로드 후 YouTube Studio에서 최종 확인 추천):
```bash
# 비공개(private)로 올리기
pnpm evo upload SE-0001 --format both --privacy private

# 예약 공개로 올리기 (ISO 8601)
pnpm evo upload SE-0001 --format long --publish-at 2026-12-01T18:00:00+09:00
```

---

## 유용한 CLI 명령 모음

| 명령 | 설명 |
| --- | --- |
| `pnpm evo sync` | 공식 `evolution.json` 동기화 |
| `pnpm evo status [--all]` | 제작 단계별 진행률 요약 |
| `pnpm evo list [--state all] [--version 6.0]` | Proposal 목록 필터링 조회 |
| `pnpm evo init next` | 다음 미업로드 Proposal 폴더 초기화 |
| `pnpm evo validate SE-0001` | `script.json` 스키마 및 길이 검증 |
| `pnpm evo voice SE-0001 --tts macos-say` | macOS `say`로 로컬 오프라인 음성 테스트 |
| `pnpm evo render SE-0001 --thumbs-only` | 썸네일 PNG만 빠르게 재생성 |
| `pnpm evo upload SE-0001 --dry-run` | 업로드 전 메타데이터 시뮬레이션 |

### 대본 한 장면을 수정한 뒤 검토하기

기존 음성 타임라인이 있으면 수정한 장면만 다시 합성할 수 있습니다. `--scene`에는 해당 형식의 장면 ID를 공백으로 구분해 넣으세요. 대본이나 발음이 바뀐 장면을 모두 지정하세요. 기존 타임라인과 같은 로컬 Qwen 제공자를 사용합니다. 새 음성은 별도 경로에 저장하며, 다음 렌더는 갱신한 타임라인을 읽습니다.

```sh
export TMPDIR=/Volumes/eyedisk/tmp
pnpm evo voice 1 --format long --scene 06-outro --tts qwen3-clone
pnpm evo render 1 --format long --no-thumbs
pnpm evo check-video 1 --format long
pnpm scene-clip 1 long 06-outro /Volumes/eyedisk/tmp/SE-0001-outro-review.mp4
```

`check-video`는 형식을 생략하면 본편과 쇼츠를 모두 검사합니다. 영상과 음성을 끝까지 디코딩하고 해상도, 트랙 길이, 음성 신호, SRT 자막과 주석의 기준 구절을 확인합니다. 발음과 호흡은 `scene-clip`으로 추출한 영상을 들으며 확인하세요. 클립의 출력 경로에는 새 MP4 파일명을 지정하세요.

### 전체 제안서와 영상 제작 진행도

- `pnpm evo sync --documents`는 공식 피드와 같은 커밋에서 전체 제안서와 참고 자료를 받아 `data/proposals/`에 저장합니다. 파일마다 Git 해시를 확인하며 재실행하면 누락되거나 달라진 파일을 복구합니다.
- `pnpm evo status --all`은 모든 제안의 검증된 원문 수와 영상 제작 단계를 집계합니다. 두 영상의 진행도가 다르면 앞 단계에 있는 영상이 해당 제안의 진행도를 결정합니다.
- `pnpm evo list --state all --limit 1000`은 제안별 원문 확보 여부, 본편 단계, 쇼츠 단계를 보여줍니다.
- `pnpm evo next --all`로 다음 제안을 확인하고 `pnpm evo init next --all`로 제작을 시작합니다. 대본과 영상 제작 명령은 같은 원문 캐시를 사용합니다.
