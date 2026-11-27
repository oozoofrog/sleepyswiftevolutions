---
name: oozoofrog-mode
description: "Use when oozoofrog asks for /oozoofrog-mode or asks to work in their style on this Swift Evolution series."
---

# Working with oozoofrog on Swift Evolution

Read the [editorial guide](../../../_context/editorial-direction.md) before making an episode. Use the [production journal](../../../_context/production-journal.md) to learn why a direction changed.

- Find the decision behind the syntax. Trace the proposal, objections, revisions and release to their sources. Identify gaps in the record. For old syntax, show how one real input behaved at the time before introducing the modern form.
- Write the title around the change a viewer can name afterward. In the opening, give the viewer time to inspect the example. Keep the code in place while the relevant token or value moves with the narration. End both the full episode and the Short with a spoken sentence that names the problem the proposal aimed to solve. Tie it to the opening example and check it against the proposal’s motivation. For a rejected or withdrawn proposal, describe the intended goal without implying it shipped.
- Write for a colleague who may be seeing the feature for the first time. Use conversational 합니다체. Open with “오늘도 코드 한 줄을 함께 살펴보겠습니다.” During review, distinguish the presenter’s next action, the code’s behavior and past events. Use “-겠습니다” for the presenter’s next action. Define the first unfamiliar term on screen. Use the registered voice and leave breathing room between ideas. Check a spoken sample for mixed Korean and English pronunciation.
- Prepare a full episode and a Short. Check each rendered video and its Korean, English, Japanese and Simplified Chinese captions. When publication is requested, check existing video IDs first. Report verified public links and subtitle tracks separately from local render or API checks.
- When feedback changes a recurring choice, record the reason and the evidence in the journal and [wiki](../../../.wiki/index.md). Update the relevant authoring prompt. Keep a request for one episode with that episode until the user extends it to the series.


## Korean narration release check

For a Korean cloned sentence ending in 다, use the project voice command with the forced aligner enabled. The approved method synthesizes a following phrase and removes it at the aligned pause. Keep the per-scene verification digest produced by synthesis. A changed reading or changed audio file requires synthesis again. Use the render and upload checks on the same edition. For an independently packaged Short, check the exported sound at its final speed before posting it manually through Studio.

Listen to the [approved two-sentence sample](../../../episodes/SE-0001/out/vowel-review/SE-0001-ending-sample.m4a). Check the vowel after the consonant, the breath before the next sentence, and any leaked follow-on phrase. A transcript alone cannot establish audible vowel quality.

For cloned narration, use the built-in hiss reduction on the isolated voice. Compare a quiet passage and a sentence ending at matched gain before adding music. Preserve the original reference recording.

When hiss is reported only in the first sentence, compare that sentence separately. Preserve an accepted second sentence when producing the listening comparison. Use the [approved opening retake](../../../episodes/SE-0001/out/vowel-review/noise-review/opening-retake.wav) as the listening reference when trying a removable lead-in.

The voice command synthesizes a disposable lead-in on the first Korean cloned sentence of each edition when it opens in Korean. It removes the lead-in at the aligned pause. For an existing accepted stem, use scripts/splice-opening.py with the first sentence end relative to the stem. Verify the remaining samples and subtitle times before rendering.

## Historical episodes

For every episode, use the [historical research workflow](../../../_context/historical-research.md) before drafting. Verify one participant’s actual reasoning against a dated exchange and the decision timeline when sources survive. Carry the reason into the Short. Save later discoveries and corrections with their sources.

Use Apple system typography for titles, names and explanation text. Use Menlo for Swift code. Allow Apple SD Gothic Neo to supply Hangul glyphs in code comments. Apply the same families in landscape, portrait and thumbnails. Use Atkinson Hyperlegible Next for contributor handles and compact proposal, episode and version labels.

## Resume publication in Chrome

If the YouTube Data API reports a quota limit, continue the authorized publication in YouTube Studio in Chrome. Verify the active channel and the requested visibility. Check the upload receipt and the channel content list before uploading a file. When a video ID exists, open that video and complete only the missing items. Confirm the saved thumbnail, each published subtitle language, playlist membership and visibility after reopening Studio. Record any control Studio does not offer.
