import math
import random
import sys
import unittest
from array import array
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from voice_denoise import denoise_voice


class VoiceDenoiseTest(unittest.TestCase):
    def test_hiss_attenuation_and_final_vowel_timing(self):
        rate = 24000
        rng = random.Random(17)
        voice_start = rate
        samples = array("h", (round(rng.gauss(0, 100)) for _ in range(rate * 2)))
        for i in range(voice_start, len(samples)):
            samples[i] += round(5000 * math.sin(2 * math.pi * 180 * i / rate))
        clean = array("h", denoise_voice(samples.tobytes(), rate))
        self.assertEqual(len(clean), len(samples))

        def difference(start, end):
            return 10 * math.log10(sum(x*x for x in clean[start:end]) /
                                    sum(x*x for x in samples[start:end]))
        self.assertLess(difference(rate//2, rate-1000), -3)
        self.assertLess(abs(difference(-1000, -100)), 0.5)
        onset = next(i for i, sample in enumerate(clean) if abs(sample) > 2200)
        self.assertLess(abs(onset - voice_start), rate//200)
