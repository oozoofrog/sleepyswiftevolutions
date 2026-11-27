"""Replace an opening in an existing voice stem and preserve all subsequent PCM samples."""
import argparse
import subprocess
import wave
import numpy as np


def decode(source):
    return np.frombuffer(subprocess.check_output([
        "ffmpeg", "-v", "error", "-i", source, "-ac", "1", "-ar", "44100",
        "-f", "s16le", "-"
    ]), "<i2")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("original")
    parser.add_argument("take")
    parser.add_argument("output")
    parser.add_argument("--slot", type=float, required=True, help="End of first sentence in stem seconds")
    parser.add_argument("--take-duration", type=float, help="Use only the opening of a longer approved take")
    args = parser.parse_args()
    original, take = decode(args.original), decode(args.take)
    if args.take_duration:
        take = take[:round(args.take_duration*44100)]
    slot = round(args.slot*44100)
    if not 0 < slot < len(original) or not len(take):
        raise ValueError("Invalid first sentence bounds")
    if len(take) > slot:
        tempo = len(take)/(slot-1024)
        take = np.frombuffer(subprocess.run([
            "ffmpeg", "-v", "error", "-f", "s16le", "-ar", "44100", "-ac", "1", "-i", "-",
            "-af", f"atempo={tempo}", "-f", "s16le", "-"
        ], input=take.tobytes(), stdout=subprocess.PIPE, check=True).stdout, "<i2")
    if len(take) > slot:
        raise ValueError("Retake exceeds its original time slot")
    source_level = np.percentile(np.abs(original[:slot].astype(float)),90)
    level = np.percentile(np.abs(take.astype(float)),90)
    if min(source_level,level) <= 0:
        raise ValueError("Cannot match silent opening")
    first = take.astype(float)*source_level/level
    loud = np.abs(first)>28000
    first[loud] = np.sign(first[loud])*(28000+4000*np.tanh((np.abs(first[loud])-28000)/4000))
    out = original.copy()
    out[:slot] = 0
    out[:len(first)] = first.astype("<i2")
    assert np.array_equal(out[slot:], original[slot:])
    with wave.open(args.output, "wb") as target:
        target.setparams((1,2,44100,0,"NONE",""))
        target.writeframes(out.tobytes())


if __name__ == "__main__":
    main()
