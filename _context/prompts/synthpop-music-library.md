# Prompt · Quiet synth-pop background music library

Build a small, reproducible library of quiet, catchy synth-pop instrumentals for the
Swift Evolution video series in /Volumes/eyedisk/develop/content/swift-evolutions.

## Creator decisions (fixed)

- The library MUST hold at least 6 tracks.
- Mix two moods:
  - **Late-night dream-pop:** soft pads, slow bell or pluck hook, close to the series
    name "듣다 보면 잠이 오는 스위프트 에볼루션 훑어보기".
  - **Bright city-pop:** clearer, lighter hook and groove that stays restrained under speech.
  Give each mood at least 3 tracks. Keep a shared family sound (tempo range, synth palette)
  so the series stays coherent across both moods.

## Context you MUST read first

- src/remotion/components/BackgroundMusic.tsx: the track loops for the whole edition.
  The gain is 0.26 and drops to 0.17 from 0.18 s before each subtitle cue until 0.55 s after it.
- src/lib/music.ts and assets/music/: tracks are resolved by file name from
  script.json `backgroundMusic`.
- Narration stems and cue times: episodes/SE-0005..SE-0007/audio/{long,short}/
  (*.soft.m4a, manifest.json). These are what the music must not mask.
- _context/production-journal.md entry "2026-11-27 · Add a quiet house score to SE-0005"
  for the current loudness reference (−17.3 LUFS landscape, −17.5 LUFS Short).

## Deliverables

1. Source, not just audio: for each track, a deterministic generator (MIDI or score data,
   synth patch parameters and a render script) under assets/music/src/<track>/, so any
   track can be regenerated or edited. Write intermediates and caches under
   /Volumes/eyedisk/tmp or /Volumes/eyedisk/build.
2. Rendered loops in assets/music/<track>.m4a. Each loop MUST start and end on a bar
   boundary. Each loop MUST repeat without a click, gap or level jump.
3. assets/music/catalog.json with mood (dream-pop or city-pop), BPM, key, loop length,
   energy and a one-line character for each track.
4. A short Korean report for the creator with listening links and measurements.

## Musical constraints

- The hook MUST stay recognizable at the ducked gain (0.17).
- Leave the 1–4 kHz narration intelligibility band mostly clear under speech (EQ carve).
- Vary something every 4–8 bars so the loop stays engaging over a 4-minute edition.
- City-pop tracks MUST meet the same masking limit as dream-pop tracks.

## Experiments you MUST run and decide from

Report what you observed for each experiment.

- Synthesis route: prototype at least two routes, for example FluidSynth with an SF2
  against numpy or SuperCollider subtractive synthesis. Choose on reproducibility, timbre
  and render time.
- Masking: mix each candidate under the SE-0005, SE-0006 and SE-0007 narration with the
  production ducking curve. Measure the ASR word error rate (Whisper or the project's local
  aligner) with and without music. Measure the integrated LUFS and true peak of the mix.
  Reject candidates that raise WER noticeably. State the threshold you used and why.
- Loop seam: render 3 consecutive repeats. Check the waveform and spectrogram at each seam.
- Tempo and density: for each mood, try at least two tempos in the 85–115 BPM range and
  two hook densities. Recommend one setting per mood based on the masking and loudness results.
- End-to-end: assign one new track to SE-0007. Render it with `pnpm evo render SE-0007`.
  Run `pnpm evo check-video SE-0007`.

## Decisions you MUST leave to the creator

- Which track goes to which episode.
- Final taste judgments: which hooks are catchy and which tracks to keep.
  Present a shortlist per mood with listening copies mixed under real narration.

## Rules

- Original composition only. Do not imitate a specific existing song, artist or hook.
- Do not replace or delete the existing tracks (evening-keys.m4a, quiet-pulse.m4a).
- Separate what you measured, what you rendered and what still needs the creator's
  listening judgment. A measurement cannot establish that a track sounds pleasant.
- After the creator chooses, record the adopted method in the production journal and wiki.
  Follow AGENTS.md.
