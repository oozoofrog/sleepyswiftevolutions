import { SceneTransition, sharedPanels } from "../components/SceneTransition";
import { DirectedScene } from "../components/DirectedScene";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { PersonCard } from "../components/PersonCard";
import { TermNote } from "../components/TermNote";
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
import type { AudioManifest, EpisodeScript, Scene } from "../../schema/script";
import { Background } from "../components/Background";
import { ProposalHistory } from "../components/ProposalHistory";
import { CodeWalkthrough } from "../components/CodeWalkthrough";
import { ParameterValueFlow } from "../components/ParameterValueFlow";
import { CodeReveal } from "../components/CodeReveal";
import { ComparisonArrow } from "../components/ComparisonArrow";
import { CodePanel } from "../components/CodePanel";
import { ProgressTimeline } from "../components/ProgressTimeline";
import { ProposalBadge } from "../components/ProposalBadge";
import { SceneTitle } from "../components/SceneTitle";
import { FONT_MONO, FONT_SANS, THEME } from "../theme";

export interface LongVideoProps {
  script: EpisodeScript;
  format: "long";
  manifest?: AudioManifest;
}

const BulletList: React.FC<{ items: string[]; delayStart?: number }> = ({
  items,
  delayStart = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((item, idx) => {
        const anim = spring({
          frame: Math.max(0, frame - (delayStart + idx * 5)),
          fps,
          config: { damping: 18, stiffness: 130 },
        });
        return (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              backgroundColor: THEME.bgCard,
              border: `1px solid ${THEME.borderSubtle}`,
              borderRadius: 16,
              padding: "18px 22px",
              opacity: interpolate(anim, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(anim, [0, 1], [18, 0])}px)`,
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 30,
                height: 30,
                borderRadius: 10,
                background: THEME.swiftGradient,
                color: THEME.bgDeep,
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 17,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 2,
              }}
            >
              {idx + 1}
            </span>
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 25,
                lineHeight: 1.45,
                fontWeight: 600,
                color: THEME.textPrimary,
                wordBreak: "keep-all",
              }}
            >
              {item}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const CalloutBanner: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [10, 22], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        backgroundColor: THEME.amberBg,
        border: `1.5px solid ${THEME.amberBorder}`,
        borderRadius: 16,
        padding: "16px 24px",
        opacity,
      }}
    >
      <span
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 800,
          fontSize: 20,
          color: THEME.amber,
          backgroundColor: "rgba(251, 191, 36, 0.16)",
          padding: "4px 12px",
          borderRadius: 8,
        }}
      >
        POINT
      </span>
      <span
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 700,
          fontSize: 24,
          color: THEME.textPrimary,
          wordBreak: "keep-all",
        }}
      >
        {text}
      </span>
    </div>
  );
};

const LongSceneView: React.FC<{
  script: EpisodeScript;
  timing: ResolvedSceneTiming;
  preceding?: ResolvedSceneTiming;
}> = ({ script, timing, preceding }) => {
  const { scene } = timing;
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [Math.max(10, durationInFrames - 8), durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  if (scene.speech?.some(part => part.direction)) return <DirectedScene timing={timing} preceding={preceding?.scene} showStageLabels={script.showStageLabels} animateLineHighlight={script.animateLineHighlight} sharedLayout={script.sceneTransition === "shared-layout"} />;

  if (scene.type === "history") return <ProposalHistory scene={scene} />;

  if (scene.valueFlow && scene.code) {
    return <ParameterValueFlow timing={timing} flow={scene.valueFlow} snippet={scene.code} />;
  }

  if (scene.codeSteps && scene.code) return <CodeWalkthrough timing={timing} snippet={scene.code} steps={scene.codeSteps} />;

  if (scene.codeReveal) {
    return <CodeReveal timing={timing} reveal={scene.codeReveal} />;
  }

  const renderContent = () => {
    if (scene.type === "intro") {
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 28,
            padding: "0 80px",
          }}
        >
          <ProposalBadge
            proposalId={script.proposalId}
            episodeNumber={script.episodeNumber}
            swiftVersion={script.swiftVersion}
            proposalState={script.proposalState}
          />

          <h1
            style={{
              clipPath: `inset(0 0 ${interpolate(frame, [3, 22], [100, 0], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp",
              })}% 0)`,
              margin: 0,
              fontFamily: FONT_SANS,
              fontWeight: 900,
              fontSize: 66,
              lineHeight: 1.22,
              color: THEME.textPrimary,
              letterSpacing: "-0.025em",
              maxWidth: 1440,
              wordBreak: "keep-all",
            }}
          >
            <KineticHeading text={script.koreanTitle} />
          </h1>

          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 26,
              color: THEME.sky,
              backgroundColor: THEME.skyBg,
              border: `1px solid ${THEME.skyBorder}`,
              padding: "12px 26px",
              borderRadius: 14,
            }}
          >
            {script.proposalTitle}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 10,
              fontFamily: FONT_SANS,
              fontSize: 22,
              color: THEME.textMuted,
            }}
          >
            {script.authors.length > 0 && <span>제안자: {script.authors.join(", ")}</span>}
            {scene.badge && (
              <>
                <span>•</span>
                <span style={{ color: THEME.swiftAmber, fontWeight: 700 }}>{scene.badge}</span>
              </>
            )}
          </div>
        </div>
      );
    }

    if (scene.type === "code-compare" && scene.codeBefore && scene.codeAfter) {
      const parallel = scene.comparisonStyle === "parallel";
      const afterFrame = parallel ? 4 : Math.max(1, Math.min(38, Math.floor(timing.durationInFrames / 4)));
      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 22 }}>
          <SceneTitle
            eyebrow={scene.chapterTitle}
            heading={scene.heading}
            subheading={scene.subheading}
            compact
          />

          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: parallel ? "1fr 1fr" : "1fr 54px 1fr",
              alignItems: "center",
              gap: 18,
            }}
          >
            <CodePanel snippet={scene.codeBefore} tone="before" fontSize={scene.code || parallel ? 35 : 23} delayFrames={4} />
            {!parallel && <ComparisonArrow endFrame={afterFrame} />}
            <CodePanel snippet={scene.codeAfter} tone="after" fontSize={scene.code || parallel ? 35 : 23} delayFrames={afterFrame} />
          </div>

          {scene.code && <CodePanel snippet={scene.code} fontSize={32} delayFrames={afterFrame} />}
          {scene.callout && <CalloutBanner text={scene.callout} />}
        </div>
      );
    }

    if (scene.type === "problem" || scene.type === "code-focus" || (scene.type === "outro" && scene.code)) {
      const snippet = scene.code ?? scene.codeBefore ?? scene.codeAfter;
      const tone = scene.type === "problem" && scene.codeBefore ? "before" : "neutral";
      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
          <SceneTitle
            eyebrow={scene.chapterTitle}
            heading={scene.heading}
            subheading={scene.subheading}
            compact
          />

          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: snippet && scene.bullets?.length ? "1fr 1.15fr" : "1fr",
              gap: 32,
              alignItems: "center",
            }}
          >
            {scene.bullets && scene.bullets.length > 0 && <BulletList items={scene.bullets} />}
            {snippet && <CodePanel snippet={snippet} tone={tone} fontSize={scene.type === "outro" && snippet.code.length <= 18 ? 66 : 24} delayFrames={6} />}
          </div>

          {scene.callout && <CalloutBanner text={scene.callout} />}
        </div>
      );
    }

    if (scene.type === "key-points") {
      const bullets = scene.bullets ?? [];
      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
          <SceneTitle
            eyebrow={scene.chapterTitle}
            heading={scene.heading}
            subheading={scene.subheading}
            compact
          />

          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: bullets.length >= 3 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
              gap: 24,
              alignItems: "stretch",
            }}
          >
            {bullets.map((item, idx) => (
              <div
                key={idx}
                style={{
                  opacity: interpolate(frame, [6 + idx * 7, 14 + idx * 7], [0, 1], {
                    extrapolateLeft: "clamp", extrapolateRight: "clamp",
                  }),
                  backgroundColor: THEME.bgCard,
                  border: `1.5px solid ${THEME.borderSubtle}`,
                  borderRadius: 22,
                  padding: "28px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    alignSelf: "flex-start",
                    background: THEME.swiftGradient,
                    color: THEME.bgDeep,
                    fontFamily: FONT_MONO,
                    fontWeight: 800,
                    fontSize: 20,
                    padding: "6px 14px",
                    borderRadius: 999,
                  }}
                >
                  KEY 0{idx + 1}
                </span>
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontWeight: 700,
                    fontSize: 27,
                    lineHeight: 1.45,
                    color: THEME.textPrimary,
                    wordBreak: "keep-all",
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>

          {scene.callout && <CalloutBanner text={scene.callout} />}
        </div>
      );
    }

    // Default / Outro
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          padding: "0 60px",
        }}
      >
        <SceneTitle
          eyebrow={scene.chapterTitle}
          heading={scene.heading}
          subheading={scene.subheading}
        />
        {scene.bullets && scene.bullets.length > 0 && <BulletList items={scene.bullets} />}
        {scene.callout && <CalloutBanner text={scene.callout} />}
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        paddingTop: scene.type === "intro" ? 72 : 114,
        paddingBottom: 220,
        paddingLeft: 72,
        paddingRight: 72,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {renderContent()}
    </AbsoluteFill>
  );
};

export const LongVideo: React.FC<LongVideoProps> = ({ script, manifest }) => {
  const timeline = React.useMemo(
    () => buildSceneTimeline(script, "long", manifest),
    [script, manifest],
  );
  const frame = useCurrentFrame();

  const currentScene = timeline.scenes.find(
    (s) => frame >= s.startFrame && frame < s.startFrame + s.durationInFrames,
  );
  const showCompactHeader = currentScene?.scene.type !== "intro" || Boolean(currentScene.scene.speech?.[0]?.direction);

  return (
    <AbsoluteFill className={script.visualStyle} style={{ backgroundColor: THEME.bgDeep }}>
      <Background accentColor={script.thumbnail.accentColor} />

      {/* Compact persistent header for non-intro scenes */}
      {showCompactHeader && (
        <div
          style={{
            position: "absolute",
            top: 38,
            left: 72,
            right: 72,
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
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 20,
              fontWeight: 600,
              color: THEME.textMuted,
              maxWidth: 760,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {script.koreanTitle}
          </span>
        </div>
      )}

      {/* Per-scene visuals and narration audio */}
      {script.backgroundMusic && <BackgroundMusic music={script.backgroundMusic} cues={timeline.allCues} />}
      {timeline.scenes.map((timing, index) => {
        const previous = timeline.scenes[index - 1], next = timeline.scenes[index + 1];
        const spatial = script.sceneTransition === "shared-layout";
        const panels = spatial && sharedPanels(previous, timing);
        const frames = spatial && next ? next.startFrame - timing.startFrame : timing.durationInFrames;
        return (
          <Sequence
            key={timing.scene.id}
            from={timing.startFrame}
            durationInFrames={frames}
          >
            <SceneTransition frames={frames} enabled={Boolean(script.sceneTransition)}
              continues={spatial && Boolean(sharedPanels(timing, next))}
              shared={panels ? { ...panels, previousFrame: timing.startFrame - previous.startFrame - 1,
                previous: <LongSceneView script={script} timing={previous} preceding={timeline.scenes[index - 2]} />,
              } : undefined}>
              <LongSceneView script={script} timing={timing} preceding={timeline.scenes[index - 1]} />
              <TermNote spatial={spatial} fadeOut={Boolean(script.sceneTransition)} timing={timing} />
              <PersonCard spatial={spatial} fadeOut={Boolean(script.sceneTransition)} timing={timing} />
            </SceneTransition>
            {timing.audioFile && (
              <Sequence from={timing.leadInFrames}>
                <Audio src={staticFile(timing.audioFile)} />
              </Sequence>
            )}
          </Sequence>
        );
      })}

      <ProgressTimeline scenes={timeline.scenes} variant="long" />
    </AbsoluteFill>
  );
};
