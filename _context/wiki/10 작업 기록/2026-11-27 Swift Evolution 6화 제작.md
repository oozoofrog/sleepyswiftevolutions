---
type: episode
date: 2026-11-27
request: "6화 제작"
outcome: success
mode: main-session
lessons:
  - "[[대본 작성 전에 1차 사료와 컴파일 결과를 대조한다]]"
  - "[[한국어 단정형 종결어미는 정렬된 후행 문구로 모음 끝소리를 살린다]]"
  - "[[장식용 비유 대신 실제 코드와 관찰 가능한 도메인 결과를 먼저 보여준다]]"
evidence:
  - episodes/SE-0006/research.md
  - episodes/SE-0006/reading-ko.md
  - episodes/SE-0006/script.json
  - episodes/SE-0006/audio/long/manifest.json
  - episodes/SE-0006/audio/short/manifest.json
  - src/remotion/components/BibOrder.tsx
  - .wiki/sources/2026-11-27-se-0006-sorting.md
tags:
  - episode
---

# 2026-11-27 Swift Evolution 6화 제작

## 요청 원문

> 6화 제작

## 목표와 완료 기준

- 목표: `SE-0006`(`Apply API Guidelines to the Standard Library`)에서 바뀐 표준 라이브러리 정렬 호출 이름을 실제 코드와 도메인 시각물로 보여주는 본편과 쇼츠를 제작한다.
- 완료 기준:
  1. Swift 2.2와 Swift 3의 `sort()`·`sorted()`·`sortInPlace()` 동작이 과거 릴리스 테스트 및 현재 Swift `6.4.2` 실행 결과와 일치하고 시청자가 원본 변경과 반환값 복사를 구분할 수 있어야 한다.
  2. 모든 한국어 단정형 문장이 모음 릴리스 검증(`endingDigest`)을 통과하고 완성 MP4 음성과 문장별 음성의 시간 차이가 허용 범위 이내며 4개 언어 자막이 준비된다.

## 한 일

1. `episodes/SE-0006/research.md`에서 `2015-12-02` 초기 제안(`12f00334057e`), `2016-01-20` 정렬 API 변경표(`9bb6efeb8d85`, `sort()` → `sorted()`, `sortInPlace()` → `sort()`), `2016-01-25` Radek Pietruszewski 리뷰(원본 보존 호출에 짧은 이름을 주자는 의견), `2016-03-03` 채택(`a4a9f33c208b`)을 조사하고 `swift-2.2-RELEASE`·`swift-3.0-RELEASE` `Sort.swift.gyb` 테스트 및 Apple Swift `6.4.2` 실행으로 검증했다.
2. 세 선수의 결승선 등번호 `[3, 1, 2]`를 `도착 기록`(`bibs`)과 `번호순 명단`(`order`) 두 줄로 나누어 복사 정렬(`copy`)과 제자리 정렬(`in-place`)을 애니메이션으로 대조하는 `src/remotion/components/BibOrder.tsx`와 `bibOrder` 스키마를 구현했다.
3. `episodes/SE-0006/reading-ko.md`와 `script.json`을 작성하고 본편 19문장·쇼츠 7문장 음성을 합성해 `16:9` 본편(`106.34s`)과 `9:16` 쇼츠(`28.929s`) 및 4개 언어 SRT를 생성·검증했다.

## 결과

- 결과: 성공
- 수치·화면·커밋: 본편은 `106.34s`(1분 46초), 쇼츠는 `28.929s`(29초)다. 세 선수의 등번호 `[3, 1, 2]`로 Swift 2.2와 Swift 3의 정렬 호출을 비교했고, 본편에는 원본을 보존하는 호출에 짧은 이름을 주자는 당시 리뷰 의견도 담았다.

## 잘된 점

- `BibOrder.tsx`에서 `도착 기록`과 `번호순 명단` 두 행을 분리하고 장면 간 `SharedLayoutTransition`으로 이어 주어 반환값 복사와 원본 배열 변경의 차이가 한눈에 읽혔다.
- 문장별 음성과 완성 영상 음성의 시간 차이가 본편 19문장·쇼츠 7문장 전체에서 최대 `23ms` 이내로 일치했다.

## 아쉬운 점

- `SE-0006`의 방대한 표준 라이브러리 개편(프로토콜 `Type` 접미사 제거, `Generator` → `Iterator` 등) 가운데 한 에피소드 밀도에 맞춰 정렬 호출 한 가지에 집중했으며, 채택 공지의 부수 수정 사항은 정렬 반론과의 인과 기록이 없어 사실만 분리해 적었다.

## 회고: 지시

시리즈에서 정한 본편과 쇼츠 형식을 따랐다. 앞서 1~5화에서 역사 고증·코드 모션·음성 검증 규칙이 이미 정착돼 `"6화 제작"` 두 어절만으로 전 과정이 흔들림 없이 진행됐다. 정렬 예제와 선수의 도착 기록은 이번 편의 제작 선택이다.

## 회고: 대응

번호순 명단의 첫 번호와 가장 먼저 도착한 선수의 번호를 각각 한 문장으로 녹음했다. 완성본에서 두 줄의 숫자를 대조했다. 문장별 음성과 영상에 들어간 음성을 비교한 결과, 본편 19문장과 쇼츠 7문장에서 시간 차이는 최대 23밀리초였다. 두 영상에서 한국어·영어·일본어·중국어 간체 선택 자막을 확인했다.

## 근거

- 커밋: 작업 트리 반영 (`HEAD` `bed0031` 이후)
- 보고서·로그 경로: 버전별 정렬 동작은 당시 Swift 릴리스 테스트와 대조했고 현재 호출 예제는 Swift 6.4.2에서 실행했다. 출처는 `episodes/SE-0006/research.md`와 `.wiki/sources/2026-11-27-se-0006-sorting.md`에 기록했다.
