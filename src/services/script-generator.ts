import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "../config/env";
import { findNextProposalAfter, getProposalGithubUrl } from "../lib/evolution";
import { getEpisodePaths } from "../lib/paths";
import { maxStage, updateEpisodeState } from "../lib/state";
import type { EvolutionFeed, EvolutionProposal } from "../schema/evolution";
import { type EpisodeScript, EpisodeScriptSchema, type Scene } from "../schema/script";

import { getEffectiveShortsScenes } from "../lib/timeline";
export { getEffectiveShortsScenes };

/**
 * Generates a starter script.json template for manual or agent-assisted editing.
 */
const editorialGuide = "첫 질문과 답 직후, 제안서 최초 기록·구현 기록·해당 Swift 버전과 정식 출시 시기를 history 장면으로 짧게 소개하세요. milestones 배열에 확인된 사건을 시간순으로 최대 3개 넣으세요. 각 항목은 date(표시할 날짜), event(사건), sourceUrl(공식 출처 URL)로 구성합니다. 제안서 이력과 공식 출시 발표로 확인한 날짜만 쓰고, 미출시 제안은 확인된 상태까지만 소개하세요. 첫 화면에 제목이 약속한 코드를 보여주고, 시청자가 눈으로 답을 찾을 수 있는 질문을 하나 던지세요. 코드가 바뀌는 지점에 강조와 설명을 맞추세요. 동료에게 설명하듯 담백하게 읽고 감탄사로 흥을 내지 마세요. 삭제를 보여주는 첫 장면은 heading에 질문을 쓰고 codeReveal.parts에 한 줄의 코드를 순서대로 나누세요. 남길 부분은 문자열, 지울 부분은 {\"remove\":\"문자\"}입니다. 답이 들리는 단어로 새 speech 구간을 시작하고 그 caption 전체를 codeReveal.answerCue에 넣으세요.";

const speechGuide = `화면과 자막(narration)에는 원래 철자를 유지하세요. 한영 혼용 장면에는 speech 배열을 작성하세요. 각 구간의 caption을 순서대로 합치면 narration과 같아야 합니다. language는 ko 또는 en, text는 실제 낭독문입니다. 영어 제안 제목은 한 구절로 묶고, 한국어 문장 안의 약어나 버전은 문맥에 맞게 풀어 읽으세요. 예: {"language":"en","caption":"indexOf","text":"index of"}, {"language":"ko","caption":"API를 호출합니다.","text":"에이피아이를 호출합니다."}. 코드의 구두점은 의미가 있을 때만 읽으세요. shortNarration을 따로 쓰면 shortSpeech도 별도로 작성하세요.`;

export function buildStarterScript(
  proposal: EvolutionProposal,
  episodeNumber: number,
  nextProposal?: EvolutionProposal,
): EpisodeScript {
  const swiftVersion = proposal.status.version ?? proposal.status.state;
  const authorNames = proposal.authors.map((a) => a.name);
  const config = getConfig();

  const nextHint = nextProposal
    ? `다음 영상에서는 ${nextProposal.id} (${nextProposal.title})를 다룹니다.`
    : "구독과 좋아요로 다음 Swift Evolution 에피소드를 받아보세요.";

  return {
    schemaVersion: 1,
    proposalId: proposal.id,
    episodeNumber,
    swiftVersion,
    proposalState: proposal.status.state,
    proposalTitle: proposal.title,
    koreanTitle: `[번역/작성 필요] ${proposal.title}`,
    authors: authorNames,
    proposalUrl: getProposalGithubUrl(proposal),
    thumbnail: {
      eyebrow: `EP.${String(episodeNumber).padStart(3, "0")} · SWIFT ${swiftVersion.toUpperCase()}`,
      headline: `${proposal.id}\n핵심 한눈에 보기`,
      subheadline: proposal.title,
      codeBefore: "// TODO: Before Swift snippet",
      codeAfter: "// TODO: After Swift snippet",
    },
    scenes: [
      {
        id: "01-intro",
        type: "code-focus",
        chapterTitle: "첫 코드 질문",
        heading: "이 코드에서 무엇이 달라질까요?",
        code: { code: "// TODO: 원문에서 질문에 맞는 짧은 코드로 교체하세요" },
        subheading: `Swift ${swiftVersion} · ${authorNames.join(", ") || "Swift Evolution"}`,
        narration: "이 코드에서 무엇이 달라질까요?",
        badge: `Swift ${swiftVersion}`,
        includeInShort: true,
      },
      {
        id: "02-problem",
        type: "problem",
        chapterTitle: "도입 배경과 문제",
        heading: "왜 이 제안이 필요했을까요?",
        narration: proposal.summary || `${proposal.title} 제안의 배경과 기존 Swift에서의 불편함을 살펴봅니다.`,
        bullets: [
          "기존 문법에서 개발자가 겪던 불편함 정리",
          "실제 코드 예제와 함께 문제점 확인",
        ],
        includeInShort: true,
      },
      {
        id: "03-solution",
        type: "code-compare",
        chapterTitle: "Before & After 비교",
        heading: "어떻게 달라졌을까요?",
        narration: `${proposal.id}가 적용되면서 코드가 훨씬 직관적으로 바뀝니다. 실제 변경 전후를 비교해 보세요.`,
        codeBefore: {
          label: "Before",
          code: "// TODO: proposal.md에서 기존 코드 예제를 채워주세요",
        },
        codeAfter: {
          label: `After · Swift ${swiftVersion}`,
          code: "// TODO: proposal.md에서 개선된 코드 예제를 채워주세요",
        },
        includeInShort: true,
      },
      {
        id: "04-outro",
        type: "outro",
        chapterTitle: "정리 및 다음 예고",
        heading: "핵심 요약",
        narration: `${proposal.id} 핵심 정리는 여기까지입니다. ${nextHint}`,
        bullets: [
          `${proposal.id} 핵심 변화 한 줄 요약`,
          nextHint,
        ],
        includeInShort: false,
      },
    ],
    youtube: {
      long: {
        title: `[Swift Evolution #${String(episodeNumber).padStart(3, "0")}] ${proposal.id} - ${proposal.title} (Swift ${swiftVersion})`,
        description: [
          `${proposal.id}: ${proposal.title}`,
          `Swift ${swiftVersion}에 도입된 ${proposal.id} 제안을 한국어로 알기 쉽게 설명합니다.`,
          "",
          `원문 Proposal: ${getProposalGithubUrl(proposal)}`,
        ].join("\n"),
        tags: ["Swift", "SwiftEvolution", proposal.id, `Swift${swiftVersion}`, "iOS개발", "스위프트"],
        playlistNames: [config.youtube.defaultPlaylistLong],
        categoryId: "28",
        defaultLanguage: "ko",
      },
      short: {
        title: `${proposal.id} 핵심 요약 - ${proposal.title} #Shorts`,
        description: [
          `Swift Evolution ${proposal.id} (Swift ${swiftVersion}) 핵심 요약!`,
          `원문: ${getProposalGithubUrl(proposal)}`,
          "#Swift #SwiftEvolution #Shorts #iOS개발",
        ].join("\n"),
        tags: ["Swift", "SwiftEvolution", proposal.id, "Shorts", "iOS개발"],
        playlistNames: [config.youtube.defaultPlaylistShort],
        categoryId: "28",
        defaultLanguage: "ko",
      },
    },
  };
}

/**
 * Builds episodes/SE-XXXX/prompt.md for AI coding agents or external LLM runs.
 */
export function buildAgentPromptMarkdown(
  proposal: EvolutionProposal,
  episodeNumber: number,
  proposalMarkdown: string,
  nextProposal?: EvolutionProposal,
): string {
  const config = getConfig();
  const swiftVersion = proposal.status.version ?? proposal.status.state;
  const maxBodyChars = 24000;
  const trimmedBody =
    proposalMarkdown.length > maxBodyChars
      ? `${proposalMarkdown.slice(0, maxBodyChars)}\n\n... (전체 원문은 같은 폴더의 proposal.md를 참고하세요)`
      : proposalMarkdown;

  return `# ${proposal.id} 대본 작성 프롬프트 (${proposal.title})

아래 Swift Evolution 원문을 바탕으로 \`episodes/${proposal.id}/script.json\`을 작성해 주세요.

## 메타데이터
- **Proposal ID**: ${proposal.id}
- **Episode Number**: ${episodeNumber}
- **Title**: ${proposal.title}
- **Status / Version**: ${proposal.status.state} (Swift ${swiftVersion})
- **Authors**: ${proposal.authors.map((a) => a.name).join(", ") || "N/A"}
- **URL**: ${getProposalGithubUrl(proposal)}
- **Next Episode Hint**: ${nextProposal ? `${nextProposal.id} - ${nextProposal.title}` : "없음"}

## 작성 규칙

${editorialGuide} [시리즈 연출 근거](../../_context/editorial-direction.md)

1. **언어/톤**: 한국어 개발자 유튜브 스타일(친절하고 명쾌하며 실무 중심). ${speechGuide}
2. **16:9 일반 영상 (\`scenes\`)**:
   - 5~7개 씬 구성 권장 (\`intro\` -> \`history\` -> \`problem\` -> \`code-compare\` -> \`code-focus\` -> \`key-points\` -> \`outro\`).
   - 총 나레이션 길이 1.5~3.5분 분량 (한국어 약 450~1,100자).
   - 각 \`codeBefore\` / \`codeAfter\` / \`code\` 블록은 1920x1080 화면에서 한눈에 읽히도록 3~12줄 이내로 간결하게 다듬기.
   - 강조할 줄이 있으면 \`highlightLines\`, \`diffAddedLines\`, \`diffRemovedLines\` (1-based line numbers) 활용.
3. **9:16 쇼츠 (\`shortsScenes\` 또는 \`includeInShort\`/\`shortNarration\`)**:
   - **50초 이내** (한국어 약 160~230자, 3~4개 씬)로 강렬한 훅 + Before/After 코드 + 한 줄 결론 구성!
   - \`shortsScenes\` 배열을 별도로 작성하면 세로 화면에 최적화된 짧은 제목/코드/나레이션을 완전히 독립 제어할 수 있어 가장 추천합니다.
4. **썸네일 (\`thumbnail\`)**:
   - \`headline\`은 2줄 이내의 임팩트 있는 한국어 문구 (\`\\n\`으로 줄바꿈).
   - \`codeBefore\`, \`codeAfter\`는 1~2줄짜리 대비 코드.
5. **YouTube 메타데이터**:
   - \`youtube.long.title\`: 100자 이내, 클릭하고 싶은 한국어 제목.
   - \`youtube.short.title\`: 100자 이내, 끝에 \`#Shorts\` 포함.
   - \`playlistNames\`: long은 \`["${config.youtube.defaultPlaylistLong}"]\`, short는 \`["${config.youtube.defaultPlaylistShort}"]\`.
6. **검증**: 작성 후 \`pnpm evo validate ${proposal.id}\` 로 스키마 통과 확인.

## 원문 Proposal (\`proposal.md\`)

\`\`\`markdown
${trimmedBody}
\`\`\`
`;
}

/**
 * Initializes episode workspace folder with proposal.md, prompt.md, and starter script.json.
 */
export async function scaffoldEpisode(
  proposal: EvolutionProposal,
  episodeNumber: number,
  proposalMarkdown: string,
  feed: EvolutionFeed,
  options?: { force?: boolean },
): Promise<{
  scriptWritten: boolean;
  paths: ReturnType<typeof getEpisodePaths>;
}> {
  const paths = getEpisodePaths(proposal.id);
  await fs.mkdir(paths.audioLongDir, { recursive: true });
  await fs.mkdir(paths.audioShortDir, { recursive: true });
  await fs.mkdir(paths.audioCustomDir, { recursive: true });
  await fs.mkdir(paths.outDir, { recursive: true });

  await fs.writeFile(paths.proposalMd, proposalMarkdown, "utf8");

  const nextProposal = findNextProposalAfter(feed, proposal.id);
  const promptMd = buildAgentPromptMarkdown(proposal, episodeNumber, proposalMarkdown, nextProposal);
  await fs.writeFile(paths.promptMd, promptMd, "utf8");

  let scriptExists = false;
  try {
    await fs.access(paths.scriptJson);
    scriptExists = true;
  } catch {
    scriptExists = false;
  }

  let scriptWritten = false;
  if (!scriptExists || options?.force) {
    const starter = buildStarterScript(proposal, episodeNumber, nextProposal);
    await fs.writeFile(paths.scriptJson, `${JSON.stringify(starter, null, 2)}\n`, "utf8");
    scriptWritten = true;
  }

  await updateEpisodeState(proposal.id, (prev) => {
    const nextStage = prev ? maxStage(prev.stage, "initialized") : "initialized";
    return {
      id: proposal.id,
      episodeNumber,
      title: proposal.title,
      proposalState: proposal.status.state,
      swiftVersion: proposal.status.version,
      stage: nextStage,
      updatedAt: new Date().toISOString(),
      formats: prev?.formats ?? {},
    };
  });

  return { scriptWritten, paths };
}

function extractJsonPayload(rawText: string): unknown {
  const trimmed = rawText.trim();
  const fencedMatch = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;
  return JSON.parse(candidate);
}

function buildLlmSystemAndUserPrompts(
  proposal: EvolutionProposal,
  episodeNumber: number,
  proposalMarkdown: string,
  nextProposal?: EvolutionProposal,
): { system: string; user: string } {
  const config = getConfig();
  const swiftVersion = proposal.status.version ?? proposal.status.state;
  const maxBodyChars = 28000;
  const truncatedMd =
    proposalMarkdown.length > maxBodyChars
      ? `${proposalMarkdown.slice(0, maxBodyChars)}\n...(truncated)`
      : proposalMarkdown;

  const system = `당신은 한국어 Swift/iOS 개발자 유튜브 채널의 수석 작가이자 테크니컬 에디터입니다.
Swift Evolution 제안서를 깊이 분석하여 16:9 해설 영상(2~3분)과 9:16 유튜브 쇼츠(45~55초)를 동시에 만들 수 있는 엄격한 JSON을 생성하세요.
반드시 유효한 JSON 객체 하나만 반환하고 설명이나 마크다운 텍스트를 덧붙이지 마세요.`;

  const user = `다음 Swift Evolution 제안서를 바탕으로 EpisodeScript JSON(schemaVersion: 1)을 작성하세요.

메타데이터:
- schemaVersion: 1
- proposalId: "${proposal.id}"
- episodeNumber: ${episodeNumber}
- swiftVersion: "${swiftVersion}"
- proposalState: "${proposal.status.state}"
- proposalTitle: ${JSON.stringify(proposal.title)}
- authors: ${JSON.stringify(proposal.authors.map((a) => a.name))}
- proposalUrl: ${JSON.stringify(getProposalGithubUrl(proposal))}
- nextProposalHint: ${nextProposal ? `${nextProposal.id} (${nextProposal.title})` : "none"}

반드시 준수할 JSON 스키마:
{
  "schemaVersion": 1,
  "proposalId": "${proposal.id}",
  "episodeNumber": ${episodeNumber},
  "swiftVersion": "${swiftVersion}",
  "proposalState": "${proposal.status.state}",
  "proposalTitle": ${JSON.stringify(proposal.title)},
  "koreanTitle": "자연스러운 한국어 제목",
  "authors": ${JSON.stringify(proposal.authors.map((a) => a.name))},
  "proposalUrl": ${JSON.stringify(getProposalGithubUrl(proposal))},
  "thumbnail": {
    "eyebrow": "EP.${String(episodeNumber).padStart(3, "0")} · SWIFT ${swiftVersion.toUpperCase()}",
    "headline": "2줄 이내\\n강렬한 한국어 제목",
    "subheadline": "짧은 부제",
    "codeBefore": "1~2줄 Before 코드",
    "codeAfter": "1~2줄 After 코드"
  },
  "scenes": [
    {
      "id": "01-intro",
      "type": "intro" | "history" | "problem" | "code-compare" | "code-focus" | "key-points" | "outro",
      "chapterTitle": "유튜브 챕터 제목",
      "heading": "화면 큰 제목",
      "subheading": "선택 부제",
      "narration": "TTS가 읽을 자연스러운 한국어 나레이션",
      "bullets": ["선택 불릿 2~4개"],
      "badge": "선택 배지",
      "codeBefore": { "label": "Before", "code": "짧은 Swift 코드", "highlightLines": [1], "diffRemovedLines": [1] },
      "codeAfter": { "label": "After", "code": "짧은 Swift 코드", "highlightLines": [1], "diffAddedLines": [1] },
      "code": { "label": "Swift", "code": "단일 코드 포커스", "highlightLines": [1] },
      "callout": "하단 핵심 포인트 박스",
      "includeInShort": true
    }
  ],
  "shortsScenes": [
    // 9:16 쇼츠 전용 3~4개 씬. 전체 narration 합계가 한국어 160~220자(40~52초)를 넘지 않도록 간결하게 작성!
  ],
  "youtube": {
    "long": {
      "title": "100자 이내 한국어 유튜브 제목",
      "description": "풍부한 한국어 설명 (원문 URL 포함)",
      "tags": ["Swift", "SwiftEvolution", "${proposal.id}", "iOS개발"],
      "playlistNames": [${JSON.stringify(config.youtube.defaultPlaylistLong)}],
      "categoryId": "28",
      "defaultLanguage": "ko"
    },
    "short": {
      "title": "100자 이내 쇼츠 제목 #Shorts",
      "description": "쇼츠 설명 #Swift #SwiftEvolution #Shorts",
      "tags": ["Swift", "SwiftEvolution", "${proposal.id}", "Shorts"],
      "playlistNames": [${JSON.stringify(config.youtube.defaultPlaylistShort)}],
      "categoryId": "28",
      "defaultLanguage": "ko"
    }
  }
}

규칙:
- scenes는 5~7개로 구성하고, 첫 씬은 코드 질문(intro와 codeReveal 또는 code-focus와 code), 마지막 씬은 outro로 작성하세요.
- 코드 예제는 반드시 실제 Proposal 원문에 근거하여 정확하게 작성하고, 한 코드 블록당 10줄 이하로 화면 가독성을 지키세요.
- ${editorialGuide}
- ${speechGuide}

Proposal 원문:
${truncatedMd}`;

  return { system, user };
}

function resolveLlmProvider(explicit?: string): "openai" | "anthropic" | "gemini" {
  const config = getConfig();
  const choice = (explicit?.trim() || config.llm.provider).toLowerCase();

  if (choice === "openai") {
    if (!config.llm.openaiApiKey) throw new Error("OPENAI_API_KEY가 .env에 설정되어 있지 않습니다.");
    return "openai";
  }
  if (choice === "anthropic") {
    if (!config.llm.anthropicApiKey) throw new Error("ANTHROPIC_API_KEY가 .env에 설정되어 있지 않습니다.");
    return "anthropic";
  }
  if (choice === "gemini") {
    if (!config.llm.geminiApiKey) throw new Error("GEMINI_API_KEY가 .env에 설정되어 있지 않습니다.");
    return "gemini";
  }

  if (config.llm.openaiApiKey) return "openai";
  if (config.llm.anthropicApiKey) return "anthropic";
  if (config.llm.geminiApiKey) return "gemini";

  throw new Error(
    "사용 가능한 LLM API 키(OPENAI_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY)가 없습니다.\n" +
      "1) .env에 API 키를 설정하거나,\n" +
      "2) AI 코딩 에이전트/직접 편집으로 episodes/SE-XXXX/prompt.md를 참고해 script.json을 작성하세요.",
  );
}

/**
 * Generates and validates episodes/SE-XXXX/script.json using an LLM API.
 */
export async function generateScriptWithLlm(
  proposal: EvolutionProposal,
  episodeNumber: number,
  proposalMarkdown: string,
  feed: EvolutionFeed,
  options?: { provider?: string },
): Promise<{ script: EpisodeScript; provider: string }> {
  const config = getConfig();
  const provider = resolveLlmProvider(options?.provider);
  const nextProposal = findNextProposalAfter(feed, proposal.id);
  const { system, user } = buildLlmSystemAndUserPrompts(
    proposal,
    episodeNumber,
    proposalMarkdown,
    nextProposal,
  );

  let rawText = "";

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.llm.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: config.llm.openaiModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.4,
      }),
    });
    if (!res.ok) {
      throw new Error(`OpenAI API 오류 (${res.status}): ${await res.text()}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    rawText = data.choices?.[0]?.message?.content ?? "";
  } else if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.llm.anthropicApiKey!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.llm.anthropicModel,
        max_tokens: 4096,
        system,
        messages: [{ role: "user", content: user }],
        temperature: 0.4,
      }),
    });
    if (!res.ok) {
      throw new Error(`Anthropic API 오류 (${res.status}): ${await res.text()}`);
    }
    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    rawText = data.content?.find((c) => c.type === "text")?.text ?? "";
  } else {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      config.llm.geminiModel,
    )}:generateContent?key=${encodeURIComponent(config.llm.geminiApiKey!)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    });
    if (!res.ok) {
      throw new Error(`Gemini API 오류 (${res.status}): ${await res.text()}`);
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  if (!rawText.trim()) {
    throw new Error(`${provider} 응답이 비어 있습니다.`);
  }

  const parsedJson = extractJsonPayload(rawText);
  const script = EpisodeScriptSchema.parse(parsedJson);
  const paths = getEpisodePaths(proposal.id);
  await fs.mkdir(path.dirname(paths.scriptJson), { recursive: true });
  await fs.writeFile(paths.scriptJson, `${JSON.stringify(script, null, 2)}\n`, "utf8");

  await updateEpisodeState(proposal.id, (prev) => ({
    id: proposal.id,
    episodeNumber,
    title: proposal.title,
    proposalState: proposal.status.state,
    swiftVersion: proposal.status.version,
    stage: maxStage(prev?.stage ?? "pending", "scripted"),
    updatedAt: new Date().toISOString(),
    formats: prev?.formats ?? {},
  }));

  return { script, provider };
}

/**
 * Loads and Zod-validates episodes/SE-XXXX/script.json.
 */
export async function loadAndValidateScript(proposalId: string): Promise<EpisodeScript> {
  const paths = getEpisodePaths(proposalId);
  const raw = await fs.readFile(paths.scriptJson, "utf8");
  const json = JSON.parse(raw);
  return EpisodeScriptSchema.parse(json);
}
