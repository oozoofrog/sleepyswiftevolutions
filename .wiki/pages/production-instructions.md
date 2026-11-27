---
title: Production instructions
type: guide
page_kind: summary
created: "2026-11-26"
updated: "2026-11-27"
aliases: ["제작 지시사항"]
tags: [swift-evolution, production]
sources: ["2026-11-26-project-instructions.md", "2026-11-26-decision-journal.md", "2026-11-26-episode-tools.md", "2026-11-26-channel-publication.md", "2026-11-26-episode-titles.md", "2026-11-27-chrome-quota-fallback.md"]
---

# Production instructions

The creator wants conversation decisions to accumulate in the project. Keep the dated feedback and its outcome in the production journal. Promote reusable guidance to the editorial guide and authoring prompts. Update the wiki page that owns the topic. Record observed outcomes separately from user approval.

[[visual-direction]] and [[narration]] are examples of this workflow. Return to [[overview]] for the production path.

## Source snapshots

- [Snapshot of project-instructions](../sources/2026-11-26-project-instructions.md)
- [Snapshot of decision-journal](../sources/2026-11-26-decision-journal.md)

Use the voice command with one format and the changed scene IDs to preserve approved narration in the other scenes. Render that format, then use check-video to verify the media and captions. Use scene-clip to extract a listening sample from the rendered video. [Revision tools](../sources/2026-11-26-episode-tools.md)

The creator intends to monetize the channel and approved public publication of the SE-0001 landscape episode and Short. Provide separate selectable Korean, English, Japanese and Chinese subtitle tracks. For the first episode, Chinese uses Simplified Chinese. Use the Korean SRT cue times for each translation. Check actual monetization eligibility in Studio. [Source](../sources/2026-11-26-channel-publication.md)

Use a concrete subject and a verb that names the change in episode titles. Reserve counts for an opening puzzle when the count helps the viewer inspect the code. For SE-0001, the creator chose “백틱이 사라졌다”. [Source](../sources/2026-11-26-episode-titles.md)

Check advanced feature access before adding the full episode as the related video on a Short. [YouTube verification and Shorts links](../sources/2026-11-26-youtube-feature-access.md)

Use [[2026-11-26-proposal-archive]] for source verification and per-format production progress.

For the declaration and call distinction in episode 2, see [[2026-11-26-se-0002-history]].

Use the same spoken invitation and sign-off for both formats. Keep the question and closing answer specific to the episode. See the [opening and closing direction](../../_context/editorial-direction.md#series-opening-and-closing).

Research each proposal’s deliberation and revisions before scripting. Use the [SE-0002 evidence table](../../episodes/SE-0002/research.md) as an example. Put the supported story into narration. Distinguish a later conversation from the decision it followed.

For unfamiliar historical syntax, show a dated original example, explain how it behaved, and only then introduce the debate. See the SE-0002 reshoot in the [editorial guide](../../_context/editorial-direction.md#introduce-unfamiliar-historical-syntax).

Show the verified English name, account and sourced photo during named mentions. [Episode 2 photo and account references](../../episodes/SE-0002/research.md#on-screen-identities).

Search for a photograph and verify that its terms permit commercial use. If the search does not establish permission, omit the photograph, show the verified name and account, and proceed without requesting a file from the creator. See [[2026-11-26-se-0002-history]].

Invoke `$oozoofrog-mode` to apply the project’s series conventions. See [[2026-11-26-production-mode]].

The creator selected the full series production cycle as the scope of the project mode. The first episode made with the mode is [SE-0003](../../episodes/SE-0003/research.md).

Consider a present-day comparison when it answers the opening question. Keep the input and observation point fixed, and label the compiler used. The SE-0003 revision uses this format in its closing scene. See [[2026-11-26-swift-version-comparison]].

2026-11-27 · [[2026-11-27-history-as-narrative|Historical investigation and SE-0004 correction]]

2026-11-27 · [[2026-11-27-proposal-goal-closing|Proposal goal at the close]]

## YouTube quota errors

If the YouTube Data API reports a quota limit, continue the authorized publication in YouTube Studio in Chrome. Verify the active channel and the requested visibility. Check the upload receipt and the channel content list before uploading a file. When a video ID exists, open that video and complete only the missing items. Confirm the saved thumbnail, each published subtitle language, playlist membership and visibility after reopening Studio. Record any control Studio does not offer. [[2026-11-27-chrome-quota-fallback]]
