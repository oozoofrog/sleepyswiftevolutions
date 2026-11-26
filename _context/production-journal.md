# Production journal

## 2026-11-26 · Narration

The creator heard too little resemblance in the first clone and found the brighter performance exaggerated. A direct microphone take established the reference delivery. Keep Korean explanations conversational and specify English readings separately from display text. Voice resemblance still requires the creator's judgment. [Direct recording sample](../episodes/SE-0001/out/SE-0001-voice-sample-direct.mp4)

The creator could barely hear a later synthesized sample. The rendered track measured −42.8 LUFS. Normalization brought the replacement to −15.3 LUFS. The Qwen encoder now applies loudness normalization to future scenes. [Corrected sample](../episodes/SE-0001/out/SE-0001-model-read-audible.mp4)

## 2026-11-26 · Opening and visual language

The creator requested a question viewers can solve, followed by motion that reveals the answer. The first episode holds a Swift call in place and removes two backticks on the spoken cue. The creator subsequently requested kinetic typography, a consistent color theme and syntax highlighting. The chosen implementation staggers the heading by word, keeps the code stationary and colors the source before and after the deletion using the Swift tokenizer. [Editorial guidance](editorial-direction.md)

## 2026-11-26 · Historical context

The creator requested a brief introduction to each proposal's origin, implementation and Swift release. Keep the original code question first. Follow its answer with a dated three-step summary before the detailed explanation. Use source dates only to the precision supported by each record.

For SE-0001, the first proposal document commit is dated 2015-11-04 UTC. The project recorded implementation on 2015-12-23 UTC. Swift 2.2 shipped with the feature on 2016-03-21. The first timestamp describes repository history. Public availability of that repository on that day is unverified. [Proposal commit](https://github.com/swiftlang/swift-evolution/commit/463051803866a2ab8e199f39b6c8c4d2ec5a0b4b) · [Implementation status commit](https://github.com/swiftlang/swift-evolution/commit/960107656dff24fbbf047c801a42f83c5eca1504) · [Swift 2.2 announcement](https://www.swift.org/blog/swift-2.2-released/)

Both full-length outputs rendered with the revised dates and palette. The 14.18-second portrait preview includes the code question and chronology. The long and short history frames were inspected. Type checking and six pipeline tests passed. [Opening preview](../episodes/SE-0001/out/SE-0001-opening.mp4)

## 2026-11-26 · Breathing room, noise and delivery

The creator reported rushed scene transitions, possible background noise and low energy in the synthetic delivery. Recut the existing SE-0001 speech at sentence boundaries and left the words and speaking rate intact. The first transition in the rendered Short measured 1.106 seconds below −42 dBFS, up from 0.456 seconds. The opening question has a 0.689-second measured pause. Future Qwen generation inserts sentence pauses and carries them into the captions. Added scene-level coaching notes for the writer and reference speaker. Perceived energy and resemblance await creator review.

The raw microphone recording measured −59.1 dBFS RMS over seconds 7–12 with no speech and −42.1 dBFS RMS over the selected speaking interval. A background signal exists. These measurements cannot identify its physical source or distinguish reference noise from synthesis artifacts in the voiced output. [Revised opening](../episodes/SE-0001/out/SE-0001-opening.mp4)

## 2026-11-26 · Colleague-to-colleague delivery

The creator gave “보이죠? 쏙 빠져요.” as the target voice. Revised the landscape and portrait scripts and their prompt guidance around that example. Recorded a new microphone take for the voice profile. Local ASR detected the opening question and the closing “쏙 빠져요”; it disagreed with the intended technical term in the middle. The profile transcript uses the intended term. The direct take and synthesized episode are separate review artifacts.

## 2026-11-26 · Human reading sheet

The creator wanted help with breathing and found acting cues awkward. The Korean recording sheet covers both editions. It marks physical breaths separately from time for the viewer to inspect the code. It keeps the shared opener and history in one place. The cues are for the reader, outside TTS input. [Recording script](../episodes/SE-0001/reading-ko.md)

## 2026-11-26 · Reference voice recording

The creator requested a dedicated reference script after finding the performed reading awkward. Use a short question and a conversational explanation with a comfortable breath between them. Test synthesis on different words so the creator can compare the delivery. [Recording and listening script](../episodes/SE-0001/voice-reference-ko.md)

## 2026-11-26 · Series theme

Use the series name “듣다 보면 잠이 오는 스위프트 에볼루션 훑어보기”. Keep the approved conversational voice and the pause after the opening question. Show the series name as a small opening label and use a concrete language change as the thumbnail headline.

## 2026-11-26 · First episode style approval

The creator approved the finished SE-0001 style. Use the opening question, the pause for inspection, the change timed to the spoken answer, and the brief chronology as the reference sequence for future episodes. Both final MP4 files decoded through the last frame with H.264 video and AAC narration.

## 2026-11-26 · On-screen term definitions

Write for beginner and intermediate Swift developers. When a technical term first appears, show a short Korean definition tied to the code on screen. Anchor the note to a matching subtitle phrase. Keep the opening puzzle free of clues until the answer begins. Apply the same rule independently to Shorts.

## 2026-11-26 · Historical narration and pronunciation

Apply korean-product-writing to narration, captions and screen copy. Name the code element and what it does. Use a conversational Korean sentence with one main point. Use the same term for the same concept. Separate what the proposal requested, what shipped in a dated release, and what a current compiler accepts. For pending work, describe its verified status and use conditional language for its possible effects. Apply RFC 2119 distinctions when a requirement could be confused with a recommendation or permission. Adapt ASD-STE100 clarity principles to spoken Korean. Keep English pronunciation in English speech segments. Where a single clipped word sounds abrupt, use a short meaningful phrase. Keep literal code in code panels.

## 2026-11-26 · Reusable episode tools

Use the voice command with one format and the changed scene IDs to preserve approved narration in the other scenes. Render that format, then use check-video to verify the media and captions. Use scene-clip to extract a listening sample from the rendered video. [Command reference](../README.md)

## 2026-11-26 · Channel identity

The creator selected the sleeping frog from concept three and approved the simplified profile icon. Use muted Swift orange, closed eyelids and a short line for the book. Keep the banner sparse. Use the SVG masters for edits and the PNG exports for upload.

## 2026-11-26 · Publication and caption languages

The creator intends to monetize the channel and approved public publication of the SE-0001 landscape episode and Short. Provide separate selectable Korean, English, Japanese and Chinese subtitle tracks. For the first episode, Chinese uses Simplified Chinese. Use the Korean SRT cue times for each translation. Check actual monetization eligibility in Studio.

## 2026-11-26 · Episode titles

Use a concrete subject and a verb that names the change in episode titles. Reserve counts for an opening puzzle when the count helps the viewer inspect the code. For SE-0001, the creator chose “백틱이 사라졌다”.

## 2026-11-26 · Source coverage

The creator requested all proposal documents and progress tracking. The download command verified 605 upstream files. Each feed ID tracks one landscape episode and one Short.

## 2026-11-26 · SE-0002

The opening hides the second call to show the function returned by the first call. The comparison then shows the change to the declaration. Both formats use the registered reference voice. Each has separate Korean, English, Japanese and Simplified Chinese SRT files. The production state records both local renders.

## 2026-11-26 · A recognizable beginning and ending

The creator asked for a consistent delivery style at both ends. In the first SE-0002 cut the demonstration ended at the value 5. The new close returns to the opening call and states what changed in the declaration. Both formats share a spoken invitation and sign-off. The exact phrases have not yet received creator feedback.

## 2026-11-26 · Korean sentence endings

The creator requested sentences ending in 다. SE-0002 now uses 합니다체 for the opening, body and closing in both formats. Keep the quiet pacing and use indirect questions to let viewers think before the reveal.

## 2026-11-26 · Research and narrate the deliberation

The creator requested that each episode explain the human discussion, revisions and decision as well as the code. SE-0002 now includes the author's rationale, a documented example correction and a separately dated follow-up debate. The research notes identify the missing separate decision announcement. Future script generation includes the episode's linked research notes.

## 2026-11-26 · A historical opening for SE-0002

The creator noted that current viewers may never have encountered the removed syntax and requested a reshoot. In both formats the historical declaration stays on screen while the two parameter groups are highlighted in turn. The initial calls appear with the matching speech cues. The last frame pairs the old declaration with the current call.

## 2026-11-26 · On-screen contributor identification

The creator requested English names, social IDs and photos during mentions. SE-0002 uses verified GitHub handles. The Swift.org archive supplies the Sadun photo and Wikimedia Commons supplies the credited Lattner portrait. Suitable portraits for Groff and De Franceschi remain open.

## 2026-11-26 · Portrait search concluded

The creator asked production to search independently and omit unavailable photos. The review of the [Joe Groff profile](https://github.com/jckarter), the [Davide De Franceschi profile](https://github.com/DeFrenZ), Wikimedia Commons and Openverse did not identify a portrait of either contributor with verified commercial reuse terms. Both appear by name and GitHub handle when mentioned.

## 2026-11-26 · SE-0002 publication

YouTube Studio confirmed public visibility for the [episode](https://youtu.be/yyuOi1WzzRA) and [Short](https://www.youtube.com/shorts/f_8nk8azIzw). Both subtitle pages listed published Korean, English, Japanese and Simplified Chinese tracks.

## 2026-11-26 · SE-0003 motion and music

The creator requested more varied motion graphics and quiet background music for this episode. The production direction pairs the local copy and write-back examples with different motions. Evaluation of the new music and motion belongs to the SE-0003 review. The project-local oozoofrog-mode draft draws on the established conventions from SE-0001 and SE-0002.

The creator selected the full production cycle as the scope of the project mode. SE-0003 rendered to 116.0 seconds in landscape and 50.63 seconds in portrait. The locally composed score uses soft sustained notes without percussion. The two cue-driven diagrams show assignment followed by local disposal or write-back. Both outputs passed the media check. The subtitle tracks share 25 landscape cues and 13 portrait cues per language. [Research and decision history](../episodes/SE-0003/research.md).
