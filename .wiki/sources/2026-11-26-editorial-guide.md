---
type: chronicle
date: 2026-11-26
---

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
