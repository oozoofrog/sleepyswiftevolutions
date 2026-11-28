import fs from "node:fs/promises";
import path from "node:path";
import type { EpisodeScript } from "../schema/script";
import { PROJECT_ROOT } from "./paths";

/** Shared background music library. Every episode reads its track from here. */
export const MUSIC_DIR = path.join(PROJECT_ROOT, "assets/music");

/**
 * Makes the script's background track reachable from the episode's Remotion public directory.
 * An episode file with the same name takes precedence. Otherwise a temporary entry for the
 * shared library is created as a hard link (a copy across volumes). Remotion's bundler
 * does not follow symlinks. Call the returned function to remove the temporary file.
 */
export async function linkBackgroundMusic(
  script: Pick<EpisodeScript, "backgroundMusic">,
  publicDir: string,
): Promise<() => Promise<void>> {
  const music = script.backgroundMusic;
  if (!music) return async () => {};
  const file = typeof music === "string" ? music : music.file;
  const target = path.join(publicDir, file);
  try {
    await fs.lstat(target);
    return async () => {};
  } catch {}
  const source = path.join(MUSIC_DIR, file);
  try {
    await fs.access(source);
  } catch {
    throw new Error(`배경 음악 ${file}을 찾지 못했습니다. ${MUSIC_DIR}에 파일을 넣어 주세요.`);
  }
  await fs.mkdir(publicDir, { recursive: true });
  await fs.link(source, target).catch(() => fs.copyFile(source, target));
  return async () => { await fs.rm(target, { force: true }); };
}
