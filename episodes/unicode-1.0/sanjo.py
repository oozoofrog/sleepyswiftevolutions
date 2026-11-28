"""Original Korean Tungso Sanjo (퉁소 산조) score with Janggu accompaniment.

Models a wide-bore vertical notched bamboo flute (퉁소) in Gyemyeonjo (계면조,
tonal center D4 = 293.66 Hz, vibrating fourth A3 = 220 Hz) with:
- Continuous single-breath legato phrases, finger-hole grace articulations (타루),
  delayed wide Korean vibrato (농음/요성), and downward sighing inflections (퇴성/꺾는음)
- Bamboo bore resonances, notched embouchure breath turbulence (취구 김소리),
  and delicate sympathetic reed-membrane shimmer (청울림) on expressive swells
- Sanjo structural progression: unmetered 다스름 (before Xerox landing) ->
  진양조 -> 중모리 -> 중중모리 -> 자진모리 -> calm cadence, paired with soft 장구 strokes.
"""
import wave
import numpy as np
from scipy.signal import butter, lfilter, oaconvolve

RATE = 24000
TONIC_HZ = 293.66  # D4 (본청); A3 (-5 st = 220 Hz) is 떠는음; F4->E4 (+3->+2) is 꺾는음.

# Each note tuple: (offset_beats, duration_beats, pitch_st, style, dynamics)
# styles:
#   "plain"  : steady warm tone with gentle breath arc
#   "vib"    : delayed wide Korean yoseong/nongeum (떠는음 농음)
#   "kkeok"  : strike upper neighbor (+1.1 st) then sigh down (꺾는음/퇴성)
#   "slide"  : upward chuseong glide from -1.5 st into target (추성)
#   "grace"  : quick finger-hole tap (+2 st flick) at note onset (타루)

DASEUREUM_PHRASES = (
    # Phrase 1: Deep opening breath on A3 rising to tonic D4
    [(0.0, 1.3, -5, "vib", 0.72), (1.3, 2.2, 0, "plain", 0.82)],
    # Phrase 2: Upper fifth A4 sighing through F4->E4 back to D4
    [(4.6, 1.4, 7, "slide", 0.85), (6.0, 1.3, 2, "kkeok", 0.76), (7.3, 2.1, 0, "plain", 0.68)],
    # Phrase 3: Quiet low reflection before entering Xerox
    [(10.4, 1.5, 3, "plain", 0.74), (11.9, 1.2, 0, "grace", 0.70), (13.1, 2.4, -5, "vib", 0.78)],
)

JINYANG_PHRASES = (
    # 6-beat slow meditative phrases in Gyemyeonjo
    [(0.0, 2.2, -5, "vib", 0.76), (2.2, 1.5, 0, "slide", 0.82), (3.7, 2.0, 0, "plain", 0.72)],
    [(0.0, 1.6, 7, "slide", 0.88), (1.6, 1.4, 5, "grace", 0.78), (3.0, 1.2, 2, "kkeok", 0.75), (4.2, 1.5, 0, "plain", 0.68)],
    [(0.0, 1.8, 3, "plain", 0.78), (1.8, 1.4, 2, "kkeok", 0.74), (3.2, 1.1, 0, "grace", 0.72), (4.3, 1.4, -5, "vib", 0.76)],
    [(0.0, 1.5, 7, "vib", 0.86), (1.5, 1.3, 10, "kkeok", 0.90), (2.8, 1.4, 7, "grace", 0.80), (4.2, 1.5, 5, "plain", 0.70)],
)

JUNGMORI_PHRASES = (
    # 12-beat narrative walking phrases (grouped as 6+6 beats)
    [
        (0.0, 1.5, 0, "slide", 0.80), (1.5, 1.2, 3, "plain", 0.78), (2.7, 1.3, 5, "grace", 0.84),
        (4.0, 1.7, 7, "vib", 0.90), (6.2, 1.3, 10, "kkeok", 0.88), (7.5, 1.2, 7, "grace", 0.80),
        (8.7, 1.3, 2, "kkeok", 0.74), (10.0, 1.6, 0, "plain", 0.70),
    ],
    [
        (0.0, 1.8, -5, "vib", 0.78), (1.8, 1.1, -2, "plain", 0.74), (2.9, 1.5, 0, "grace", 0.82),
        (4.4, 1.3, 3, "plain", 0.78), (6.1, 1.4, 2, "kkeok", 0.76), (7.5, 1.3, 0, "grace", 0.75),
        (8.8, 2.7, -5, "vib", 0.76),
    ],
    [
        (0.0, 1.4, 7, "slide", 0.88), (1.4, 1.3, 12, "plain", 0.94), (2.7, 1.4, 10, "kkeok", 0.88),
        (4.1, 1.5, 7, "vib", 0.84), (6.0, 1.2, 5, "grace", 0.78), (7.2, 1.3, 2, "kkeok", 0.74),
        (8.5, 3.0, 0, "plain", 0.72),
    ],
)

JUNGJUNGMORI_PHRASES = (
    # 12-beat buoyant lilt with nimble finger-hole articulations
    [
        (0.0, 1.0, 0, "slide", 0.82), (1.0, 1.0, 3, "grace", 0.80), (2.0, 1.0, 5, "plain", 0.84),
        (3.0, 2.5, 7, "vib", 0.90), (6.0, 1.0, 10, "kkeok", 0.88), (7.0, 1.0, 7, "grace", 0.82),
        (8.0, 1.2, 5, "plain", 0.78), (9.2, 2.3, 0, "plain", 0.74),
    ],
    [
        (0.0, 1.5, 7, "grace", 0.86), (1.5, 1.5, 5, "plain", 0.80), (3.0, 1.5, 2, "kkeok", 0.78),
        (4.5, 1.2, 0, "grace", 0.76), (6.0, 1.5, -2, "plain", 0.72), (7.5, 1.5, 0, "slide", 0.80),
        (9.0, 2.5, -5, "vib", 0.78),
    ],
)


# Twelve subdivisions in four groups of three. The last group answers the
# opening low note and leaves room for the following phrase to breathe.
JAJINMORI_PHRASES = (
    [(0, 1, 0, "slide", .76), (1, 1, 3, "grace", .71), (2, 1, 5, "plain", .74),
     (3, 2, 7, "vib", .83), (5, 1, 5, "plain", .70), (6, 1, 3, "grace", .77),
     (7, 2, 2, "kkeok", .75), (9, 2.5, 0, "plain", .70)],
    [(0, 2, -5, "vib", .75), (2, 1, 0, "slide", .77), (3, 1, 3, "grace", .80),
     (4, 2, 5, "plain", .74), (6, 2, 7, "kkeok", .81), (8, 1, 2, "grace", .76),
     (9, 2.5, 0, "plain", .68)],
)


def _bandpass(sig: np.ndarray, low_hz: float, high_hz: float, order: int = 2) -> np.ndarray:
    nyq = RATE * 0.5
    b, a = butter(order, [max(20.0, low_hz) / nyq, min(nyq * 0.95, high_hz) / nyq], btype="band")
    return lfilter(b, a, sig)


def _lowpass(sig: np.ndarray, cutoff_hz: float, order: int = 2) -> np.ndarray:
    nyq = RATE * 0.5
    b, a = butter(order, min(nyq * 0.95, cutoff_hz) / nyq, btype="low")
    return lfilter(b, a, sig)


def _render_tungso_phrase(notes: list[tuple[float, float, float, str, float]], beat_sec: float, rng: np.random.Generator) -> tuple[float, np.ndarray]:
    """Synthesizes one continuous single-breath legato Tungso phrase."""
    start_beat = notes[0][0]
    end_beat = max(n[0] + n[1] for n in notes)
    tail_sec = 0.22
    dur_sec = (end_beat - start_beat) * beat_sec + tail_sec
    n_samples = max(64, round(dur_sec * RATE))
    t = np.arange(n_samples, dtype=np.float64) / RATE

    pitch_st = np.full(n_samples, float(notes[0][2]), dtype=np.float64)
    breath_env = np.zeros(n_samples, dtype=np.float64)
    chiff_env = np.zeros(n_samples, dtype=np.float64)

    for idx, (off_b, len_b, target_st, style, dyn) in enumerate(notes):
        t0 = (off_b - start_beat) * beat_sec
        note_dur = max(0.08, len_b * beat_sec)
        i0 = max(0, round(t0 * RATE))
        i1 = min(n_samples, round((t0 + note_dur) * RATE))
        if i1 <= i0:
            continue
        nt = np.arange(i1 - i0, dtype=np.float64) / RATE

        # Base pitch contour for this note
        local_st = np.full(i1 - i0, float(target_st), dtype=np.float64)

        if idx == 0:
            # Soft embouchure pitch settle on breath attack
            local_st -= 0.28 * np.exp(-nt / 0.045)
        else:
            # Legato finger transition from previous pitch
            prev_st = pitch_st[max(0, i0 - 1)]
            local_st += (prev_st - target_st) * np.exp(-nt / 0.026)

        if style == "slide":
            local_st -= 1.45 * np.exp(-nt / 0.14)
        elif style == "kkeok":
            # Strike upper neighbor then sigh gently downward (퇴성/꺾는음)
            local_st += 1.15 * np.exp(-nt / 0.16) - 0.18 * (1.0 - np.exp(-nt / 0.35))
        elif style == "grace":
            # Quick 45 ms finger-hole tap (타루)
            local_st += 1.85 * np.exp(-((nt - 0.032) / 0.020) ** 2)
        elif style == "vib":
            # Delayed wide Korean nongeum/yoseong vibrato
            vib_gate = np.clip((nt - 0.26) / 0.38, 0.0, 1.0)
            vib_rate = 3.7 + 0.65 * np.clip(nt / max(0.4, note_dur), 0.0, 1.0)
            vib_phase = 2.0 * np.pi * np.cumsum(vib_rate) / RATE
            local_st += vib_gate * 0.48 * np.sin(vib_phase)

        pitch_st[i0:i1] = local_st

        # Smooth breath pressure envelope per note within one continuous breath
        attack_tau = 0.085 if idx == 0 else 0.028
        note_env = dyn * (1.0 - np.exp(-nt / attack_tau))
        if style == "vib":
            vib_gate = np.clip((nt - 0.26) / 0.38, 0.0, 1.0)
            note_env *= 1.0 + 0.11 * vib_gate * np.sin(2.0 * np.pi * 4.0 * nt)
        elif style == "kkeok":
            note_env *= 1.0 - 0.22 * np.clip(nt / note_dur, 0.0, 1.0)

        # Tiny finger articulation dip between legato notes (no choppy silence)
        if idx > 0:
            note_env *= 1.0 - 0.26 * np.exp(-nt / 0.018)

        breath_env[i0:i1] = note_env

        # Embouchure chiff burst strongest on phrase breath onset, subtle on finger changes
        chiff_amp = 0.55 if idx == 0 else 0.14
        chiff_env[i0:i1] += chiff_amp * dyn * np.exp(-nt / (0.055 if idx == 0 else 0.022))

    # Hold final pitch during gentle breath release tail
    end_idx = min(n_samples, round((end_beat - start_beat) * beat_sec * RATE))
    if end_idx < n_samples and end_idx > 0:
        pitch_st[end_idx:] = pitch_st[end_idx - 1]
        tail_t = np.arange(n_samples - end_idx, dtype=np.float64) / RATE
        breath_env[end_idx:] = breath_env[end_idx - 1] * np.exp(-tail_t / 0.065)

    # Smooth breath pressure slightly so pressure transitions feel organic
    breath_env = _lowpass(breath_env, 18.0, order=1)
    breath_env = np.clip(breath_env, 0.0, 1.2)

    # Micro air-pressure humanization
    flutter = _lowpass(rng.normal(0.0, 1.0, n_samples), 7.0, order=1)
    freq = TONIC_HZ * (2.0 ** ((pitch_st + 0.035 * flutter) / 12.0))
    phase = 2.0 * np.pi * np.cumsum(freq) / RATE

    # Bamboo open-pipe harmonic synthesis shaped by warm wooden bore formants
    # Odd harmonics slightly stronger (notched vertical bamboo pipe character)
    harmonic_weights = (1.00, 0.62, 0.74, 0.34, 0.38, 0.16, 0.14, 0.06, 0.04)
    bore_tone = np.zeros(n_samples, dtype=np.float64)
    for h_idx, weight in enumerate(harmonic_weights, start=1):
        h_freq = freq * h_idx
        # Bamboo body resonances near ~360 Hz, ~840 Hz, and ~1580 Hz, rolling off gently above 2.4 kHz
        formant = (
            0.72
            + 0.95 * np.exp(-((h_freq - 360.0) / 190.0) ** 2)
            + 0.78 * np.exp(-((h_freq - 840.0) / 320.0) ** 2)
            + 0.42 * np.exp(-((h_freq - 1580.0) / 420.0) ** 2)
        ) / (1.0 + (h_freq / 2350.0) ** 2.6)
        # Expressive breath brightens upper harmonics naturally
        dyn_harm = breath_env ** (1.0 + 0.22 * (h_idx - 1))
        bore_tone += weight * formant * dyn_harm * np.sin(phase * h_idx + (0.25 * h_idx))

    # Notched embouchure breath turbulence (취구 김소리), jet-coupled to fundamental phase
    raw_air = rng.normal(0.0, 1.0, n_samples)
    edge_air = _bandpass(raw_air, 520.0, 2250.0, order=2)
    hollow_air = _bandpass(raw_air, 260.0, 680.0, order=2)
    jet_mod = 0.62 + 0.38 * np.sin(phase)
    breath_noise = (0.068 * breath_env * edge_air + 0.045 * breath_env * hollow_air) * jet_mod
    breath_noise += 0.085 * chiff_env * edge_air

    # Delicate Tungso cheong (청울림 — thin reed membrane sympathetic shimmer on expressive swells)
    cheong_drive = np.clip((breath_env - 0.68) / 0.30, 0.0, 1.0) ** 1.4
    if np.any(cheong_drive > 1e-3):
        cheong = np.tanh(2.4 * bore_tone) - bore_tone
        cheong = _bandpass(cheong, 1050.0, 2350.0, order=2)
        cheong_sig = 0.085 * cheong_drive * cheong
    else:
        cheong_sig = 0.0

    signal = bore_tone * 0.52 + breath_noise + cheong_sig
    # Fade first/last 8 ms to guarantee zero click
    fade = min(round(0.008 * RATE), n_samples // 4)
    if fade > 1:
        ramp = np.linspace(0.0, 1.0, fade)
        signal[:fade] *= ramp
        signal[-fade:] *= ramp[::-1]

    return start_beat * beat_sec, signal.astype(np.float32)


def _janggu_stroke(kind: str, rng: np.random.Generator) -> np.ndarray:
    """Synthesizes traditional Korean Janggu strokes: 'kung' (궁편), 'deok' (열편), 'deong' (합장단)."""
    dur = 0.72 if kind != "deok" else 0.32
    t = np.arange(round(dur * RATE), dtype=np.float64) / RATE
    out = np.zeros_like(t)

    if kind in ("kung", "deong"):
        # Warm deep leather bowl resonance (궁편, ~76 Hz with gentle pitch settle)
        f0 = 76.0
        for ratio, amp, decay in ((1.0, 0.90, 5.2), (1.58, 0.38, 8.5), (2.24, 0.14, 13.0)):
            inst_phase = 2.0 * np.pi * f0 * ratio * (t + 0.014 * (1.0 - np.exp(-28.0 * t)))
            out += amp * np.sin(inst_phase) * np.exp(-decay * t)
        thud = _lowpass(rng.normal(0.0, 1.0, len(t)), 260.0, order=2) * np.exp(-42.0 * t)
        out += 0.16 * thud

    if kind in ("deok", "deong"):
        # Crisp bamboo yeolchae stick tap on tightened skin (열편)
        f1 = 235.0
        stick = np.zeros_like(t)
        for ratio, amp, decay in ((1.0, 0.52, 16.0), (1.71, 0.34, 22.0), (2.63, 0.18, 30.0)):
            stick += amp * np.sin(2.0 * np.pi * f1 * ratio * t) * np.exp(-decay * t)
        snap = _bandpass(rng.normal(0.0, 1.0, len(t)), 650.0, 2400.0, order=2) * np.exp(-65.0 * t)
        out += (0.55 if kind == "deong" else 0.70) * (stick + 0.24 * snap)

    env = (1.0 - np.exp(-850.0 * t)) * np.clip((dur - t) / 0.08, 0.0, 1.0)
    return (out * env).astype(np.float32)


def _apply_wooden_room_ambience(dry_stereo: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Adds warm, natural hanok/wooden-hall early reflections and soft air without metallic ring."""
    ir_len = round(0.85 * RATE)
    t = np.arange(ir_len, dtype=np.float64) / RATE
    ir_l = np.zeros(ir_len, dtype=np.float64)
    ir_r = np.zeros(ir_len, dtype=np.float64)

    # Discrete wooden wall early reflections
    for delay_ms, gain_l, gain_r in (
        (19.0, 0.22, 0.14),
        (34.0, 0.12, 0.21),
        (53.0, 0.15, 0.11),
        (79.0, 0.09, 0.14),
    ):
        idx = min(ir_len - 1, round(delay_ms * 0.001 * RATE))
        ir_l[idx] += gain_l
        ir_r[idx] += gain_r

    # Smooth warm diffuse tail rolled off above 2.1 kHz
    tail_env = np.exp(-t / 0.21) * np.clip((t - 0.015) / 0.03, 0.0, 1.0)
    diff_l = _lowpass(rng.normal(0.0, 1.0, ir_len), 2100.0, order=2) * tail_env * 0.022
    diff_r = _lowpass(rng.normal(0.0, 1.0, ir_len), 2100.0, order=2) * tail_env * 0.022
    ir_l += diff_l
    ir_r += diff_r

    wet_l = oaconvolve(dry_stereo[:, 0], ir_l.astype(np.float32), mode="full")[: len(dry_stereo)]
    wet_r = oaconvolve(dry_stereo[:, 1], ir_r.astype(np.float32), mode="full")[: len(dry_stereo)]
    out = dry_stereo.copy()
    out[:, 0] = 0.84 * dry_stereo[:, 0] + 0.26 * wet_l
    out[:, 1] = 0.84 * dry_stereo[:, 1] + 0.26 * wet_r
    return out


def write_score(
    path,
    duration: float,
    landing: float,
    credits_start: float | None = None,
    cookie_start: float | None = None,
) -> None:
    rng = np.random.default_rng(1988)
    n_total = max(1, round(duration * RATE))
    mix = np.zeros((n_total, 2), dtype=np.float32)

    def place(at_sec: float, mono: np.ndarray, gain: float, pan: float) -> None:
        start = round(at_sec * RATE)
        if start >= n_total:
            return
        if start < 0:
            mono = mono[-start:]
            start = 0
        length = min(len(mono), n_total - start)
        if length <= 0:
            return
        left_g = gain * np.sqrt(0.5 * (1.0 - pan))
        right_g = gain * np.sqrt(0.5 * (1.0 + pan))
        mix[start : start + length, 0] += mono[:length] * left_g
        mix[start : start + length, 1] += mono[:length] * right_g

    # 1. 다스름 (Unmetered solo Tungso prelude floating across the opening zoom into Xerox)
    daseureum_span = max(8.0, landing - 0.6)
    scale_beat = daseureum_span / 16.0
    for phrase in DASEUREUM_PHRASES:
        onset_rel, sig = _render_tungso_phrase(phrase, scale_beat, rng)
        place(0.18 + onset_rel, sig, gain=0.92, pan=-0.06)

    # 2. Metered Sanjo progression from Xerox landing through 1992 resolution & epilogue
    at = landing
    ending = max(landing + 2.0, credits_start + 0.15) if credits_start is not None else max(landing + 2.0, duration - 4.8)
    body_span = max(1.0, ending - landing)
    cycle = 0

    while at < ending - 2.2:
        progress = np.clip((at - landing) / body_span, 0.0, 1.0)

        if progress < 0.36:
            # 진양조 (Slow 6-beat meditative breath)
            beat = 1.42 - 0.14 * (progress / 0.36)
            cycle_beats = 6.0
            bank = JINYANG_PHRASES
            janggu = [(0.0, "deong", 0.30), (4.0, "kung", 0.18), (5.0, "deok", 0.12)]
        elif progress < 0.76:
            # 중모리 (12-beat narrative walking jangdan with signature 9th-beat accent)
            sub = (progress - 0.36) / 0.40
            beat = 0.88 - 0.10 * sub
            cycle_beats = 12.0
            bank = JUNGMORI_PHRASES
            janggu = [
                (0.0, "deong", 0.32),
                (3.0, "deok", 0.13),
                (6.0, "kung", 0.22),
                (8.0, "deok", 0.24),
                (10.5, "kung", 0.14),
            ]
        elif progress < 0.88:
            # 중중모리 (12-beat buoyant lilt)
            sub = (progress - 0.76) / 0.12
            beat = 0.66 - 0.06 * sub
            cycle_beats = 12.0
            bank = JUNGJUNGMORI_PHRASES
            janggu = [
                (0.0, "deong", 0.34),
                (3.0, "kung", 0.20),
                (6.0, "kung", 0.22),
                (8.0, "deok", 0.25),
                (9.5, "kung", 0.15),
            ]

        else:
            beat = 0.36 - 0.035 * ((progress - 0.88) / 0.12)
            cycle_beats = 12.0
            bank = JAJINMORI_PHRASES
            janggu = [(0, "deong", .31), (3, "kung", .18), (6, "deok", .21),
                      (8, "kung", .12), (9, "deok", .17)]
        phrase = bank[cycle % len(bank)]
        # Clip phrase notes if approaching the final cadence
        avail_beats = (ending - 0.6 - at) / beat
        clipped = [(off, min(length, avail_beats-off), pitch, style, dyn)
                   for off,length,pitch,style,dyn in phrase if off < avail_beats-0.5]
        if clipped:
            onset_rel, sig = _render_tungso_phrase(clipped, beat, rng)
            place(at + onset_rel + float(rng.uniform(-0.02, 0.02)), sig, gain=0.95, pan=-0.06)

        for j_beat, kind, j_gain in janggu:
            hit_time = at + j_beat * beat + float(rng.uniform(-0.012, 0.012))
            if hit_time < ending - 0.5:
                place(hit_time, _janggu_stroke(kind, rng), gain=j_gain, pan=0.16)

        # Leave natural breathing room at end of each jangdan cycle
        at += cycle_beats * beat
        cycle += 1

    # 3. 종지 (Peaceful closing Tungso cadence settling on A3 -> tonic D4)
    cadence = [
        (0.0, 1.1, 2, "kkeok", 0.72),
        (1.1, 1.3, -5, "vib", 0.76),
        (2.4, 2.2, 0, "slide", 0.80),
    ]
    credits_span = (cookie_start - credits_start) if (cookie_start is not None and credits_start is not None) else 3.5
    cadence_beat = min(0.72, max(0.48, (credits_span - 0.1) / 4.8)) if cookie_start is not None else 0.85
    c_onset, c_sig = _render_tungso_phrase(cadence, cadence_beat, rng)
    place(ending + c_onset, c_sig, gain=0.88, pan=-0.04)
    place(ending, _janggu_stroke("kung", rng), gain=0.26, pan=0.14)

    # 4. Post-credits cookie coda (gentle 진양조 reflection returning to tonic D4)
    if cookie_start is not None and cookie_start < duration - 2.0:
        coda_at = cookie_start + 0.25
        coda_end = max(coda_at + 1.5, duration - 3.6)
        coda_beat = 1.36
        coda_idx = 0
        while coda_at < coda_end - 1.2:
            phrase = JINYANG_PHRASES[coda_idx % len(JINYANG_PHRASES)]
            avail_beats = (coda_end - 0.5 - coda_at) / coda_beat
            clipped = [
                (off, min(length, avail_beats - off), pitch, style, dyn)
                for off, length, pitch, style, dyn in phrase
                if off < avail_beats - 0.4
            ]
            if clipped:
                onset_rel, sig = _render_tungso_phrase(clipped, coda_beat, rng)
                place(coda_at + onset_rel, sig, gain=0.78, pan=-0.05)
            for j_beat, kind, j_gain in [(0.0, "kung", 0.18), (4.0, "deok", 0.10)]:
                hit_time = coda_at + j_beat * coda_beat
                if hit_time < coda_end - 0.4:
                    place(hit_time, _janggu_stroke(kind, rng), gain=j_gain, pan=0.15)
            coda_at += 6.0 * coda_beat
            coda_idx += 1
        coda_cadence = [(0.0, 1.1, -5, "vib", 0.70), (1.1, 1.9, 0, "slide", 0.76)]
        cc_onset, cc_sig = _render_tungso_phrase(coda_cadence, 0.80, rng)
        place(coda_end + cc_onset, cc_sig, gain=0.80, pan=-0.04)
        place(coda_end, _janggu_stroke("kung", rng), gain=0.18, pan=0.14)

    mix = _apply_wooden_room_ambience(mix, rng)

    # Set the music stem level before narration-controlled ducking in produce.py.
    rms = float(np.sqrt(np.mean(mix ** 2)))
    if rms > 1e-6:
        gain = 0.046 / rms
        mix *= gain

    # Gentle fade-out over the final 1.2 seconds
    fade_out = min(n_total, round(1.2 * RATE))
    if fade_out > 1:
        mix[-fade_out:] *= np.linspace(1.0, 0.0, fade_out, dtype=np.float32)[:, None]

    pcm = (np.clip(mix, -0.95, 0.95) * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as out:
        out.setparams((2, 2, RATE, 0, "NONE", ""))
        out.writeframes(pcm.tobytes())
