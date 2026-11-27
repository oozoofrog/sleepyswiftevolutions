import type { SubtitleCue } from "../../schema/script";

export interface TtsSynthesizeOptions {
  voice?: string;
  rate?: string;
  customSourceDir?: string;
  format?: "long" | "short";
  sceneId?: string;
}

export interface TtsSynthesizeResult {
  endingDigest?: string;
  audioPath: string;
  durationSec: number;
  cues: SubtitleCue[];
  provider: string;
  voice: string;
}

export interface TtsProvider {
  readonly name: string;
  synthesize(text: string, outMp3Path: string, options?: TtsSynthesizeOptions): Promise<TtsSynthesizeResult>;
}
