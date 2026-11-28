---
title: Series production
type: guide
page_kind: summary
created: "2026-11-26"
updated: "2026-11-28"
aliases: ["제작 개요"]
tags: [swift-evolution, production]
sources: ["2026-11-26-pipeline.md", "2026-11-26-series-theme.md", "2026-11-26-first-episode-approval.md", "2026-11-27-se-0005-importer-review.md"]
---

# Series production

The TypeScript CLI prepares one Swift Evolution proposal per episode. Remotion renders landscape and portrait editions. The production path is proposal → script → narration and captions → render → upload. A local render is a separate step from publication.

Use [[production-instructions]] for working agreements, [[visual-direction]] for composition, [[narration]] for audio checks and [[se-0001-history]] for a researched episode.

## Source snapshots

- [Snapshot of pipeline](../sources/2026-11-26-pipeline.md)

Use the series name “듣다 보면 잠이 오는 스위프트 에볼루션 훑어보기”. Keep the approved conversational voice and the pause after the opening question. Show the series name as a small opening label and use a concrete language change as the thumbnail headline. [Series decision](../sources/2026-11-26-series-theme.md)

SE-0001 is the approved style reference. [Creator approval](../sources/2026-11-26-first-episode-approval.md)

For SE-0005, follow the change from the Swift 2 UIKit call through the intermediate proposal to the accepted argument label. The episode notebook also traces the Foundation naming dispute. [[2026-11-27-se-0005-importer-review]]

SE-0005 introduces Objective-C and UIKit before comparing the imported method names. [[2026-11-27-se-0005-language-context]]

For the history of character encoding, consult [[2026-11-27-unicode-1-0-history|the Unicode 1.0 research note]]. It traces the decision to split the first edition and documents the Hangul repertoire in Volume 1.

The author’s Korean accounts introduce the design goals and record the July 1991 decision to split the book. [[2026-11-27-oozoofrog-unicode-posts]]

For a film based on the author’s chronology, [[2026-11-27-unicode-chronology-film-research]] identifies the original cross-reference row for 一, the source separation example and the evidence for dating the Seoul meeting.

The Unicode 1.0 chronology follows 一 from a modern character to the first-edition tables. The full cut and the Short share the spoken introduction. [[2026-11-27-unicode-chronology-release]]

The Unicode research companion maps the full source chronology to six stories and identifies dated records for the people in the closing section. [[2026-11-27-unicode-source-chronology-and-people]]

The Unicode chronology pairs a synthesized tungso and janggu sanjo score with primary-sourced cards for Korean CJK-JRG and Hangul contributors (Oh Young-taik, Lee Choon Tack, and Kyongsok Kim) and distinguishes *PC Magazine* columnist John C. Dvorak from keyboard inventor August Dvorak. [[2026-11-28-unicode-tungso-sanjo]] · [[2026-11-28-unicode-korean-figures-and-dvorak]]

The post-credits cookie (`쿠키 · 오늘의 유니코드`) summarizes Unicode 18.0 (`172,808` characters), `175` encoded scripts (`172` CLDR 49 base languages), the Toto script (`~1,500` speakers, `31` characters), and Han (`102,999`) vs. Hangul (`11,739`) character counts across both editions. [[2026-11-28-unicode-cookie-stats]]

Both the Unicode chronology full edition (`https://youtu.be/eVXZMR9GoK8`, `PT7M13S`) and Short (`https://www.youtube.com/shorts/UvNizJ4WiqE`, `PT2M51S`) are published publicly on channel `UCCtGyB0lbnsT0ES0Yuwhwjg` inside playlist `유니코드 연대기` (`PLfEnlqRjmO_8`), with custom thumbnails (`1280x720` and `1080x1920`) and four published subtitle tracks (`ko`, `en`, `ja`, `zh-Hans`). [[2026-11-28-unicode-youtube-publication]]

All seven published Shorts (`SE-0001`–`SE-0006` and `unicode-1.0`) are also published as Korean-subtitled Instagram Reels on `@oozoofrog` (`https://www.instagram.com/oozoofrog/reels/`) in chronological order with `9:16` framing and custom `1080x1920` cover images (`DgRohDsx5oC` through `DgRq_zcBET7`). [[2026-11-28-instagram-reels-publication]]
