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

Current production defaults add 0.45 seconds after a completed sentence and 0.65 after a question within the scene. Allow 1.30 seconds between landscape scenes and 1.10 seconds between portrait scenes. Keep a mid-sentence language change or reveal cue connected. Check the rendered audio at a scene boundary because the source can already contain silence.

Write as if two colleagues are looking at the same line of code. The creator's reference is “보이죠? 쏙 빠져요.” Let the first sentence direct attention and the next describe what changes. Keep technical nouns exact and use conversational Korean endings. Vary confirmation questions across the episode.

For a human recording, provide a separate Korean reading sheet. Mark a comfortable inhale and a listener's silent beat differently. Keep instructions off the spoken line and keep the reveal verb attached to its subject. Use emphasis sparingly. [SE-0001 recording script](../episodes/SE-0001/reading-ko.md)

## 2026-11-26 · Series theme

Use the series name “듣다 보면 잠이 오는 스위프트 에볼루션 훑어보기”. Keep the approved conversational voice and the pause after the opening question. Show the series name as a small opening label and use a concrete language change as the thumbnail headline.

The creator approved the finished SE-0001 style. Use the opening question, the pause for inspection, the change timed to the spoken answer, and the brief chronology as the reference sequence for future episodes.

## 2026-11-26 · On-screen term definitions

Write for beginner and intermediate Swift developers. When a technical term first appears, show a short Korean definition tied to the code on screen. Anchor the note to a matching subtitle phrase. Keep the opening puzzle free of clues until the answer begins. Apply the same rule independently to Shorts.

## 2026-11-26 · Historical narration and pronunciation

Apply korean-product-writing to narration, captions and screen copy. Name the code element and what it does. Use a conversational Korean sentence with one main point. Use the same term for the same concept. Separate what the proposal requested, what shipped in a dated release, and what a current compiler accepts. For pending work, describe its verified status and use conditional language for its possible effects. Apply RFC 2119 distinctions when a requirement could be confused with a recommendation or permission. Adapt ASD-STE100 clarity principles to spoken Korean. Keep English pronunciation in English speech segments. Where a single clipped word sounds abrupt, use a short meaningful phrase. Keep literal code in code panels.
