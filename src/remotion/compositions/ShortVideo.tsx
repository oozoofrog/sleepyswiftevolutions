import { KineticHeading } from "../components/KineticHeading";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { buildSceneTimeline, type ResolvedSceneTiming } from "../../lib/timeline";
import type { AudioManifest, EpisodeScript } from "../../schema/script";
import { Background } from "../components/Background";
import { ProposalHistory } from "../components/ProposalHistory";
import { CodeReveal } from "../components/CodeReveal";
import { ComparisonArrow } from "../components/ComparisonArrow";
import { CodePanel } from "../components/CodePanel";
import { ProgressTimeline } from "../components/ProgressTimeline";
import { ProposalBadge } from "../components/ProposalBadge";
import { SceneTitle } from "../components/SceneTitle";
import { SubtitleBar } from "../components/SubtitleBar";
import { FONT_MONO, FONT_SANS, THEME } from "../theme";

export interface ShortVideoProps {
  script: EpisodeScript;
  format: "short";
  manifest?: AudioManifest;
}

const ShortSceneView: React.FC<{
  script: EpisodeScript;
  timing: ResolvedSceneTiming;
}> = ({ script, timing }) => {
  const { scene } = timing;
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.7 },
  });
  const fadeOut = interpolate(
    frame,
    [Math.max(8, durationInFrames - 6), durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  if (scene.type === "history") return <ProposalHistory scene={scene} />;

  if (scene.codeReveal) {
    return <CodeReveal timing={timing} reveal={scene.codeReveal} />;
  }

  const renderBody = () => {
    if (scene.type === "intro") {
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <span
            style={{
              alignSelf: "flex-start",
              background: THEME.swiftGradient,
              color: THEME.bgDeep,
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 28,
              padding: "10px 22px",
              borderRadius: 999,
            }}
          >
            {script.proposalId} · 1분 요약
          </span>

          <h1
            style={{
              clipPath: `inset(0 0 ${interpolate(frame, [3, 22], [100, 0], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp",
              })}% 0)`,
              margin: 0,
              fontFamily: FONT_SANS,
              fontWeight: 900,
              fontSize: 64,
              lineHeight: 1.24,
              color: THEME.textPrimary,
              wordBreak: "keep-all",
            }}
          >
            <KineticHeading text={scene.heading} />
          </h1>

          {scene.subheading && (
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 25,
                color: THEME.sky,
                backgroundColor: THEME.skyBg,
                border: `1px solid ${THEME.skyBorder}`,
                padding: "14px 20px",
                borderRadius: 16,
              }}
            >
              {scene.subheading}
            </div>
          )}
        </div>
      );
    }

    if (scene.type === "code-compare" && scene.codeBefore && scene.codeAfter) {
      const afterFrame = Math.max(1, Math.min(38, Math.floor(timing.durationInFrames / 4)));
      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
          <SceneTitle eyebrow={scene.chapterTitle} heading={scene.heading} compact />
          <CodePanel snippet={scene.codeBefore} tone="before" fontSize={26} delayFrames={2} />
          <ComparisonArrow vertical endFrame={afterFrame} />
          <CodePanel snippet={scene.codeAfter} tone="after" fontSize={26} delayFrames={afterFrame} />
        </div>
      );
    }

    const snippet = scene.code ?? scene.codeBefore ?? scene.codeAfter;

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
        <SceneTitle
          eyebrow={scene.chapterTitle}
          heading={scene.heading}
          subheading={scene.subheading}
          compact
        />

        {snippet && (
          <CodePanel
            snippet={snippet}
            tone={scene.type === "problem" && scene.codeBefore ? "before" : "neutral"}
            fontSize={27}
            delayFrames={4}
          />
        )}

        {scene.bullets && scene.bullets.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {scene.bullets.slice(0, 3).map((b, idx) => (
              <div
                key={idx}
                style={{
                  opacity: interpolate(frame, [6 + idx * 7, 14 + idx * 7], [0, 1], {
                    extrapolateLeft: "clamp", extrapolateRight: "clamp",
                  }),
                  backgroundColor: THEME.bgCard,
                  border: `1px solid ${THEME.borderSubtle}`,
                  borderRadius: 16,
                  padding: "18px 22px",
                  fontFamily: FONT_SANS,
                  fontWeight: 700,
                  fontSize: 28,
                  lineHeight: 1.4,
                  color: THEME.textPrimary,
                  wordBreak: "keep-all",
                }}
              >
                • {b}
              </div>
            ))}
          </div>
        )}

        {scene.callout && (
          <div
            style={{
              backgroundColor: THEME.amberBg,
              border: `1.5px solid ${THEME.amberBorder}`,
              borderRadius: 16,
              padding: "16px 22px",
              fontFamily: FONT_SANS,
              fontWeight: 800,
              fontSize: 27,
              color: THEME.amber,
              wordBreak: "keep-all",
            }}
          >
            💡 {scene.callout}
          </div>
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(enter, fadeOut),
        transform: `translateY(${interpolate(enter, [0, 1], [16, 0])}px)`,
        paddingTop: 165,
        paddingBottom: 455,
        paddingLeft: 56,
        paddingRight: 56,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {renderBody()}
    </AbsoluteFill>
  );
};

export const ShortVideo: React.FC<ShortVideoProps> = ({ script, manifest }) => {
  const timeline = React.useMemo(
    () => buildSceneTimeline(script, "short", manifest),
    [script, manifest],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bgDeep }}>
      <Background accentColor={script.thumbnail.accentColor} />
      <ProgressTimeline scenes={timeline.scenes} totalFrames={timeline.totalFrames} variant="short" />

      {/* Top badge inside Shorts safe area */}
      <div
        style={{
          position: "absolute",
          top: 74,
          left: 56,
          right: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 20,
        }}
      >
        <ProposalBadge
          proposalId={script.proposalId}
          episodeNumber={script.episodeNumber}
          swiftVersion={script.swiftVersion}
          proposalState={script.proposalState}
          compact
        />
      </div>

      {timeline.scenes.map((timing) => (
        <Sequence
          key={timing.scene.id}
          from={timing.startFrame}
          durationInFrames={timing.durationInFrames}
        >
          <ShortSceneView script={script} timing={timing} />
          {timing.audioFile && (
            <Sequence from={timing.leadInFrames}>
              <Audio src={staticFile(timing.audioFile)} />
            </Sequence>
          )}
        </Sequence>
      ))}

      <SubtitleBar cues={timeline.allCues} variant="short" />
    </AbsoluteFill>
  );
};
