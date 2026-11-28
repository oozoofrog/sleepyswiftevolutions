---
type: episode
date: 2026-11-27
request: "Upload"
outcome: success
mode: main-session
lessons:
  - "[[게시 전에 채널 업로드 목록을 확인한다]]"
evidence:
  - data/state.json
  - episodes/SE-0006/script.json
tags:
  - episode
---

# 2026-11-27 Swift Evolution 6화 공개

## 요청 원문

> Upload

## 목표와 완료 기준

- 목표: 직전에 완성한 `SE-0006` 본편(`16:9`)과 쇼츠(`9:16`)를 시리즈 채널 `잠이오는 스위프트 진화의 역사`에 중복 없이 공개한다.
- 완료 기준:
  1. 게시 전 로컬 기록(`data/state.json`)과 채널의 기존 업로드 목록(18개)에 6화가 없음을 확인한다.
  2. 두 영상 모두 공개 상태로 처리 완료되고 각 재생목록 편입, 맞춤 썸네일, 4개 언어(`ko`, `en`, `ja`, `zh-Hans`) 선택 자막이 YouTube에서 확인된다.

## 한 일

1. `data/state.json`과 채널 `잠이오는 스위프트 진화의 역사`(`UCCtGyB0lbnsT0ES0Yuwhwjg`)의 기존 업로드 영상 18개를 대조해 `SE-0006` 게시 이력이 없음을 확인했다.
2. `.mp4.endings.json` 무결성 검증을 거쳐 본편(`6QfWBJCDqjM`, `106.34s`)과 쇼츠(`eROSmP5FMJc`, `28.929s`), 맞춤 PNG 썸네일, 4개 언어 SRT 트랙을 업로드하고 각 재생목록에 등록했다.
3. 게시 직후 YouTube API로 두 영상의 공개 상태, 재생목록 수록, 4개 언어 자막 제공 여부를 검증했다.

## 결과

- 결과: 성공
- 수치·화면·커밋: 본편(`106.34s`, `"sort()가 원본 배열을 바꾸게 됐다 · SE-0006"`)과 쇼츠(`28.929s`, `"sort()가 원본 배열을 바꾸게 됐다 · SE-0006 #Shorts"`) 모두 공개 및 4개 언어 자막 확인 완료.

| 영상 | 재생목록 |
|---|---|
| [6화 본편](https://youtu.be/6QfWBJCDqjM) | Swift Evolution 처음부터 끝까지 |
| [6화 쇼츠](https://www.youtube.com/shorts/eROSmP5FMJc) | Swift Evolution Shorts |

## 잘된 점

- 게시 전 채널 기존 영상 18개 대조와 `.mp4.endings.json` 자동 검사를 거쳐 한 번의 API 실행으로 본편·쇼츠·썸네일·자막 4종·재생목록 등록까지 깔끔하게 끝냈다.

## 아쉬운 점

- 업로드 완료 후 갱신된 `data/state.json`과 `episodes/SE-0006/` 산출물이 즉시 별도 Git 커밋으로 묶이지 않고 작업 트리에 남았다.

## 회고: 지시

- 직전 작업이 `6화 제작`이었고 공개 채널·재생목록·자막 규격이 모두 고정돼 있어 `"Upload"` 한 단어로도 의도가 완전히 명확했다.

## 회고: 대응

- 짧은 영문 지시(`"Upload"`)에도 사용자 응답은 한국어로 유지하고, 게시 전 채널 목록 확인 교훈을 그대로 적용해 중복 위험 없이 결과를 표로 요약 보고했다.

## 근거

- 커밋: 작업 트리 반영 (`data/state.json`, `HEAD` `bed0031` 이후)
- 보고서·로그 경로: `data/state.json`, `episodes/SE-0006/script.json`
