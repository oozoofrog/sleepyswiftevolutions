---
type: episode
date: 2026-11-27
request: "초과시 크롬 브라우저로 직접 진행. 교훈도 남겨주세요"
outcome: success
mode: main-session
lessons:
  - "[[게시 전에 채널 업로드 목록을 확인한다]]"
  - "[[YouTube API 쿼터가 초과되면 기존 영상 ID로 Studio에서 이어서 마친다]]"
evidence:
  - data/state.json
  - data/opening-release-20261126.json
  - _context/editorial-direction.md
  - .agents/skills/oozoofrog-mode/SKILL.md
  - .wiki/sources/2026-11-27-chrome-quota-fallback.md
tags:
  - episode
---

# 2026-11-27 SE-0004 공개와 Chrome YouTube Studio 쿼터 우회 완수

## 요청 원문

> `"초과시 크롬 브라우저로 직접 진행. 교훈도 남겨주세요"`
> (전날 대기 중이던 `SE-0001`·`SE-0002` 오프닝 리테이크 미완료분 즉시 마무리 및 예약 작업 취소 포함, 추정)

## 목표와 완료 기준

- 목표: YouTube Data API 쿼터 초과(`quotaExceeded`)로 중단된 `SE-0004` 본편·쇼츠와 전날 오프닝 리테이크 미완료분(`SE-0002` 쇼츠 및 다국어 자막)을 중복 업로드 없이 Google Chrome YouTube Studio에서 완수하고 재발 방지 지침을 문서화한다.
- 완료 기준:
  1. 이미 발급된 `SE-0004` 영상 ID(`RsiNU-QPenY`, `w3ciGFJrPS4`)에 맞춤 썸네일, 재생목록, 4개 언어 자막, `public` 공개 상태가 적용된다.
  2. `SE-0002` 쇼츠(`saPWHFEelo8`) 업로드와 오프닝 리테이크 4종의 공개·구판 8종의 `unlisted` 상태가 검증되고 `17시 05분` 예약 작업이 삭제된다.
  3. Chrome Studio 이어하기 규칙이 `_context/editorial-direction.md`와 `.agents/skills/oozoofrog-mode/SKILL.md`에 반영된다.

## 한 일

1. `data/state.json`, `data/opening-release-20261126.json`, 채널 업로드 목록을 먼저 대조해 `SE-0004` 본편(`RsiNU-QPenY`)과 쇼츠(`w3ciGFJrPS4`)가 비공개 ID로 이미 생성되어 있음을 확인했다.
2. 동영상 파일을 다시 올리지 않고 Chrome YouTube Studio에서 `RsiNU-QPenY`와 `w3ciGFJrPS4` 편집 화면을 직접 열어 맞춤 썸네일, 재생목록(`Swift Evolution 처음부터 끝까지`, `Swift Evolution Shorts`), 4개 언어(`ko`, `en`, `ja`, `zh-Hans`) 자막, 전체 공개 전환을 마쳤다.
3. API 쿼터로 막혀 있던 `SE-0002` 쇼츠(`saPWHFEelo8`, `43.05s`)도 Chrome Studio로 업로드해 오프닝 리테이크 4종(`BCloT9Y5SpA`, `Aqy13i5eY-E`, `sLRMYzEjkMk`, `saPWHFEelo8`) 전체 공개 및 구판 8종 `unlisted` 상태를 재열람으로 확인하고 오후 예약 작업을 취소했다.
4. API 쿼터 초과 시 기존 영상 ID로 Chrome Studio에서 이어가는 절차를 `_context/editorial-direction.md`와 `oozoofrog-mode` 스킬에 기록했다(커밋 `09fea7f`).

## 결과

- 결과: 성공
- 수치·화면·커밋:
  - 커밋 `09fea7f` 반영, 중복 업로드 `0`건.
  - `SE-0004` 본편(`RsiNU-QPenY`, `127.345s`)·쇼츠(`w3ciGFJrPS4`, `21.755s`) 및 `SE-0002` 쇼츠(`saPWHFEelo8`, `43.05s`) 공개·HD 처리·썸네일·4개 언어 자막 확인 완료.

## 잘된 점

- `videos.insert`가 성공한 직후 반환된 영상 ID를 로컬 상태에 보존하고 채널 목록과 대조한 덕분에 쿼터 오류 뒤에도 중복 비공개 영상 하나 없이 모든 메타데이터를 완성했다.

## 아쉬운 점

- YouTube Data API v3에서 `captions.insert`의 일일 할당량 소모가 커 다국어 자막 4종을 연속 등록할 때 쿼터 한도에 자주 걸린다는 점을 초기 자동화 설계 때 과소평가했다.

## 회고: 지시

- API 쿼터 리셋을 수동으로 기다리는 대신 `"초과시 크롬 브라우저로 직접 진행. 교훈도 남겨주세요"`라고 우회 수단과 문서화까지 한 문장으로 승인해 준 덕분에 당일 공개가 막히지 않았다.

## 회고: 대응

- Studio 저장 직후 같은 페이지를 다시 열어 공개 상태·자막·썸네일이 실제로 반영됐는지 재확인하고 불필요해진 예약 작업을 즉시 정리한 마무리가 깔끔했다.

## 근거

- 커밋: `09fea7f`
- 보고서·로그 경로: `.wiki/sources/2026-11-27-chrome-quota-fallback.md`, `data/opening-release-20261126.json`, `data/state.json`, `_context/editorial-direction.md`
