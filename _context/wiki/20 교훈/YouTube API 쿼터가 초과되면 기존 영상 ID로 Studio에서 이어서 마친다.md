---
type: lesson
audience: both
kind: process
status: encoded
basis: failure
first_seen: 2026-11-26
last_seen: 2026-11-28
applied: 3
worked: 3
missed: 0
encoded_in: "_context/editorial-direction.md; skill: oozoofrog-mode (.agents/skills/oozoofrog-mode/SKILL.md)"
episodes:
  - "[[2026-11-26 SE-0001 재집필과 첫 문장 히스 제거 및 오프닝 재공개]]"
  - "[[2026-11-27 SE-0004 공개와 Chrome YouTube Studio 쿼터 우회 완수]]"
  - "[[2026-11-28 유니코드 연대기 유튜브 공개]]"
tags:
  - lesson
---

# YouTube API 쿼터가 초과되면 기존 영상 ID로 Studio에서 이어서 마친다

> [!abstract] 한 문장
> YouTube Data API 업로드 도중 `403 quotaExceeded`나 `429 Too Many Requests`가 발생하면 반환된 영상 ID를 즉시 영수증에 저장해 재업로드를 멈추고, Google Chrome의 YouTube Studio에서 해당 영상 ID를 열어 남은 썸네일·다국어 자막·재생목록·공개 설정을 마친 뒤 재열람으로 검증한다.

## 상황

본편·쇼츠 영상과 맞춤 썸네일, 4개 언어(`ko`, `en`, `ja`, `zh-Hans`) 자막을 연속으로 YouTube에 공개하다가 API 일일 할당량이나 요청 빈도 제한을 만났을 때다.

## 일어난 일

`videos.insert`로 영상 파일 자체는 이미 올라갔는데 뒤이은 `thumbnails.set`이나 고비용 `captions.insert`에서 `429`·`403` 오류가 반복 발생했다. 첫날에는 다음 날 쿼터 초기화를 기다리는 예약 작업을 걸었으나, 이튿날 Chrome YouTube Studio 직접 진행 원칙을 세운 뒤부터는 당일 즉시 무중복으로 공개를 완수했다.

## 왜 중요한가

쿼터 초기화를 기다리면 공개 일정이 하루씩 밀리고, 실패한 업로드 명령을 무작정 재실행하면 채널에 비공개 중복 영상이 쌓인다.

## 이렇게 한다

- 지시하는 사람: API 한도에 걸렸을 때 별도 지시 없이도 Chrome YouTube Studio 이어하기를 기본 승인 절차로 둔다.
- 에이전트: 영수증 보존, Chrome(`com.google.Chrome`) Studio 진입, 저장 후 재열람 검증 절차는 `encoded_in`의 게시 지침과 시리즈 스킬을 따른다.

## 적용 기록

| 날짜 | 작업 기록 | 효과 | 내용 |
|---|---|---|---|
| 2026-11-26 | [[2026-11-26 SE-0001 재집필과 첫 문장 히스 제거 및 오프닝 재공개]] | 있음 | API 한도 도달 즉시 이미 올라간 3편의 영상 ID와 구판 `unlisted` 목록을 `data/opening-release-20261126.json`에 보존해 중복 재시도를 막았다. |
| 2026-11-27 | [[2026-11-27 SE-0004 공개와 Chrome YouTube Studio 쿼터 우회 완수]] | 있음 | `RsiNU-QPenY`·`w3ciGFJrPS4`와 대기 중이던 `SE-0002` 쇼츠(`saPWHFEelo8`)를 Chrome Studio에서 완수하고 오후 예약 작업을 취소했다. |
| 2026-11-28 | [[2026-11-28 유니코드 연대기 유튜브 공개]] | 있음 | 썸네일 `429`·쇼츠 자막 `403` 오류 직후 `eVXZMR9GoK8`·`UvNizJ4WiqE`를 Chrome Studio에서 이어받아 맞춤 썸네일 2종과 영·일·중 자막 게시를 마쳤다. |

## 근거

- 규칙 문서: [프로젝트 게시 지침](../../../_context/editorial-direction.md#publication-after-a-youtube-api-quota-error), [시리즈 스킬](../../../.agents/skills/oozoofrog-mode/SKILL.md), [쿼터 우회 사료 노트](../../../.wiki/sources/2026-11-27-chrome-quota-fallback.md)
