---
title: Narration and voice review
type: concept
created: "2026-11-26"
updated: "2026-11-26"
aliases: ["음성과 발음"]
tags: [swift-evolution, production]
sources: ["2026-11-26-decision-journal.md", "2026-11-26-editorial-guide.md", "2026-11-26-decision-journal-pacing.md", "2026-11-26-colleague-delivery.md", "2026-11-26-reading-ko.md", "2026-11-26-voice-reference-ko.md", "2026-11-26-script-language-and-time.md"]
---

# Narration and voice review

The creator rejected the exaggerated clone performance and reported low playback volume in a later clip. Use direct speech as the reference for tone. Keep code spelling in captions. Give the speech engine a language and a spoken reading for each phrase. The local Qwen encoder now normalizes loudness. Check the final audio track. Automatic transcription checks wording; only listening can assess the performance and resemblance.

Use measured speech cues for [[visual-direction]]. Record listening feedback through [[production-instructions]].

Coach one stress word per thought. Keep a question open long enough for the viewer to inspect the code. Leave 0.45 seconds after statements and 0.65 after questions when another sentence follows. The current landscape and portrait scene gaps are 1.30 and 1.10 seconds. The existing episode was retimed with its original synthesized speech. Source noise and synthetic artifacts remain separate diagnostic possibilities.

Use the creator’s phrasing “보이죠? 쏙 빠져요.” as the example for a shared discovery. Give each sentence one job: point at the code or explain what changed.

## Source snapshots

- [Snapshot of decision-journal](../sources/2026-11-26-decision-journal.md)
- [Snapshot of editorial-guide](../sources/2026-11-26-editorial-guide.md)

- [Pacing and delivery review](../sources/2026-11-26-decision-journal-pacing.md)
- [Colleague delivery feedback](../sources/2026-11-26-colleague-delivery.md)

- [Korean reading sheet with breath cues](../sources/2026-11-26-reading-ko.md)

- [Reference recording and separate synthesis script](../sources/2026-11-26-voice-reference-ko.md)

Apply korean-product-writing to narration, captions and screen copy. Name the code element and what it does. Use a conversational Korean sentence with one main point. Use the same term for the same concept. Separate what the proposal requested, what shipped in a dated release, and what a current compiler accepts. For pending work, describe its verified status and use conditional language for its possible effects. Apply RFC 2119 distinctions when a requirement could be confused with a recommendation or permission. Adapt ASD-STE100 clarity principles to spoken Korean. Keep English pronunciation in English speech segments. Where a single clipped word sounds abrupt, use a short meaningful phrase. Keep literal code in code panels. [Source](../sources/2026-11-26-script-language-and-time.md)
