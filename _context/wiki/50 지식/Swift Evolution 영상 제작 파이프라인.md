---
type: knowledge
area: architecture
verified: 2026-11-28
sources:
  - package.json
  - src/cli.ts
  - src/schema/script.ts
  - src/lib/pacing.ts
  - src/lib/timeline.ts
  - src/services/tts/qwen.ts
  - src/services/ending-check.ts
  - src/services/renderer.ts
  - src/services/youtube/uploader.ts
  - src/remotion/Root.tsx
  - src/remotion/components/DirectedScene.tsx
  - src/remotion/components/CodeGlyphMorph.tsx
  - src/remotion/components/BibOrder.tsx
  - scripts/qwen3_tts_batch.py
  - scripts/voice_denoise.py
  - episodes/SE-0006/reading-ko.md
tags:
  - knowledge
---

# Swift Evolution 영상 제작 파이프라인

> [!info] 요약
> Swift Evolution 에피소드는 `research.md`·`reading-ko.md` 고증을 거쳐 Zod 기반 `EpisodeScriptSchema`(`script.json`)로 구조화하고, 로컬 MLX `qwen3-clone`으로 음성과 강제 정렬 자막을 합성한 뒤 Remotion(`30 fps`)으로 `16:9` 본편과 `9:16` 쇼츠를 렌더링한다.
> 모든 한국어 평서문(`-다.`) 음성은 종결 모음 슬라이싱과 SHA-256 `endingDigest`·`.mp4.endings.json` 무효화 가드를 통과해야 렌더링 및 업로드가 허용된다.
> 영상 화면에는 내레이션 자막을 굽지 않고 `ko`, `en`, `ja`, `zh-Hans` 4개 언어 선택형 SRT 자막을 별도 트랙으로 생성·업로드한다.

## 내용

### 단계별 파일 구조와 흐름

각 에피소드는 `episodes/SE-XXXX/` 아래에서 독립된 `long`(`16:9`)·`short`(`9:16`) 상태(`data/state.json`의 `formatStage`, 전체 `productionStage`는 두 판본 중 낮은 단계)로 관리된다.

1. **사료 조사와 낭독 대본 (`research.md`, `reading-ko.md`)**: 최초 제안 커밋, PR·메일링 리스트 반론, 채택 공지, 릴리스 태그 테스트(`swift-2.2-RELEASE`, `swift-3.0-RELEASE`) 및 로컬 Apple Swift `6.4.2` 실행 결과를 `research.md`에 기록하고, 호흡·강세·침묵 박자를 구분한 한국어 낭독 대본 `reading-ko.md`를 작성한다.
2. **구조화 대본과 스키마 검증 (`script.json`, `src/schema/script.ts`)**: `EpisodeScriptSchema`(`schemaVersion: 1`)가 장면(`scenes` 최소 3개, 선택적 `shortsScenes` 최소 2개), 한·영 분리 발화(`speech` / `shortSpeech`), 핀포인트 코드 지칭(`direction.references`), 도메인 시각화 속성, 한국어 카피 린트(`checkScriptCopy`)를 한 번에 검증한다.
3. **로컬 MLX 음성 합성과 무효화 가드 (`src/services/tts/qwen.ts`, `scripts/qwen3_tts_batch.py`)**: 오프라인 MLX 환경(`mlx-audio-py312`)에서 `Qwen3-TTS-12Hz-1.7B-Base-8bit`(`qwen3-clone`)와 `Qwen3-ForcedAligner-0.6B-8bit`를 순차 실행해 장면별 MP3(`44.1kHz`, `loudnorm=I=-16:TP=-1.5:LRA=7`), `audio/{long,short}/manifest.json`, `subtitles.srt`를 생성한다.
4. **Remotion 렌더링 (`src/services/renderer.ts`, `src/remotion/Root.tsx`)**: `checkEndings` 통과 후 필요 시 `narrationMix: "soft"` 전용 임시 `.soft.m4a` 사본을 만들고, Remotion 번들 하나로 `SwiftEvolutionLong`(`1920x1080`, `30 fps`), `SwiftEvolutionShort`(`1080x1920`, `30 fps`), `ThumbnailLong`(`1280x720` PNG), `ThumbnailShort`(`1080x1920` PNG)을 렌더링한 뒤 `.mp4.endings.json` 영수증을 기록한다.
5. **다국어 자막 및 업로드 (`src/services/youtube/uploader.ts`)**: 한국어 큐 타임스탬프를 공유하는 4개 언어 SRT(`subtitles.srt`, `subtitles.en.srt`, `subtitles.ja.srt`, `subtitles.zh-Hans.srt`)와 PNG 썸네일을 검증 후 업로드하고 재생목록(`PLGhO13AECGZA`, `PLfIjTtT2lhw8`)에 편입한다.

### 주요 CLI 명령 (`package.json` 및 `src/cli.ts`)

| 명령 | 동작 요약 |
|---|---|
| `pnpm evo sync [--documents]` | `data/evolution.json`과 `data/state.json` 동기화 (`--documents` 시 `scripts/sync-proposals.py`로 제안서 Git blob SHA-1 검증) |
| `pnpm evo init <id\|next>` | `episodes/SE-XXXX/{proposal.md,prompt.md,script.json}` 초기 스캐폴딩 생성 |
| `pnpm evo validate <id\|next>` | `EpisodeScriptSchema` 검증 및 `16:9`·`9:16` 예상 길이 산출 (쇼츠 `58초` 초과 시 경고) |
| `pnpm evo voice-profile devices \| set \| record` | `secrets/voice-profile/reference.wav`(`24kHz` 모노) 및 `qwen3-asr` 전사 텍스트 등록·녹음 |
| `pnpm evo voice <id> [--format ...] [--scene ...]` | 장면별 음성·`manifest.json`·`subtitles.srt` 합성 (`--scene` 부분 재합성 지원) |
| `pnpm evo studio <id> [--format long\|short]` | `render-props.json` 작성 후 해당 에피소드 오디오 폴더를 연결해 Remotion Studio 실행 |
| `pnpm evo render <id> [--format ...] [--thumbs-only]` | 종결 다이제스트 확인 후 H.264 MP4·PNG 썸네일·`.mp4.endings.json` 생성 |
| `pnpm evo check-video <id> [--format ...]` | 매니페스트·큐·SRT 일치, `ffprobe` 해상도·길이 오차(`<= 2/fps`), `volumedetect` 무음 여부 검증 |
| `pnpm evo upload <id> [--format ...] [--dry-run]` | `.mp4.endings.json` 검증 후 MP4·썸네일·4개국어 자막 업로드 및 재생목록 추가 |
| `pnpm scene-clip <ep> <long\|short> <sceneId> <out.mp4>` | 청취 검수용 단일 장면 MP4 클립 추출 (`scripts/scene-clip.py`) |

### `EpisodeScriptSchema`와 핵심 연출 컴포넌트

- **한·영 분리 발화 (`speech` / `shortSpeech`)**: `{ language: "ko" | "en", text, caption, direction? }` 배열로 영어 식별자 발음(`text: "index of"`)과 화면 표기(`caption: "indexOf"`)를 분리한다. 공백을 제거한 `caption` 합본은 반드시 `narration`(`shortNarration`)과 일치해야 하며, `shortNarration`만 지정하고 `shortSpeech`를 생략하면 본편 `speech`가 쇼츠로 새지 않도록 비워진다.
- **호흡 간격과 쇼츠 템포 (`src/lib/pacing.ts`)**: 문장 뒤 기본 쉼표는 `다.` 뒤 `0.57초`, 일반 평서문 `.!` 뒤 `0.45초`, 질문 `?` 뒤 `0.65초`이며 문장 중간 언어 전환은 `0초`로 이어 붙인다. 장면 여백은 가로 `1.30초`(`0.4 + 0.9`), 세로 `1.10초`(`0.35 + 0.75`)이며 쇼츠는 `shortCloneTempo`(`atempo`) 배속에 맞춰 자막 큐 시각도 함께 축소된다.
- **Remotion 시각 컴포넌트**:
  - `DirectedScene.tsx`: 누적 발화 글자 위치와 `SpokenReference`(`offsetSec`, `targets`)를 계산해 화자가 호명하는 정확한 시점에 핀포인트 코드 강조(`CodePanel.tsx`: 첫 언급 시 배경 페이드인, 같은 판본 내 재언급 시 `108%` 크기 펄스)와 문자 단위 이동을 구동한다.
  - `CodeGlyphMorph.tsx`: `Menlo` 코드 블록의 그래핌 경계 상자를 실시간 측정해 최장 공통 문자열은 `1.25초` 동안 새 위치로 이동시키고 삭제·추가 기호만 페이드 처리한다.
  - `SharedLayoutTransition.tsx`: `sceneTransition: "shared-layout"` 설정 시 `[data-layout-id]` / `[data-layout-part]` 요소를 장면 경계 너머로 `1.25초` 동안 연속 이동시킨다.
  - 도메인 시각화 컴포넌트: `CodeReveal.tsx`(오프닝 퍼즐 토큰 삭제), `ParameterValueFlow.tsx`(`SE-0003` `local` 복사본 vs `inout` 슬롯 반환), `PathDrawing.tsx`(`SE-0005` 모눈종이 `(10, 20)` 시작점과 종이비행기 경로 그리기), `BibOrder.tsx`(`SE-0006` 결승선 `도착 기록 bibs` 제자리 정렬 vs `번호순 명단 order` 복사본 비교). 시각 결정 배경은 [[시리즈 시각 연출과 타이포그래피 결정]]에 정리돼 있다.

### `qwen3-clone` 슬라이싱과 다이제스트 무효화 가드

- **도입 히스 제거 (`OPENING_PROMPT`)**: 판본 첫 한국어 문장 앞에 `"이제 시작합니다."`를 붙여 합성한 뒤 강제 정렬로 무음 골짜기(`10ms` 최소 RMS)에서 잘라내 첫 문장 클론 히스 폭발을 막는다(기존 스템 부분 교체 시에는 샘플 수 일치를 검증하는 `scripts/splice-opening.py` 사용).
- **종결 모음 보존 (`ENDING_PROMPT`)**: `다.`로 끝나는 모든 한국어 문장 뒤에 `"잠시 쉬어 볼까요?"`를 붙여 합성하고 `다`와 `잠시` 사이 가장 조용한 구간에서 잘라내(`release_final_vowel`) 받침 없는 `ㅏ` 모음이 자연스럽게 열린 채 끝나게 한다.
- **지연 보정 히스 억제 (`scripts/voice_denoise.py`)**: `ffmpeg` `afftdn=nt=w:nf=-40:nr=6:gs=5` 필터의 임펄스 응답 샘플 지연만큼 앞뒤를 패딩·트림해 총 샘플 길이를 1샘플 오차 없이 유지한다.
- **무효화 영수증 (`src/services/ending-check.ts`)**: `endingDigest`(`SHA-256("aligned-vowel-v1\0" + 세그먼트 JSON + 오디오 바이트)`)가 `manifest.json`에 저장되고, 렌더링 완료 시 전체 MP4 바이트까지 묶은 `<video>.mp4.endings.json`이 생성된다. 대본 한 글자나 오디오·MP4 파일이 바뀌면 `render`와 `upload` 단계에서 즉시 차단된다([[한국어 대본과 음성 검증 게이트]] 참고).

## 주의할 점

- `SpokenReference`의 `targets[].text`는 지정된 1-기반 코드 줄(`line`) 안에서 **정확히 한 번만** 등장해야 한다. 같은 줄에 동일 문자열이 두 번 이상 있으면 `EpisodeScriptSchema` 검증이 실패한다.
- 24GB 통합 메모리 한도 안에서 안정적으로 동작하도록 `scripts/qwen3_tts_batch.py`는 `Qwen3-TTS` 생성 단계가 끝난 뒤 `gc.collect()`와 `mx.clear_cache()`로 메모리를 비우고 2단계로 `Qwen3-ForcedAligner`를 로드한다.
- `SE-0004` 이후 Remotion 화면 안에는 내레이션 자막 바를 렌더링하지 않는다. 인스타그램 릴스처럼 오픈 캡션이 필요한 플랫폼에는 `ffmpeg-full`로 한국어 SRT를 하단 여백에 별도 번인한 `-9x16-ko.mp4` 사본을 쓴다([[유튜브와 인스타그램 게시 절차 및 장애 대응]] 참고).

## 확인 방법

- 파이프라인 단위·통합 검증: `pnpm typecheck && pnpm lint:ko && pnpm test`
- 특정 에피소드 대본 및 렌더링 산출물 검증: `pnpm evo validate SE-0006 && pnpm evo check-video SE-0006 --format both`

## 근거

- CLI 및 패키지 스크립트: `package.json`, `src/cli.ts`
- 대본 스키마 및 타임라인: `src/schema/script.ts`, `src/lib/pacing.ts`, `src/lib/timeline.ts`
- 음성 합성·디노이즈·종결 다이제스트: `src/services/tts/qwen.ts`, `scripts/qwen3_tts_batch.py`, `scripts/voice_denoise.py`, `src/services/ending-check.ts`
- Remotion 렌더링 및 업로더: `src/services/renderer.ts`, `src/remotion/Root.tsx`, `src/remotion/components/DirectedScene.tsx`, `src/remotion/components/CodeGlyphMorph.tsx`, `src/remotion/components/BibOrder.tsx`, `src/services/youtube/uploader.ts`
- 관련 작업 기록: [[2026-11-27 Swift Evolution 6화 제작]]
