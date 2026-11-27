"""Gently extend the last audible vowel in a mono PCM16 sentence."""
from array import array
from math import sqrt


def soften_ending(pcm, rate):
    samples = array("h", pcm)
    block = max(1, rate // 100)
    levels = [sqrt(sum(v * v for v in samples[i:i + block]) / block)
              for i in range(0, len(samples), block)]
    threshold = max(50, max(levels, default=0) * 0.04)
    active = [i for i, level in enumerate(levels) if level > threshold]
    if not active:
        return pcm
    # Crossfade two pitch-aligned windows inside the last voiced portion.
    end = min(len(samples), (active[-1] + 1) * block) - 2 * block
    blend = 2 * block
    if end < 10 * block:
        return pcm
    left = samples[end - blend:end]
    def mismatch(lag):
        right = samples[end - blend - lag:end - lag]
        return sum((a - b) ** 2 for a, b in zip(left[::4], right[::4]))
    lag = min(range(4 * block, 6 * block + 1), key=mismatch)
    start = end - blend
    mixed = array("h", (round((a * (blend - 1 - i) + b * i) / (blend - 1))
                        for i, (a, b) in enumerate(zip(left, samples[start-lag:end-lag]))))
    return (samples[:start] + mixed + samples[end-lag:]).tobytes()
