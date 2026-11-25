import { checkVideo } from "./services/check-video";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import type { TtsProviderName, YouTubePrivacy } from "./config/env";
import {
  fetchProposalMarkdown,
  findProposal,
  getProposalGithubUrl,
  loadEvolutionFeed,
  syncEvolutionFeed,
} from "./lib/evolution";
import { parseProposalNumber, PROJECT_ROOT, type VideoFormat } from "./lib/paths";
import { computeProgressSummary, loadWorkspaceState } from "./lib/state";
import { formatChapterTimestamp } from "./lib/subtitle";
import { buildSceneTimeline, getEffectiveShortsScenes } from "./lib/timeline";
import { prepareStudioProps, renderEpisode } from "./services/renderer";
import {
  generateScriptWithLlm,
  loadAndValidateScript,
  scaffoldEpisode,
} from "./services/script-generator";
import { DEFAULT_RECORDING_SCRIPT, listAudioInputDevices, recordVoiceProfile, registerVoiceProfile } from "./services/voice-profile";
import { synthesizeEpisodeAudio } from "./services/tts/index";
import { runYouTubeAuthFlow } from "./services/youtube/auth";
import { uploadEpisodeToYouTube } from "./services/youtube/uploader";

function parseFormatOption(raw?: string): VideoFormat | "both" {
  const val = (raw ?? "both").trim().toLowerCase();
  if (val === "long" || val === "short" || val === "both") {
    return val;
  }
  throw new Error(`--format 값은 long, short, both 중 하나여야 합니다: "${raw}"`);
}

function formatBytesMb(bytes?: number): string {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const program = new Command();

program
  .name("se")
  .description("Swift Evolution을 16:9 + 9:16 Shorts 유튜브 영상으로 제작/업로드하는 CLI")
  .version("1.0.0");

program
  .command("sync")
  .description("swift.org에서 최신 evolution.json을 내려받아 data/state.json과 동기화합니다")
  .action(async () => {
    const { feed, addedCount, updatedCount } = await syncEvolutionFeed();
    console.log(chalk.green(`✔ Swift Evolution 피드 동기화 완료`));
    console.log(`  - 총 Proposal: ${feed.proposals.length}개`);
    console.log(`  - 신규 추가: ${addedCount}개 / 메타 갱신: ${updatedCount}개`);
    console.log(`  - Feed commit: ${feed.commit.slice(0, 10)} (${feed.creationDate})`);
  });

program
  .command("status")
  .description("전체 제작 및 업로드 진행률을 요약합니다")
  .option("--all", "rejected/withdrawn 등 전체 Proposal 포함", false)
  .option("--version <ver>", "특정 Swift 버전만 필터링 (예: 2.2, 6.0)")
  .action(async (opts: { all?: boolean; version?: string }) => {
    const feed = await loadEvolutionFeed();
    const state = await loadWorkspaceState();
    const summary = computeProgressSummary(feed, state, {
      includeAll: opts.all,
      version: opts.version,
    });

    console.log(chalk.bold.cyan("\nSwift Evolution 제작 현황"));
    console.log(
      `대상 범위: ${summary.includeAll ? "전체 Proposal" : "구현됨(implemented) 중심"}${
        summary.versionFilter ? ` · Swift ${summary.versionFilter}` : ""
      } (${summary.targetCount}개 / 전체 ${summary.totalFeedProposals}개)`,
    );
    console.log("─────────────────────────────────────────");
    console.log(`  pending     (미착수)    : ${summary.byStage.pending}`);
    console.log(`  initialized (초기화)    : ${summary.byStage.initialized}`);
    console.log(`  scripted    (대본 완료) : ${summary.byStage.scripted}`);
    console.log(`  voiced      (음성 완료) : ${summary.byStage.voiced}`);
    console.log(`  rendered    (렌더 완료) : ${summary.byStage.rendered}`);
    console.log(`  uploaded    (업로드)    : ${summary.byStage.uploaded}`);
    console.log("─────────────────────────────────────────");
    console.log(`  16:9 업로드 완료: ${summary.longUploadedCount}개 | 9:16 쇼츠 업로드 완료: ${summary.shortUploadedCount}개`);

    const statesList = Object.entries(summary.byProposalState)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");
    console.log(chalk.gray(`  피드 상태 분포: ${statesList}\n`));
  });

program
  .command("list")
  .description("Proposal 목록과 현재 제작 단계를 출력합니다")
  .option("--state <state>", "Proposal 상태 필터 (implemented, activeReview, rejected, all)", "implemented")
  .option("--version <ver>", "Swift 버전 필터 (예: 2.2)")
  .option("--stage <stage>", "제작 단계 필터 (pending, initialized, scripted, voiced, rendered, uploaded)")
  .option("--limit <n>", "표시 개수 제한", "25")
  .action(
    async (opts: { state: string; version?: string; stage?: string; limit: string }) => {
      const feed = await loadEvolutionFeed();
      const state = await loadWorkspaceState();
      const limit = Math.max(1, Number.parseInt(opts.limit, 10) || 25);

      const sorted = [...feed.proposals].sort(
        (a, b) => parseProposalNumber(a.id) - parseProposalNumber(b.id),
      );

      const filtered = sorted.filter((p) => {
        if (opts.state !== "all" && p.status.state !== opts.state) return false;
        if (opts.version && p.status.version !== opts.version) return false;
        const stage = state.episodes[p.id]?.stage ?? "pending";
        if (opts.stage && stage !== opts.stage) return false;
        return true;
      });

      const shown = filtered.slice(0, limit);
      for (const p of shown) {
        const ep = state.episodes[p.id];
        const stage = ep?.stage ?? "pending";
        const ver = p.status.version ?? p.status.state;
        const epNum = ep?.episodeNumber ? `#${String(ep.episodeNumber).padStart(3, "0")}` : "    ";
        console.log(
          `${chalk.bold(p.id)} ${chalk.gray(epNum)} [${ver.padEnd(11)}] (${stage.padEnd(11)}) ${p.title}`,
        );
      }
      console.log(chalk.gray(`\n표시: ${shown.length} / 조건 일치 ${filtered.length}개`));
    },
  );

program
  .command("next")
  .description("아직 업로드하지 않은 다음 Proposal을 보여줍니다")
  .option("--all", "implemented 외 상태도 포함", false)
  .option("--version <ver>", "특정 Swift 버전만 탐색")
  .action(async (opts: { all?: boolean; version?: string }) => {
    const { proposal, episodeNumber } = await findProposal("next", {
      includeAll: opts.all,
      version: opts.version,
    });
    const state = await loadWorkspaceState();
    const ep = state.episodes[proposal.id];

    console.log(chalk.bold.cyan(`\n다음 작업 대상: ${proposal.id} (EP.${String(episodeNumber).padStart(3, "0")})`));
    console.log(`  제목     : ${proposal.title}`);
    console.log(`  버전/상태: Swift ${proposal.status.version ?? "-"} (${proposal.status.state})`);
    console.log(`  현재 단계: ${ep?.stage ?? "pending"}`);
    console.log(`  원문 URL : ${getProposalGithubUrl(proposal)}`);
    console.log(chalk.gray(`\n시작 명령: pnpm evo init ${proposal.id}\n`));
  });

program
  .command("init")
  .argument("<idOrNext>", "Proposal ID (예: SE-0001, 1) 또는 next")
  .description("에피소드 폴더를 생성하고 proposal.md, prompt.md, 기본 script.json을 준비합니다")
  .option("--force", "기존 script.json을 기본 템플릿으로 덮어씁니다", false)
  .option("--all", "next 탐색 시 전체 Proposal 포함", false)
  .action(async (idOrNext: string, opts: { force?: boolean; all?: boolean }) => {
    const { proposal, feed, episodeNumber } = await findProposal(idOrNext, { includeAll: opts.all });
    const markdown = await fetchProposalMarkdown(proposal);
    const { scriptWritten, paths } = await scaffoldEpisode(proposal, episodeNumber, markdown, feed, {
      force: opts.force,
    });

    console.log(chalk.green(`✔ ${proposal.id} 에피소드 초기화 완료 (${paths.dir})`));
    console.log(`  - 원문 저장 : ${paths.proposalMd}`);
    console.log(`  - 프롬프트  : ${paths.promptMd}`);
    console.log(
      `  - 대본 JSON : ${paths.scriptJson} ${
        scriptWritten ? "(새로 생성됨)" : "(기존 파일 유지됨)"
      }`,
    );
    console.log(
      chalk.gray(
        `\n다음 단계:\n  1) AI 에이전트 또는 LLM('pnpm evo script ${proposal.id}')으로 script.json 작성\n  2) 'pnpm evo validate ${proposal.id}' 검증 후 'pnpm evo voice ${proposal.id}' 실행`,
      ),
    );
  });

program
  .command("script")
  .argument("<idOrNext>", "Proposal ID 또는 next")
  .description("설정된 LLM API(OpenAI/Anthropic/Gemini)로 script.json을 자동 생성합니다")
  .option("--provider <name>", "openai | anthropic | gemini")
  .option("--force", "기존 script.json이 있어도 덮어씁니다", false)
  .option("--all", "next 탐색 시 전체 Proposal 포함", false)
  .action(
    async (
      idOrNext: string,
      opts: { provider?: string; force?: boolean; all?: boolean },
    ) => {
      const { proposal, feed, episodeNumber } = await findProposal(idOrNext, {
        includeAll: opts.all,
      });
      const markdown = await fetchProposalMarkdown(proposal);
      await scaffoldEpisode(proposal, episodeNumber, markdown, feed, { force: false });

      if (!opts.force) {
        try {
          const existing = await loadAndValidateScript(proposal.id);
          if (!existing.koreanTitle.startsWith("[번역/작성 필요]")) {
            console.log(
              chalk.yellow(
                `⚠ ${proposal.id}/script.json이 이미 작성되어 있습니다. 덮어쓰려면 --force를 지정하세요.`,
              ),
            );
            return;
          }
        } catch {
          // continue generation
        }
      }

      console.log(chalk.cyan(`LLM으로 ${proposal.id} 대본 생성 중...`));
      const { script, provider } = await generateScriptWithLlm(
        proposal,
        episodeNumber,
        markdown,
        feed,
        { provider: opts.provider },
      );

      console.log(chalk.green(`✔ [${provider}] ${script.proposalId} script.json 생성 및 검증 완료`));
      console.log(`  - 한국어 제목: ${script.koreanTitle}`);
      console.log(
        `  - 16:9 씬 ${script.scenes.length}개 / 9:16 쇼츠 씬 ${getEffectiveShortsScenes(script).length}개`,
      );
    },
  );

program
  .command("validate")
  .argument("<idOrNext>", "Proposal ID 또는 next")
  .description("episodes/SE-XXXX/script.json의 스키마와 예상 재생 시간을 검증합니다")
  .action(async (idOrNext: string) => {
    const { proposal } = await findProposal(idOrNext, { includeAll: true });
    const script = await loadAndValidateScript(proposal.id);

    const longTimeline = buildSceneTimeline(script, "long");
    const shortTimeline = buildSceneTimeline(script, "short");

    console.log(chalk.green(`✔ ${script.proposalId} script.json 검증 통과`));
    console.log(`  - 제목     : ${script.koreanTitle}`);
    console.log(
      `  - 16:9 예상: ${longTimeline.scenes.length}개 씬 · 약 ${formatChapterTimestamp(
        longTimeline.totalDurationSec,
      )} (${longTimeline.totalDurationSec.toFixed(1)}초)`,
    );
    console.log(
      `  - 9:16 예상: ${shortTimeline.scenes.length}개 씬 · 약 ${shortTimeline.totalDurationSec.toFixed(
        1,
      )}초`,
    );
    if (shortTimeline.totalDurationSec > 58) {
      console.log(
        chalk.yellow(
          `  ⚠ 쇼츠 예상 길이가 ${shortTimeline.totalDurationSec.toFixed(
            1,
          )}초로 60초에 가깝습니다. TTS 후 59.5초를 넘지 않도록 줄이는 것을 권장합니다.`,
        ),
      );
    }
  });

const profile = program.command("voice-profile").description("로컬 내레이션용 목소리 등록");
profile.command("devices").action(async () => {
  for (const device of await listAudioInputDevices()) console.log(device.index, device.name);
});
profile.command("set <file>").option("--text <text>", "녹음의 실제 발화문").action(async (file, opts) => {
  const result = await registerVoiceProfile(file, opts);
  console.log(result.profile.audioPath, ...result.warnings);
});
profile.command("record").option("--device <index>", "마이크 번호", "0")
  .option("--text <text>", "녹음할 문장", DEFAULT_RECORDING_SCRIPT)
  .action(async (opts) => {
    console.log("지금부터 12초간 읽어 주세요.", opts.text);
    const result = await recordVoiceProfile({device: opts.device, seconds: 12});
    console.log(result.profile.audioPath, ...result.warnings);
  });

program
  .command("voice")
  .argument("<idOrNext>", "Proposal ID 또는 next")
  .description("script.json을 바탕으로 한국어 TTS 음성, 자막(.srt), 타임라인(manifest.json)을 생성합니다")
  .option("--format <fmt>", "long | short | both", "both")
  .option("--scene <ids...>", "선택한 장면만 다시 합성합니다 (--format long 또는 short)")
  .option("--tts <provider>", "qwen3-clone | qwen3-tts | edge | macos-say | openai | elevenlabs | custom | auto")
  .option("--voice <voice>", "TTS 음성 이름 또는 Voice ID")
  .option("--rate <rate>", "발화 속도 (예: +5%, +10%)")
  .option("--no-fallback", "Edge TTS 실패 시 macOS say 자동 폴백 비활성화")
  .action(
    async (
      idOrNext: string,
      opts: {
        format: string;
        scene?: string[];
        tts?: TtsProviderName;
        voice?: string;
        rate?: string;
        fallback: boolean;
      },
    ) => {
      const { proposal } = await findProposal(idOrNext, { includeAll: true });
      const format = parseFormatOption(opts.format);
      console.log(chalk.cyan(`${proposal.id} 음성 합성 시작 (format=${format})...`));

      const summaries = await synthesizeEpisodeAudio(proposal.id, {
        format,
        sceneIds: opts.scene,
        provider: opts.tts,
        voice: opts.voice,
        rate: opts.rate,
        fallback: opts.fallback,
      });

      for (const s of summaries) {
        console.log(
          chalk.green(
            `✔ [${s.format}] ${s.manifest.scenes.length}개 씬 · ${s.manifest.totalDurationSec.toFixed(
              2,
            )}초 (${s.manifest.provider}/${s.manifest.voice})`,
          ),
        );
        console.log(`  - 자막: ${s.subtitlesPath}`);
        for (const warn of s.warnings) {
          console.log(chalk.yellow(`  ⚠ ${warn}`));
        }
      }
    },
  );

program
  .command("studio")
  .argument("<idOrNext>", "Proposal ID 또는 next")
  .description("Remotion Studio를 열어 해당 에피소드를 브라우저에서 미리 봅니다")
  .option("--format <fmt>", "long | short", "long")
  .action(async (idOrNext: string, opts: { format: string }) => {
    const { proposal } = await findProposal(idOrNext, { includeAll: true });
    const format: VideoFormat = opts.format === "short" ? "short" : "long";
    const info = await prepareStudioProps(proposal.id, format);

    console.log(chalk.cyan(`Remotion Studio 실행 중: ${info.compositionId} (${proposal.id})`));
    if (!info.hasManifest) {
      console.log(
        chalk.yellow("  ℹ 아직 음성(manifest.json)이 없어 예상 길이 기준 무음 프리뷰로 열립니다."),
      );
    }

    const remotionBin = path.join(PROJECT_ROOT, "node_modules/.bin/remotion");
    await new Promise<void>((resolve, reject) => {
      const child = spawn(
        remotionBin,
        [
          "studio",
          "src/remotion/index.ts",
          `--public-dir=${info.audioDir}`,
          `--props=${info.propsPath}`,
        ],
        { cwd: PROJECT_ROOT, stdio: "inherit" },
      );
      child.on("exit", (code) => {
        if (code === 0 || code === null) resolve();
        else reject(new Error(`Remotion Studio가 종료 코드 ${code}로 끝났습니다.`));
      });
      child.on("error", reject);
    });
  });

program
  .command("check-video <id>")
  .description("렌더링된 영상과 음성, 자막, 용어 주석의 표시 시점을 확인합니다")
  .option("--format <fmt>", "long | short | both", "both")
  .action(async (id: string, opts: {format: string}) => {
    const format = parseFormatOption(opts.format);
    const formats: VideoFormat[] = format === "both" ? ["long", "short"] : [format];
    for (const item of formats) console.log(await checkVideo(id, item));
  });

program
  .command("render")
  .argument("<idOrNext>", "Proposal ID 또는 next")
  .description("16:9/9:16 MP4 영상과 PNG 썸네일을 렌더링합니다")
  .option("--format <fmt>", "long | short | both", "both")
  .option("--thumbs-only", "영상 대신 썸네일 PNG만 렌더링", false)
  .option("--no-thumbs", "썸네일 생성을 건너뜁니다")
  .option("--concurrency <n>", "Remotion 렌더 동시성 워커 수")
  .action(
    async (
      idOrNext: string,
      opts: { format: string; thumbsOnly?: boolean; thumbs: boolean; concurrency?: string },
    ) => {
      const { proposal } = await findProposal(idOrNext, { includeAll: true });
      const format = parseFormatOption(opts.format);
      const concurrency = opts.concurrency ? Number.parseInt(opts.concurrency, 10) : undefined;

      console.log(chalk.cyan(`${proposal.id} Remotion 렌더링 시작 (format=${format})...`));
      const results = await renderEpisode(proposal.id, {
        format,
        thumbsOnly: Boolean(opts.thumbsOnly),
        includeThumbs: opts.thumbs,
        concurrency,
        onProgress: (label, progress01) => {
          console.log(chalk.gray(`  [${label}] ${Math.round(progress01 * 100)}%`));
        },
      });

      for (const r of results) {
        console.log(
          chalk.green(
            `✔ [${r.format}] 렌더링 완료 (${r.durationSec.toFixed(1)}초 / ${r.totalFrames} frames${
              r.usedAudioManifest ? "" : " · 무음 프리뷰"
            })`,
          ),
        );
        if (r.videoPath) console.log(`  - 영상  : ${r.videoPath}`);
        if (r.thumbPath) console.log(`  - 썸네일: ${r.thumbPath}`);
      }
    },
  );

program
  .command("build")
  .argument("<idOrNext>", "Proposal ID 또는 next")
  .description("init -> (선택 --llm) -> validate -> voice -> render 파이프라인을 한 번에 실행합니다")
  .option("--format <fmt>", "long | short | both", "both")
  .option("--tts <provider>", "qwen3-clone | qwen3-tts | edge | macos-say | openai | elevenlabs | custom | auto")
  .option("--llm", "LLM API로 script.json 자동 생성 시도", false)
  .option("--provider <name>", "LLM provider (openai | anthropic | gemini)")
  .option("--force", "기존 script.json 재생성", false)
  .option("--all", "next 탐색 시 전체 Proposal 포함", false)
  .action(
    async (
      idOrNext: string,
      opts: {
        format: string;
        tts?: TtsProviderName;
        llm?: boolean;
        provider?: string;
        force?: boolean;
        all?: boolean;
      },
    ) => {
      const format = parseFormatOption(opts.format);
      const { proposal, feed, episodeNumber } = await findProposal(idOrNext, {
        includeAll: opts.all,
      });
      const markdown = await fetchProposalMarkdown(proposal);
      await scaffoldEpisode(proposal, episodeNumber, markdown, feed, { force: false });

      if (opts.llm) {
        await generateScriptWithLlm(proposal, episodeNumber, markdown, feed, {
          provider: opts.provider,
        });
      }

      const script = await loadAndValidateScript(proposal.id);
      if (script.koreanTitle.startsWith("[번역/작성 필요]") && !opts.llm) {
        console.log(
          chalk.yellow(
            `⚠ ${proposal.id}/script.json이 아직 기본 템플릿 상태입니다. --llm 옵션을 주거나 대본을 먼저 작성하면 더 완성도 높은 영상이 나옵니다.`,
          ),
        );
      }

      console.log(chalk.cyan(`1/2 음성 합성 (${proposal.id})...`));
      await synthesizeEpisodeAudio(proposal.id, { format, provider: opts.tts });

      console.log(chalk.cyan(`2/2 영상 렌더링 (${proposal.id})...`));
      const rendered = await renderEpisode(proposal.id, {
        format,
        onProgress: (label, p) => console.log(chalk.gray(`  [${label}] ${Math.round(p * 100)}%`)),
      });

      for (const r of rendered) {
        console.log(chalk.green(`✔ [${r.format}] ${r.videoPath ?? r.thumbPath}`));
      }
    },
  );

const youtubeCmd = program.command("youtube").description("YouTube OAuth 인증 관리");
youtubeCmd
  .command("auth")
  .description("Google OAuth 2.0 인증을 완료하고 secrets/youtube-token.json을 저장합니다")
  .action(async () => {
    const { tokenPath } = await runYouTubeAuthFlow();
    console.log(chalk.green(`✔ YouTube OAuth 인증 및 토큰 저장 완료: ${tokenPath}`));
  });

program
  .command("upload")
  .argument("<idOrNext>", "Proposal ID 또는 next")
  .description("렌더링된 영상/썸네일/자막을 YouTube에 업로드하고 재생목록에 추가합니다")
  .option("--format <fmt>", "long | short | both", "both")
  .option("--privacy <status>", "private | unlisted | public")
  .option("--publish-at <iso>", "예약 공개 시각 ISO 8601 (예: 2026-12-01T18:00:00+09:00)")
  .option("--dry-run", "실제 업로드 없이 메타데이터/파일 경로만 시뮬레이션 출력", false)
  .option("--force", "이미 업로드된 포맷도 다시 업로드", false)
  .option("--no-captions", "자막(.srt) 업로드를 건너뜁니다")
  .option("--no-playlist", "재생목록 자동 등록을 건너뜁니다")
  .action(
    async (
      idOrNext: string,
      opts: {
        format: string;
        privacy?: YouTubePrivacy;
        publishAt?: string;
        dryRun?: boolean;
        force?: boolean;
        captions: boolean;
        playlist: boolean;
      },
    ) => {
      const { proposal } = await findProposal(idOrNext, { includeAll: true });
      const format = parseFormatOption(opts.format);

      const results = await uploadEpisodeToYouTube(proposal.id, {
        format,
        privacy: opts.privacy,
        publishAt: opts.publishAt,
        dryRun: Boolean(opts.dryRun),
        force: Boolean(opts.force),
        captions: opts.captions,
        playlist: opts.playlist,
      });

      for (const res of results) {
        const p = res.payload;
        if (res.dryRun) {
          console.log(chalk.bold.yellow(`\n[DRY-RUN] ${p.script.proposalId} (${res.format}) 업로드 미리보기`));
          console.log(`  제목     : ${p.title}`);
          console.log(
            `  공개설정 : ${p.privacyStatus}${p.publishAt ? ` (예약 공개: ${p.publishAt})` : ""}`,
          );
          console.log(
            `  영상파일 : ${p.videoPath} (${
              p.videoExists ? formatBytesMb(p.videoSizeBytes) : "미생성"
            })`,
          );
          console.log(`  썸네일   : ${p.thumbPath} (${p.thumbExists ? "준비됨" : "없음"})`);
          console.log(`  자막파일 : ${p.subtitlesPath} (${p.subtitlesExists ? "준비됨" : "없음"})`);
          console.log(`  재생목록 : ${p.playlistNames.join(", ") || "없음"}`);
          console.log(`  태그     : ${p.tags.join(", ")}`);
          console.log(chalk.gray("  ── 설명 미리보기 ──"));
          console.log(
            p.description
              .split("\n")
              .map((line) => `  ${line}`)
              .join("\n"),
          );
        } else {
          console.log(chalk.green(`\n✔ [${res.format}] YouTube 업로드 완료: ${res.url}`));
        }
        for (const warn of res.warnings) {
          console.log(chalk.yellow(`  ⚠ ${warn}`));
        }
      }
    },
  );

program.parseAsync(process.argv).catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(chalk.red(`\n✖ 오류: ${message}\n`));
  process.exit(1);
});
