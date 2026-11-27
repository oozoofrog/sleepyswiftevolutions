# Swift Evolution editorial direction

## Open with a question the viewer can answer

Show the code promised by the title in the first shot. Ask one question that the viewer can answer by inspecting it. For SE-0001, show the old call and ask which two characters Swift 2.2 lets the caller remove. Give the viewer a beat to look before revealing the change.

YouTube describes the opening as a place to meet the expectation set by the title and thumbnail. It recommends examining audience retention and moving later highlights earlier when appropriate. The code question is our application of that guidance. Its effect on this series has yet to be measured. [YouTube audience retention guide](https://support.google.com/youtube/answer/9314415?hl=en)

## Let motion explain the change

Keep enough of the original object visible for the viewer to track it. In its calculus lesson, 3Blue1Brown unwraps concentric rings so the viewer can follow the connection between a circle and its area. Kurzgesagt describes choosing the visual idea for each scene during sketching. For a Swift proposal, identify the smallest visible change that explains the rule before choosing a transition. [3Blue1Brown, The Essence of Calculus](https://www.3blue1brown.com/lessons/essence-of-calculus/) · [Kurzgesagt production process](https://kurzgesagt.org/what-we-do?visit=videos)

For SE-0001, hold the call in place, highlight the two backticks around the argument label, then remove them as the narrator mentions their disappearance. Hold the result long enough to read. Use Swift orange for emphasis against graphite. Pair color with a label, shape change, or diff marker. These choices adapt Apple's guidance on purposeful motion and redundant color cues to a fixed video. [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion) · [Apple HIG, Color](https://developer.apple.com/design/human-interface-guidelines/color)

### Author a deletion reveal

Use the scene heading for the question. Split one line of source code into `codeReveal.parts`. Put each character or token that should disappear in its own `remove` object. Use strings for the surrounding code. For SE-0001 the parts are:

~~~json
["indexOf(value, ", {"remove": "`"}, "in", {"remove": "`"}, ": list)"]
~~~

Start a new speech segment with the word that triggers the change. Set `codeReveal.answerCue` to its full caption. In the local Qwen pipeline, the renderer uses the onset of that segment in the audio manifest. Studio estimates the timing before audio exists. Generate the audio again after changing the cue or narration.

## Narration and review

Use the tone of a developer explaining code to a colleague. Keep questions brief and give the answer in an ordinary speaking voice. The creator found the bright synthetic sample exaggerated and unlike their voice. Use the direct recording as the performance reference. Keep the spelling of Swift identifiers in captions and plan the spoken Korean and English separately. For example, display `indexOf` and read “index of.”

Review the opening at playback speed. Check that the viewer can see the relevant code when the question starts and can follow the change when the answer lands. A successful transcription checks the words. The creator's listening judgment determines whether the voice sounds like them.

## Introduce the proposal's history

Follow the opening question and reveal with a brief chronology. Identify the earliest documented proposal, when implementation was recorded, and the first release that shipped it. Name the Swift version. Use the proposal history and the official release announcement. For an unreleased or rejected proposal, show its documented status. Use only dates you can verify. [SE-0001 research and sources](production-journal.md)

Use short, staggered word motion for headings. Keep code in a stable monospaced layout. Apply the shared syntax palette to code panels, thumbnails and the opening reveal. Reserve Swift orange in the code reveal for the edit that the narration identifies.

### Coach emphasis and leave room for the next thought

Give each scene a deliveryNote. Pick one stress word per thought and one place to breathe. For a question, articulate the choice clearly and wait for the viewer. In a code reveal, keep the subject and its verb connected. Close a factual statement with a firm ending. Preserve the creator's everyday voice. The Qwen Base clone uses reference audio and spoken text; the delivery note guides the writer and the reference take.

Current production defaults add 0.57 seconds after a Korean sentence ending in 다, 0.45 after other declarative sentences and 0.65 after a question within the scene. Allow 1.30 seconds between landscape scenes and 1.10 seconds between portrait scenes. Keep a mid-sentence language change or reveal cue connected. Check the rendered audio at a scene boundary because the source can already contain silence.

Write as if two colleagues are looking at the same line of code. The earlier reference “보이죠? 쏙 빠져요.” guides pacing. The current preference uses 합니다체. Let the first sentence direct attention and the next describe what changes. Keep technical nouns exact and end each spoken Korean sentence and its caption with 다. Invite the viewer to consider a question indirectly.

For a human recording, provide a separate Korean reading sheet. Mark a comfortable inhale and a listener's silent beat differently. Keep instructions off the spoken line and keep the reveal verb attached to its subject. Use emphasis sparingly. [SE-0001 recording script](../episodes/SE-0001/reading-ko.md)

## 2026-11-26 · Series theme

Use the series name “듣다 보면 잠이 오는 스위프트 에볼루션 훑어보기”. Keep the approved conversational voice and the pause after the opening question. Show the series name as a small opening label and use a concrete language change as the thumbnail headline.

The creator approved the finished SE-0001 style. Use the opening question, the pause for inspection, the change timed to the spoken answer, and the brief chronology as the reference sequence for future episodes.

## 2026-11-26 · On-screen term definitions

Write for beginner and intermediate Swift developers. When a technical term first appears, show a short Korean definition tied to the code on screen. Anchor the note to a matching subtitle phrase. Keep the opening puzzle free of clues until the answer begins. Apply the same rule independently to Shorts.

## 2026-11-26 · Historical narration and pronunciation

Apply korean-product-writing to narration, captions and screen copy. Name the code element and what it does. Use a conversational Korean sentence with one main point. Use the same term for the same concept. Separate what the proposal requested, what shipped in a dated release, and what a current compiler accepts. For pending work, describe its verified status and use conditional language for its possible effects. Apply RFC 2119 distinctions when a requirement could be confused with a recommendation or permission. Adapt ASD-STE100 clarity principles to spoken Korean. Keep English pronunciation in English speech segments. Where a single clipped word sounds abrupt, use a short meaningful phrase. Keep literal code in code panels.

## Channel identity

The creator selected the sleeping frog from concept three and approved the simplified profile icon. Use muted Swift orange, closed eyelids and a short line for the book. Keep the banner sparse. Use the SVG masters for edits and the PNG exports for upload.

## 2026-11-26 · Episode titles

Use a concrete subject and a verb that names the change in episode titles. Reserve counts for an opening puzzle when the count helps the viewer inspect the code. For SE-0001, the creator chose “백틱이 사라졌다”. For a chapter about a naming decision, put the identifier or prefix under discussion in the chapter label.

## Series opening and closing

Open both formats on the episode’s code. Say “오늘도 코드 한 줄을 함께 살펴보겠습니다.” Pose one episode-specific puzzle using a declarative sentence and leave time to inspect the code. Close on the same example with the answer and its historical significance. End both the full episode and the Short with a spoken sentence that names the problem the proposal aimed to solve. Tie it to the opening example and check it against the proposal’s motivation. For a rejected or withdrawn proposal, describe the intended goal without implying it shipped. Leave the example on screen during the final breath. The creator chose the opening wording. When the presenter introduces a next step, use the intentional ending “-겠습니다”. Describe a visible operation in the present tense and an earlier decision in the past tense. Give the viewer a concrete clue and a pause. [Creator feedback and episode examples](../.wiki/sources/2026-11-27-narrator-intent.md)

## Tell the history behind each decision

Before writing each episode, build a sourced research.md in the episode folder. Read the earliest proposal, final text, meaningful diffs and pull requests, pitch and review exchanges, formal decision if available, implementation and release evidence. Trace the practical problem, attributed positions, alternatives, changes, decision scope and consequences into the long-form narration. Keep one reason in the Short. Record missing evidence. Label post-decision debates and example corrections explicitly. An implemented status alone does not explain who decided what or why.

## Introduce unfamiliar historical syntax

When a proposal removed an unfamiliar form, show the historical declaration with an era label before asking the viewer to reason about it. Walk through a small input and result, then introduce the terminology and disagreement. Return to the declaration and surviving behavior at the end.

## Identify people as they are mentioned

During each named mention, display the verified English name, platform and account handle with a sourced portrait. For a joint contribution show both people. Include profile links and the photo credits in the video description. Until a suitable portrait is available, keep the verified identification visible and record the missing photo.

Search for a photograph and verify that its terms permit commercial use. If the search does not establish permission, omit the photograph, show the verified name and account, and proceed without requesting a file from the creator.

When introducing a contributor, explain what they proposed, challenged, or announced. Use a short role label on the card and link their proposal or specific reply.

Give each spoken line a visual action. Stage new objects in reading order, then hold the result through the pause. Tie each code highlight to the expression discussed in that line.

Compare Korean declarative endings against the [approved sample](../episodes/SE-0003/out/new-reference-full-vowel.m4a). Listen for the final vowel before the pause.

Keep the actual code structure readable across alternative visual treatments. Preserve the same readable source, but choose the composition, material, point of view and sequence of actions for each style.

The current series baseline is to show the code and its observable result directly when viewers can follow the change on screen. Use a metaphor only to clarify a specific difficulty. When one is needed, start it in the script. Choose who or what changes, what stays behind, and what this means for a viewer. Check the depicted event against the corresponding code.

When a Korean metaphor depends on a social convention, identify an attested use, its speaker, listener and purpose before drafting dialogue.

Before writing the transition from a comparison to code, state what a listener would expect to happen next in the scene. Check whether the code addresses that expectation.

Use a quicker pace for Shorts. Preserve speech pitch and align captions and code motion with the accelerated audio.

For Korean cloned narration ending in 다, synthesize a following phrase and cut it at the aligned pause using the SE-0003 approved method. Review the released vowel at the final playback speed.

Reduce stationary hiss on the isolated synthesized voice before loudness normalization. Preserve the aligned vowel release and sample count. Compare noise, sibilants and breath at matching playback gain.

When noise is localized to the opening, audition the first sentence separately and retain the accepted next sentence in the comparison.

For hiss confined to the first sentence, use the approved lead-in retake as the listening reference.

For a Korean clone opening, synthesize the lead-in with the opening sentence, align both and cut in their shared pause. Keep later accepted sentences and their cue times when repairing an existing recording.

Render narration as selectable Korean, English, Japanese and Simplified Chinese caption tracks. Keep the narration text out of the picture. Preserve cue times for code highlights, definitions and contributor cards.

Each episode tells the history of a decision. Use the [research workflow](historical-research.md) and the episode notebook to reconstruct the contemporary problem, competing uses, and implementation.

Use Apple system typography for titles, names and explanation text. Use Menlo for Swift code. Allow Apple SD Gothic Neo to supply Hangul glyphs in code comments. Apply the same families in landscape, portrait and thumbnails. Use Atkinson Hyperlegible Next for contributor handles and compact proposal, episode and version labels.

## Publication after a YouTube API quota error

If the YouTube Data API reports a quota limit, continue the authorized publication in YouTube Studio in Chrome. Verify the active channel and the requested visibility. Check the upload receipt and the channel content list before uploading a file. When a video ID exists, open that video and complete only the missing items. Confirm the saved thumbnail, each published subtitle language, playlist membership and visibility after reopening Studio. Record any control Studio does not offer.

## Show what the code operates on

Use an observable result from the example’s domain when it helps the viewer understand the API. In SE-0005, first let the pencil settle at the point passed to `move(to:)`. Leave the paper blank through that cue. Show the paper airplane forming when the example adds segments and strokes the path. Keep the starting point visible as the narration returns to the argument label. [Creator feedback and episode evidence](../.wiki/sources/2026-11-27-domain-visuals.md)

## Time code changes and emphasis separately

Reveal the new listing when the example changes. Keep the code neutral through greetings and historical context. Mark the exact code fragment when the narrator identifies it. If the narrator names two lines in succession, time each one to its own reference. Verify the words against the final audio for each edition. [Creator feedback and SE-0005 example](../.wiki/sources/2026-11-27-spoken-code-references.md)

When one code example becomes another, keep shared letters visible as they move to their new positions. Let removed punctuation recede and introduce new punctuation at its destination. Leave time to read the edited expression. [SE-0005 research and example](../.wiki/sources/2026-11-27-glyph-motion.md)

Use an entrance and exit at scene and explanatory graphic changes. For the first SE-0005 drawing, introduce the surface, then the point, then the pencil. Reserve the actual stroke for the drawing instruction. [Creator feedback and example](../.wiki/sources/2026-11-27-drawing-entrance.md)

On the first spoken reference to a code fragment, fade a background in behind just those characters. On later references to the same spelling, enlarge the text briefly and return it to its original size. Track mentions across scenes within each edition. [Creator decision and sample](../.wiki/sources/2026-11-27-pinpoint-code-emphasis.md)

When content continues into the next layout, keep it visible and move or resize it from its outgoing bounds. Reveal new content from the edge facing the retained item. Check the frames immediately before, during and after the change in each aspect ratio. [Creator feedback and rendered examples](../.wiki/sources/2026-11-27-shared-layout.md)
