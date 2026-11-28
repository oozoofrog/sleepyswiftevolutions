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

## 2026-11-26 · SE-0003 version comparison

The review identified two comparisons with different questions. The historical parameter and modern local variable preserve the caller’s integer. The separate inout example changes it. Both formats return to the caller’s value at the close and identify the tested toolchain. The decision scene places parameter removal and pattern retention side by side as independent outcomes. [Verification and sources](../episodes/SE-0003/research.md).

## 2026-11-26 · Contributor context, voice and music in SE-0003

The creator requested an explanation of contributors, described the narration as pipe-like, and asked for a softer lo-fi sound, aged visuals and comfortable music. The production choice was warm ink, a fine stationary grain, Korean serif headings, a dry voice EQ and an original sparse keyboard arrangement. The revised contributor cards link each name to a role. [Sources and soundtrack](../episodes/SE-0003/research.md). Perceived comfort awaits creator listening.

## 2026-11-26 · SE-0003 value motion

The creator asked to apply Disney animation principles. We used anticipation, arcs, slow in and slow out, and mild squash and stretch to distinguish two outcomes. The local example holds the caller at 1. In the inout example the return trip brings 2 back to the caller. [Motion source](../src/remotion/components/ParameterValueFlow.tsx).

## 2026-11-26 · Direct every line

The creator requested more dynamic object entrances and a visual action for each line. SE-0003 now has 26 directed landscape cues and 15 portrait cues. The cue index selects the code panel, highlighted rows and order of visual stages.

## 2026-11-26 · Korean declarative endings

The creator requested a slightly longer final 다 and a gentler break. SE-0003 preserves the existing voice take, extends the audible ending by approximately 40–60 ms and adds 120 ms between sentences in the same scene. The local Qwen path applies the same treatment to future Korean declarative endings. [Audio treatment](../scripts/sentence_ending.py).

## 2026-11-26 · Audible final vowel

The creator heard only the initial consonant of 다 in the new voice sample. For a second sample, we synthesized the same two lines with a following phrase, cut during the pause, and raised the level of the ending. Local ASR recognized both lines. The creator has not evaluated the vowel in this take. [Sample](../episodes/SE-0003/out/new-reference-full-vowel.m4a).

The creator subsequently approved this sample. Use its vowel release as the listening reference for future takes.

## 2026-11-26 · SE-0003 approved voice render

Both formats now use the new local voice profile. We synthesized each distinct line with a following phrase and used forced alignment to locate the pause. We removed the following phrase and raised the level of the release. The first copy example uses the approved reading of “숫자 하나” so the input value is clear. All four subtitle languages follow the revised speech timing.

## 2026-11-26 · Three art direction studies

The creator requested visual alternatives. Three 13-second studies use the same narration and score from the local-copy scene. Letterpress separates the values with a diagonal ink field. An orbital chart sends a satellite from the caller. Mechanical counters show the local wheel advancing. These are candidates pending creator selection. [Study source](../episodes/SE-0003/style-studies/render.py).

## 2026-11-26 · Code-first visual comparison

The creator rejected the first three studies. For the next comparison they requested forty alternatives in one film with a common readable code structure. The plate on the right varies while the source and active lines stay in the same location. Each study reuses the same approved audio. No new art direction has been selected.

## 2026-11-26 · Independent staging for visual alternatives

The creator rejected the common diagram in the forty-study reel. The replacement uses separately staged scenes, including eight camera plates generated for this study, and a shared historical-code reprise. The original reel remains as a comparison. The creator has not selected a new series style.

## 2026-11-26 · Forty spoken metaphors

The creator asked for variety in what the work says. Each study now tells its own two-sentence story with a new local voice take. The voice and original music tie the film together. The written Swift 2 recap follows each story. Review found mismatches in the porthole, comic, punch card and mountain scenes. We corrected their on-screen actions. [Scripts](../episodes/SE-0003/style-studies/metaphors.json). Creator selection remains open.

## 2026-11-26 · Research before metaphor drafting

The creator rejected the credibility of the scripts and asked to research Korean social expressions first. The initial investigation compares a greeting, an idiom, a meeting request and a Go review. No new take has been selected. [Evidence](../.wiki/sources/2026-11-26-korean-situated-speech.md).

## 2026-11-26 · Go review pilot for SE-0003

The 37-second pilot stages an illustrative Go review. The game record keeps the original move visible while the players try a connecting move on another board. The closing Swift 2 example distinguishes the parameter inside the function from the caller's variable. The pilot uses nine new narration lines. The creator has not yet reviewed this cut. [Reading script](../episodes/SE-0003/studies/baduk/lines.json) · [Pilot](../episodes/SE-0003/out/style-studies/SE-0003-baduk-review.mp4).

## 2026-11-26 · Listener expectations in the Go pilot

The creator felt the pilot came closer but still sounded constructed. Our reading is that the opening invites a question about a better move, while the ending answers a question about the record. A listener check is proposed and has not been run. [Research note](../.wiki/sources/2026-11-26-metaphor-and-inference.md).

## 2026-11-26 · Direct code with four graphic treatments

The creator reserved metaphor for concepts that need help. This revises the earlier story-first preference for the SE-0003 study. The new comparison holds source, voice and duration fixed. No visual style has been selected. [Comparison reel](../episodes/SE-0003/out/style-studies/SE-0003-code-only.mp4).

## 2026-11-26 · Creator feedback on the comparison reel

The creator endorsed the current direct-code approach as the working baseline and welcomed further refinement. The feedback applies to the approach across the four treatments. The choice of layout remains open. [Reviewed reel](../episodes/SE-0003/out/style-studies/SE-0003-code-only.mp4).

## 2026-11-26 · Four motion treatments of local mutation

The creator found the animation monotonous. The new reel tests rolling numerals, a traveling duplicate, staggered type and a two-track execution trace with the same sound and code. Frame inspection shows the second treatment keeps the caller visible while the duplicate moves. This is an editorial recommendation. Viewer comprehension and creator preference remain untested. [Motion reel](../episodes/SE-0003/out/style-studies/SE-0003-code-motion.mp4).

## 2026-11-26 · SE-0001 withdrawn for a script rewrite

The creator reported an opening-frame error and requested a rewrite at the depth of SE-0003. Chrome Studio showed both editions of SE-0001, long and short, as unlisted after the change. The new script starts with a search for 7, compares grammatical roles and the proposal's alternatives, and closes on two verified outputs. Existing audio and caption manifests refer to the previous script. Regenerate them before rendering this edition. [Reading script](../episodes/SE-0001/reading-ko.md) · [Research](../episodes/SE-0001/research.md).

## 2026-11-26 · Private review of episodes one and two

The creator asked for faster Shorts and found the earlier partial edit of episode two insufficient. The review version changes its hook and directs each spoken beat throughout the old declaration, text correction, proposed underscore notation and closing call. The voice takes for its historical discussion are retained. Both Shorts use 1.20× playback for review. The full-length cuts retain their original speech tempo.

## 2026-11-26 · Restore the approved Korean sentence ending

The creator reported clipped final vowels in the SE-0001 and SE-0002 review cuts. The standard clone path had used a short waveform extension. The approved SE-0003 assembly used a following phrase, forced alignment, a quiet cut and an ending-level ramp. The default aligned Korean clone now uses that method for sentences ending in 다. [Approved reference](../episodes/SE-0003/out/new-reference-full-vowel.m4a) · [Two-sentence check](../episodes/SE-0001/out/vowel-review/SE-0001-ending-sample.m4a).

The creator approved the new two-sentence sample and required machine and skill enforcement. The new voice, render and upload checks bind the reading to the audio and the rendered MP4 to the scene records. Approval applies to the sample. The four full edits remain review copies.

## 2026-11-26 · Broadband hiss in cloned narration

The creator reported audible noise. We applied conservative spectral attenuation to the clone stem. In 30 quiet 20 ms windows between -65 and -40 dBFS, the median level change was -1.50 dB. For 261 windows above -25 dBFS it was -0.006 dB. These windows include speech and breaths. This comparison does not isolate a noise source. [A/B evidence](../.wiki/sources/2026-11-26-clone-hiss.md). Creator listening review is pending.

## 2026-11-26 · First sentence hiss

The creator localized the noise to the first sentence and found the next sentence acceptable. For this listening trial, the synthesizer read a lead-in before the target sentence. We removed the lead-in at an aligned intersentence pause, matched the level of the replacement and retained the previous intersentence pause and second sentence sample-for-sample. The first 50 ms include different lead times and cannot establish noise reduction during speech. The source of the noise and acceptance of the new opening are unconfirmed. [Comparison take](../episodes/SE-0001/out/vowel-review/noise-review/opening-retake.wav).

The creator approved the opening retake. Use this sample as the listening reference for first-sentence hiss. [Approved opening](../episodes/SE-0001/out/vowel-review/noise-review/opening-retake.wav).

## 2026-11-26 · Opening retake applied to production

The creator requested tooling and regenerated 1/2 long and short editions. The voice job marks only the opening sentence of the actual first scene. The repair tool fits a replacement into the existing opening slot and keeps the remainder of the decoded stem sample-identical. Episode one long uses the accepted opening. Episode one short and episode two use new aligned takes. [Tool](../scripts/splice-opening.py) · [Reference](../.wiki/sources/2026-11-26-approved-opening-retake.md).

## 2026-11-26 · Opening-review publication

The creator requested publication of all four opening-review editions. YouTube accepted the SE-0001 long and Short and SE-0002 long uploads. The channel upload limit rejected the SE-0002 Short, and the API quota blocked caption insertion. The scheduled 27 November follow-up uses the [new release receipt](../data/opening-release-20261126.json) to resume publication without duplicating uploads.

## 2026-11-27 · Selectable captions

The creator asked to remove the permanent narration subtitles because separate caption files are available. Both video compositions now omit the subtitle bar. SE-0004 is the first edition rendered with this preference.

## 2026-11-27 · Historical narrative

The creator identified the discussion itself as the reason to watch. The first SE-0004 cut misdated the proposal to December. The earliest surviving November revision already records acceptance. The revised episode places the December exchange after that record and shows a real use of a custom postfix operator. See the [claim ledger](../episodes/SE-0004/research.md) and [series workflow](historical-research.md). The original decision date remains open.

## 2026-11-27 · End on the proposal’s goal

Creator feedback supersedes the generic sign-off in the previous bookend guidance. SE-0004 now ends both editions by naming the readability goal while the save and increment lines are visible. [Closing evidence](../episodes/SE-0004/research.md)

## 2026-11-27 · Studying technical endings

The creator found the current goal statement weak. Two references suggest distinct editorial choices. WWDC22 revisits the farm example and gives a criterion for choosing some or any. Rob Pike explains when his error writer loses information, giving readers a reason to choose a different approach. For SE-0004, test a closing that returns to the saved four and changed five, then names the return-value rule that the reader no longer needs to remember. This is a script candidate pending creator feedback. [WWDC22 transcript](https://developer.apple.com/videos/play/wwdc2022/110352/) · [Errors are values](https://go.dev/blog/errors-are-values)

## 2026-11-27 · SE-0004 closing revision

The latest local cut applies the example-based closing from the preceding study. The historical line returns on screen. The replacement first shows the save, then adds the increment. The last cue holds both resulting values while the narration explains the decision for the next reader. The Short compresses the comparison. [Episode script](../episodes/SE-0004/script.json)

## 2026-11-27 · Series type selection

The creator selected Apple system fonts and Menlo after comparing the specimens. This supersedes the provisional Nanum and D2Coding pairing. SE-0004 is the first rerender with this selection. [Specimen study](typography/reading-notes.md)

The creator then selected Atkinson for targeted use. Use Atkinson Hyperlegible Next for contributor handles and compact proposal, episode and version labels. The renderer bundles the variable font with its OFL license. A live render page reported the font loaded.

## 2026-11-27 · Continue SE-0004 publication in Chrome

The creator requested direct use of Chrome after a quota error. The uploader received video IDs for both private editions before quota errors prevented the remaining requests. Resume on the existing IDs in Studio and verify each saved item independently. [Creator request and Studio links](../.wiki/sources/2026-11-27-chrome-quota-fallback.md)

Chrome Studio verification: reopening each video showed private visibility, completed HD processing and an uploaded thumbnail. The long episode was in Swift Evolution 처음부터 끝까지. The Short was in Swift Evolution Shorts. Both subtitle tables showed published creator tracks for Korean, English, Japanese and Simplified Chinese. Korean also had a separate automatic track. The [local upload records](../data/state.json) now reflect the Studio results.

## 2026-11-27 · Opening-review publication completed

The creator requested immediate completion and cancellation of the 17:05 KST task. Chrome Studio accepted the SE-0002 Short after the API returned a quota error. Studio showed all four current editions as public with HD processing complete, custom thumbnails, playlist membership and published Korean, English, Japanese and Simplified Chinese subtitle tracks. Both predecessors of each edition were confirmed unlisted. The one-time task was deleted. [Release receipt](../data/opening-release-20261126.json)

## 2026-11-27 · Introduce the presenter’s next action

The creator corrected the shared opening from “오늘도 코드 한 줄을 함께 살펴봅니다.” to “오늘도 코드 한 줄을 함께 살펴보겠습니다.” This supersedes the earlier bookend wording. In SE-0005 the editor also revised the return to the opening code, replaced the instruction to think with a clue, and shortened the closing explanation. In future scripts, identify the speaker and the time of the action before choosing the verb ending. [Feedback](../.wiki/sources/2026-11-27-narrator-intent.md) · [Episode reading sheet](../episodes/SE-0005/reading-ko.md)

## 2026-11-27 · Show the drawing behind the path API

The creator requested drawing in SE-0005 and visuals that reflect the code’s domain. The editor chose a paper airplane because its outline and folds can be traced with straight path segments. In both formats a pencil lands on the destination before any ink appears. A second code panel shows a loop that adds and strokes the segments. The completed drawing stays visible when the original call returns. [Episode reading sheet](../episodes/SE-0005/reading-ko.md) · [Decision and evidence](../.wiki/sources/2026-11-27-domain-visuals.md)

## 2026-11-27 · Establish the language and purpose in SE-0005

The creator asked both what Objective-C is and why it matters in this episode. The earlier opening showed a Swift 2 call before establishing where it came from. The new opening in each edition identifies the language and toolkit, pairs the Objective-C and Swift 2 calls for the same point, and explains why Swift needed different import naming rules. The naming puzzle and paper-airplane example follow this introduction. [Episode reading sheet](../episodes/SE-0005/reading-ko.md) · [Historical sources](../episodes/SE-0005/research.md)

## 2026-11-27 · Clarify a word in the SE-0005 opening

The creator heard “남곤” as “남본” in the long episode. The editor rewrote the sentence around the two visible lines of code: the type identifies a point, and the method name repeats that word. The Short uses different wording. [Revised reading sheet](../episodes/SE-0005/reading-ko.md)

## 2026-11-27 · SE-0005 caption timing in the exported videos

The creator reported that the captions did not match the dialogue throughout the episode. The previous check compared subtitle files with the script. In this revision, the editor extracted the audio from both final videos and compared all 35 long-form sentences and 13 Shorts sentences with speech recognition, word alignment and the audio waveform. In the long edition, the March 3 cue began at 166.726 seconds while speech began at approximately 167.296 seconds. The Korean captions now follow 70 phrases in the long edition and 23 in the Short. Both editions omit the changing summary strip; the script still uses its directions to highlight the code. In addition to the selectable masters, the editor supplied Korean-captioned viewing copies that show the spoken phrases automatically. [Long SRT](../episodes/SE-0005/audio/long/subtitles.srt) · [Short SRT](../episodes/SE-0005/audio/short/subtitles.srt)

## 2026-11-27 · Keep landscape chapter titles visible

The creator reported clipped titles on the lower progress bar. The landscape layout truncated chapter names to one line even when the chapter occupied a short interval. Labels now wrap within duration-proportional segments, and the bars share a baseline. In SE-0005 the shortest segment shows “Swift 2의 그리기 코드” on two lines. [Korean-captioned edition](../episodes/SE-0005/out/SE-0005-16x9-ko.mp4)

## 2026-11-27 · Narrow the SE-0005 code background to the spoken phrase

The creator selected the third background study for the landscape comparison of the December draft and Swift 3. At “작업 그룹은 전치사를”, the draft row narrows to `To`. The Swift 3 row then narrows to `to: end` so the label and destination read together. The episode script binds both highlights to that narration cue. [Final comparison clip](../episodes/SE-0005/out/SE-0005-preposition-focus-ko.mp4) · [Episode reading sheet](../episodes/SE-0005/reading-ko.md)

## 2026-11-27 · Show the full line before narrowing the background

The creator asked to improve the full-line highlight alongside the selected word treatment. The SE-0005 landscape and portrait editions now reveal a bordered amber band from the line number to the far edge of the row. When narration selects another line, the previous band fades. A line shared by consecutive cues stays lit. In the landscape preposition comparison, the same band narrows to the spoken code and then opens back to the row. [First and second line in the drawing example](../episodes/SE-0005/out/SE-0005-line-highlight-ko.mp4) · [Preposition comparison](../episodes/SE-0005/out/SE-0005-preposition-focus-ko.mp4)

## 2026-11-27 · Bind code emphasis to the spoken reference

The creator requested motion when code changes and asked to delay highlights until the speaker identifies the code. This revises the earlier cue-level row treatment. The SE-0005 script now records references against the existing word alignment for each edition. Introductory remarks and historical context can show a neutral code panel. At the switch to Swift, a wipe reveals the code before the speaker identifies its first and second lines separately. [Rendered transition](../episodes/SE-0005/out/SE-0005-code-transition-ko.mp4)

## 2026-11-27 · Add a quiet house score to SE-0005

The creator noted that the episode had no music and asked for calm EDM with a memorable kick. The script had no background music asset. Both editions now use an original 100 BPM score with a four-on-the-floor kick, offbeat bass and a repeating synth motif. The music drops under the measured narration cues and recovers over the pauses. The final AAC mixes measured −17.3 LUFS for the landscape edition and −17.5 LUFS for the Short. The remux preserved the video packets and subtitle cues of both editions. [Mixed excerpt](../episodes/SE-0005/out/SE-0005-music-preview-ko.mp4) · [Score](../assets/music/quiet-pulse.m4a)

## 2026-11-27 · Track letters during code edits and slow the highlight

The creator preferred a character-level edit to the earlier wipe and found the highlight too fast. SE-0005 now measures each glyph in the two code layouts and animates retained, removed and inserted characters over 1.25 seconds. The row sweep now eases in and out over up to 0.95 seconds, previously 0.35 seconds. Shorter narration windows reserve time to read the result. [Research and footage](../.wiki/sources/2026-11-27-glyph-motion.md)

## 2026-11-27 · Introduce the drawing in stages

The creator requested transitions throughout and asked how the first drawing should appear. For SE-0005, the editor chose a fade through the existing background at each chapter boundary. The grid paper fades in with a small upward movement. The spoken reference to the point reveals its marker and coordinates. The reference to placing the pencil brings its tip to that point. The paper remains blank until the later instruction to connect the corners. The landscape and portrait editions use separate offsets measured against their narration. [First drawing in the landscape edition](../episodes/SE-0005/out/SE-0005-drawing-entrance-ko.mp4)

## 2026-11-27 · Mark the exact code fragment on its first mention

The creator removed full-row emphasis and asked for a small increase in text size on repeat mentions. This supersedes the SE-0005 row sweep and row-to-word comparison. Each edition tracks the exact, case-sensitive spelling across scenes. The production choice for repeats is one smooth pulse to 108% and back. In the public review scene, the first mention of `options` marks the seven letters. The second mention enlarges them. [Comparison clip](../episodes/SE-0005/out/SE-0005-pinpoint-ko.mp4)

## 2026-11-27 · Carry visible content into its next layout

The creator asked for continuity when a new item joins existing content. This updates the earlier chapter fade for SE-0005. The editor chose a 1.25-second move, with the existing code in front of the incoming paper or second listing. The wide composition narrows the listing and moves it left. The tall composition moves it down. First mentions and repeat mentions still follow the spoken references. [Examples and rationale](../.wiki/sources/2026-11-27-shared-layout.md)

## 2026-11-27 · Name the prefix in the array chapter

The creator found “줄이지 않기로 한 이름” awkward. The editor chose “배열 이름 앞의 NS” for the sixth chapter of SE-0005. It points to the first two letters of `NSMutableArray` on screen. The original decision deferred removal of Foundation prefixes to a separate proposal. The chapter label appears above the scene heading and in the progress bar. [Reading sheet](../episodes/SE-0005/reading-ko.md#6-배열-이름-앞의-ns) · [Episode research](../episodes/SE-0005/research.md)

## 2026-11-27 · Ink treatment for the Unicode chronology

The creator clarified that ink painting describes the treatment of the printed page. The illustrated landscape behind the first cut competed with the scan. The editor made three ten-second studies using the same printed row and the same narration, varying the placement of empty space, relative ink density and camera movement. The next full-cut treatment is open. [Study and sources](../.wiki/sources/2026-11-27-unicode-ink-studies.md)

## 2026-11-27 · Keep scan noise registered to printed type

The creator asked for natural decomposition and the noise of the first-edition scan. The editor extracted native image samples from the published PDF, moved the type with its surrounding pixels and used a separate drawn grid to explain the coordinates. A four-shot study includes a dedicated macro view of the stroke and the adjacent paper. Both character crops and the paper crop match their decoded source pixels. All three fragment partitions reassemble exactly at native resolution. [Source coordinates and verified outputs](../.wiki/sources/2026-11-27-unicode-scan-grain.md)

## 2026-11-27 · Continuous magnification for the Unicode stroke

The creator asked for a seamless high-resolution transition in the style of an infinite zoom painting. The editor registered four detail plates to the scan and brought them in with the magnification. The deepest view illustrates fine ink and paper texture. The comparison control follows the same camera with the recorded scan. At five tested magnifications the inward and outward frames match within the image window. [Film and test scope](../.wiki/sources/2026-11-27-unicode-continuous-zoom.md)

## 2026-11-27 · Resolve the stroke into Unicode characters

The creator asked for Unicode characters inside the zoom. The editor used the three original forms from the film, set their code points beneath them, and changed the narration and captions. At maximum magnification the characters fill the ink area. On the return they merge into the original stroke. [Clip and checks](../.wiki/sources/2026-11-27-unicode-glyph-zoom.md)

## 2026-11-27 · Build the stroke from irregular layers of type

The creator found the earlier zoom looked like an effect and the glyph placement too orderly. The editor replaced the fading images and grid with a single plate, placed 72 characters at varied sizes and angles and updated the narration. A local knockout showed that the same patch contributes ink at opening, intermediate and maximum magnification. [Clip and verification](../.wiki/sources/2026-11-27-unicode-glyph-heap.md)

## 2026-11-27 · Match the illusion to the printed scan

The creator clarified that the distant view should read as original ink and that the close type looked too clean. The editor retained the scan through 4× and separated the emergence of fine marks from the later change in overall density. Both paper noise and irregular gray edges are anchored to the print. The small-view comparison, return check and rendered outputs are recorded in the [shot note](../.wiki/sources/2026-11-27-unicode-optical-print.md).

The creator approved the [13-second stroke zoom](../episodes/unicode-1.0/motion/grain.mp4) as the visual reference for this shot.

## 2026-11-27 · Open the chronology through 一 and name the actual operation

The creator requested a clean contemporary glyph that reveals worn printed characters as the camera approaches. The editor selected 一 and led into the 1986–1987 Xerox record. The creator also requested a lint failure for vague Korean wording such as “들어가느자리”. The revised Taiwan line names the two character numbers. The closing chapter names the return to the source table. The full cut and the Short carry the corrected text and recording. [Release, rule and verification](../.wiki/sources/2026-11-27-unicode-chronology-release.md)

## 2026-11-27 · Revise the Unicode transitions, music and Xerox title

The creator requested sanjo-style music, found the transitions awkward and rejected the previous Xerox heading. The editor carried the enlarged print into the Xerox layout, replaced the pulse track with an original synthesized score and gave Xerox and Apple separate chapter titles. The first historical title now reads “제록스의 중국어 글꼴 개발”. [Decision and outputs](../.wiki/sources/2026-11-27-unicode-sanjo-and-chapter-titles.md)

## 2026-11-27 · Restore the original chronology and the people behind it

The creator asked to read the English chronology first and distinguish each person’s documented role from recent public evidence. The revision separates the original Xerox task from the RLG CJK acquisition and adds the ISO ballot, the two-volume decision and a sourced epilogue. The research companion accounts for all 48 headings in the Korean article. [Research and sources](../.wiki/sources/2026-11-27-unicode-source-chronology-and-people.md)

## 2026-11-27 · Follow 一 into the printed Xerox name

The creator asked for a more natural invitation into the chronology and a continuous route from the stroke to the document. The narration introduces the meaning of 一 and takes the listener back to the period when the tables used different numbers. The visual edit registers the enlarged grain inside the X in Becker’s 1988 proposal. After the pullback the same excerpt stays on screen as the earlier Xerox mapping team is introduced. This replaces the previous shrinking exhibit for this episode. The reusable scan skill includes a PDF registration tool. [Source and checks](../.wiki/sources/2026-11-27-unicode-stroke-to-xerox.md)

## 2026-11-27 · Start from Becker’s dated proposal and follow the same ink

The creator asked to open on a dated proposal and to construct the first 一 from the letters seen in the enlargement. The editor chose the date on Becker’s proposal cover and reserved the present-day U+4E00 for the following line. Becker’s abstract leaves individual code assignments for later work. The renderer now samples one ink plate from the initial frame through the zoom. The earlier optical study remains the reference for weathered type. [Primary sources, camera and checks](../.wiki/sources/2026-11-27-unicode-dated-proposal-opening.md)

## 2026-11-27 · Refine the Unicode microtype ink layering and camera aperture

Production refinement (awaiting creator visual review): inspection of the previous opening frames showed three issues — the interrupted landscape delivery still carried missing glyphs on “조 베커”, opaque gray stamping plus hard stencil multiplication produced muddy mottled ink and straight-cut edge glyphs, and the `1132×360` stage window clipped both the macro glyph wall and the emerging serif `X` of “Xerox”. Updated [microtype.py](../episodes/unicode-1.0/microtype.py) to use optical overprinting, contour-hugging miniature glyphs without a guillotine edge, and scale-matched weathered letterpress stamps with spaced multilingual hero glyphs; opened [film_opening.py](../episodes/unicode-1.0/film_opening.py) and [document_zoom.py](../episodes/unicode-1.0/document_zoom.py) to a full-width paper aperture (`1280×502` landscape, `720×900` portrait, `PEAK_SCALE = 512`) with progressive opening draw-in. [check_opening.py](../episodes/unicode-1.0/check_opening.py), `lint-korean.ts`, and full stream/subtitle/audio checks passed on all four rendered editions and the [opening preview](../episodes/unicode-1.0/out/unicode-chronology-opening-ko.mp4). [Refinement note](../.wiki/sources/2026-11-27-unicode-microtype-aperture-refinement.md)

## 2026-11-27 · Open the Unicode chronology with Hangul ㄱ

The creator requested starting the Unicode chronology with Hangul `ㄱ` instead of `一`. Rebuilt the single microtype plate around a bold Myeongjo `ㄱ` (`U+3131`) whose upper-right calligraphic corner junction serves as the zoom target before pulling back out of the `X` in Becker’s 1988 Xerox excerpt. Updated `choose`, `travel`, and `volume` in [narration.tsv](../episodes/unicode-1.0/narration.tsv) (so Chapter 6 introduces `‘한 일’` directly for the Volume 2 Han chart), resynthesized those three lines with the local Qwen voice clone, confirmed recognition of “기역에도” via `qwen3-asr` after adding a comma pause, and verified all four re-rendered editions. [Source and checks](../.wiki/sources/2026-11-27-unicode-giyeok-opening.md)

## 2026-11-28 · Score the Unicode chronology for tungso

The creator requested traditional Korean sanjo played on tungso. The editor synthesized a new flute melody with janggu accompaniment and timed the ensemble entrance to the Xerox scene. Each edition has its own closing cadence. The [production note](../.wiki/sources/2026-11-28-unicode-tungso-sanjo.md) links the musical reference, both audio checks and the listening copy.

## 2026-11-28 · Add Korean contributors and distinguish John C. Dvorak in the Unicode chronology

The creator asked for primary sources on Korean contributors to Unicode 1.0 and whether the September 1992 *PC Magazine* figure was the Dvorak keyboard designer. Updated [film.py](../episodes/unicode-1.0/film.py), [narration.tsv](../episodes/unicode-1.0/narration.tsv), [produce.py](../episodes/unicode-1.0/produce.py), and [chronology.ko.md](../episodes/unicode-1.0/chronology.ko.md) to label columnist John C. Dvorak explicitly as distinct from keyboard designer August Dvorak on the `press` card, introduce Korean CJK-JRG delegation leader Oh Young-taik (`오영택`) and editorial subcommittee member Lee Choon Tack (`이춘택`) after the March 1992 URO scene (`krcjk`), and add epilogue cards for Lee Choon Tack (`afterchoontack`, Kongju National University Professor Emeritus) and Version 1.0 reviewer and Hangul Jamo encoding lead Kyongsok Kim (`afterkim`, Pusan National University Professor Emeritus). Removed an overlapping `groupkr` label from the `p013` exhibit scenes and shortened the portrait exhibit height so open Korean captions clear the source line. Synthesized the three new Korean lines with the local Qwen voice clone, verified wording via `qwen3-asr`, updated [unicode-tungso-sanjo.m4a](../episodes/unicode-1.0/out/unicode-tungso-sanjo.m4a), and verified all four rendered MP4 outputs (`371.17s` landscape at `-15.0 LUFS`, `134.21s` Short at `-15.1 LUFS`). [Sources and verification](../.wiki/sources/2026-11-28-unicode-korean-figures-and-dvorak.md)

## 2026-11-28 · Add a post-credits cookie on Unicode 18.0 scale and extremes

The creator requested adding a post-credits cookie after the people introductions covering the current Unicode version, how many languages it supports, the rarest language, and the language using the most Unicode characters.

- **Verified primary facts**: Unicode **18.0.0** (released September 16, 2026) encodes **172,808** graphic + format characters across **175** scripts (`Supported Scripts 18.0`), writing thousands of languages while **CLDR 49** (October 22, 2026) supports **172** base languages across `185` coverage locales (`821` language tags). Among living languages with their own dedicated script, **Toto (`txo`, `U+1E290–U+1E2BF`, 31 characters)** has roughly **1,500** speakers in one village in India (`L2/19-330`). East Asian shared **Han** leads overall with **102,999** characters (`59.6%`), and **Korean Hangul** leads single-language scripts with **11,739** characters.
- **Production choices**: Placed `credits` (`자료와 제작`) directly after `afterform`, followed by the `쿠키 · 오늘의 유니코드` chapter with four cards (`cookiever`, `cookielang`, `cookierare` displaying `art/toto18.png` from `U1E290.pdf` p. 2, and `cookiemost`) and a quiet `진양조` coda in [sanjo.py](../episodes/unicode-1.0/sanjo.py). When the initial full-length cookie pushed the Short to `195.0s` (exceeding YouTube Shorts’ `180s` cap), introduced four concise single-sentence Short rows (`scookiever`..`scookiemost`) sharing the same visual cards and adjusted Short `credits` to `2.5s`, bringing the Short to `170.625s` (`-15.1 LUFS`, 8 chapters) and the full cut to `431.958s` (`-15.0 LUFS`, 13 chapters). [Cookie sources and measurements](../.wiki/sources/2026-11-28-unicode-cookie-stats.md) · [Landscape master](../episodes/unicode-1.0/out/unicode-chronology-long.mp4) · [Short master](../episodes/unicode-1.0/out/unicode-chronology-short.mp4)

## 2026-11-28 · Publish the Unicode chronology episode and Short to YouTube

The creator asked to publish the Unicode chronology episode to YouTube first (`"일단 유니코드를 유튜브에 올려주세요"`).

- **Pre-flight checks and assets**: Checked existing channel uploads on `잠이오는 스위프트 진화의 역사` (`UCCtGyB0lbnsT0ES0Yuwhwjg`; 20 existing videos, zero prior Unicode uploads) and extracted muxed `ko`, `en`, `ja`, and `zh-Hans` SRT tracks (`71` cues per track for Long, `26` cues per track for Short) into [subtitles](../episodes/unicode-1.0/out/subtitles/). Generated custom archival thumbnails via [thumb.py](../episodes/unicode-1.0/thumb.py) using `AppleMyungjo` + `AppleSDGothicNeo` + `Menlo` (after catching `Menlo` tofu boxes on Korean characters in an early pass): [Landscape thumbnail](../episodes/unicode-1.0/out/unicode-chronology-thumb.jpg) (`1280x720`) and [Short thumbnail](../episodes/unicode-1.0/out/unicode-chronology-short-thumb.jpg) (`1080x1920`).
- **Publication and API-to-Studio completion**: [upload.ts](../episodes/unicode-1.0/upload.ts) created public playlist `유니코드 연대기` (`PLfEnlqRjmO_8`), uploaded `eVXZMR9GoK8` (`https://youtu.be/eVXZMR9GoK8`, `public`, `PT7M13S`) and `UvNizJ4WiqE` (`https://www.youtube.com/shorts/UvNizJ4WiqE`, `public`, `PT2M51S`), uploaded all 4 Long caption tracks and Short `ko`, and added both videos to `PLfEnlqRjmO_8`. After `thumbnails.set` returned `429 Too Many Requests` and Short `captions.insert` hit `403 quotaExceeded`, completed Long & Short custom thumbnail uploads (`저장` confirmed `"변경사항이 저장됨"` / `"모든 변경사항이 저장되었습니다."`) and Short's `en`, `ja`, and `zh-Hans` captions (`게시됨`) directly in Chrome YouTube Studio without duplicating video files. Reopened Studio for both videos and re-ran `--verify-only` to confirm `privacy=public`, `upload=processed`, `processing=succeeded`, `captions=en,ja,ko,zh-Hans` on both videos, and both items inside `PLfEnlqRjmO_8`. [Publication source record](../.wiki/sources/2026-11-28-unicode-youtube-publication.md) · [Upload receipt](../episodes/unicode-1.0/out/upload-receipt.json)

## 2026-11-28 · Publish all 7 published Shorts as Instagram Reels (`@oozoofrog`)

The creator asked to cross-publish all Shorts as Instagram Reels (`"쇼츠들을 릴스로도 올려주세요"`), choosing account `@oozoofrog` via Chrome (`"로그인완료"`), all 7 previously published vertical Shorts (`SE-0001`–`SE-0006` and `unicode-1.0`), and burned-in Korean subtitle editions (`SE-0004` exported with burned-in Korean subtitles via `ffmpeg-full`).

- **Pre-flight and Korean-subtitled asset check**: Confirmed `@oozoofrog` (`게시물 30`, zero existing Reels) before uploading, verified `1080x1920` cover images for all 7 episodes, and rendered [SE-0004 Korean-subtitled vertical export](../episodes/SE-0004/out/SE-0004-9x16-ko.mp4) (`21.78s`) from `episodes/SE-0004/audio/short/subtitles.srt` after checking a mid-video frame visually for clean lower-margin subtitle placement. Note that Instagram's web composer defaults to `1:1` crop until the aspect-ratio popover (`자르기 선택` -> `9:16 세로 방향 자르기 아이콘`) is explicitly applied in a separate UI step.
- **Chronological upload and verification**: Uploaded `SE-0001` through `unicode-1.0` sequentially in Google Chrome with `9:16` framing, custom `1080x1920` covers, linted Korean captions linking each full YouTube episode, and Facebook cross-posting turned off. Verified all 7 live Reels (`DgRohDsx5oC`, `DgRpCwYpIav`, `DgRprIZhKHJ`, `DgRp959PxgF`, `DgRqUvcMI0s`, `DgRqliypvlf`, `DgRq_zcBET7`) on `https://www.instagram.com/oozoofrog/reels/` (`게시물 37`), restored the pre-existing empty clipboard, removed the temporary staging folder, and saved all URLs and timestamps in [Reels receipt](../data/instagram-reels-receipt.json). [Publication source record](../.wiki/sources/2026-11-28-instagram-reels-publication.md)
