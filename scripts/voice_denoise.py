"""Suppress steady broadband hiss on mono PCM16 narration before loudness normalization."""
import subprocess
from functools import lru_cache
from array import array

FILTER = "afftdn=nt=w:nf=-40:nr=6:gs=5"


def _filter(pcm, rate, graph):
    return subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-f", "s16le", "-ar", str(rate),
         "-ac", "1", "-i", "pipe:0", "-af", graph, "-f", "s16le", "pipe:1"],
        input=pcm, stdout=subprocess.PIPE, check=True,
    ).stdout


@lru_cache(maxsize=8)
def _latency(rate):
    # Measure the installed filter at the input rate, including its frame buffering.
    pulse = array("h", [0]) * rate
    middle = rate // 2
    pulse[middle] = 28000
    response = array("h", _filter(pulse.tobytes(), rate, FILTER))
    return max(range(len(response)), key=lambda i: abs(response[i])) - middle


def denoise_voice(pcm, rate):
    if not pcm:
        return pcm
    delay = _latency(rate)
    # Flush the filter and discard its leading delay, keeping the last vowel and cue times.
    clean = _filter(pcm, rate, f"apad=pad_len={delay},{FILTER},atrim=start_sample={delay}")
    if len(clean) != len(pcm):
        raise ValueError("Denoising changed the narration length")
    return clean
