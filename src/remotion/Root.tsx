import React from "react";
import { Composition, Still } from "remotion";
import { buildSceneTimeline, DEFAULT_FPS } from "../lib/timeline";
import type { RenderInputProps } from "../schema/script";
import { LongVideo } from "./compositions/LongVideo";
import { ShortVideo } from "./compositions/ShortVideo";
import { Thumbnail } from "./compositions/Thumbnail";
import { SAMPLE_SCRIPT } from "./sample-props";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SwiftEvolutionLong"
        component={LongVideo as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={900}
        fps={DEFAULT_FPS}
        width={1920}
        height={1080}
        defaultProps={
          {
            script: SAMPLE_SCRIPT,
            format: "long",
          } satisfies RenderInputProps
        }
        calculateMetadata={({ props }) => {
          const typed = props as unknown as RenderInputProps;
          const timeline = buildSceneTimeline(typed.script, "long", typed.manifest);
          return {
            durationInFrames: timeline.totalFrames,
            fps: timeline.fps,
            width: 1920,
            height: 1080,
          };
        }}
      />

      <Composition
        id="SwiftEvolutionShort"
        component={ShortVideo as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={900}
        fps={DEFAULT_FPS}
        width={1080}
        height={1920}
        defaultProps={
          {
            script: SAMPLE_SCRIPT,
            format: "short",
          } satisfies RenderInputProps
        }
        calculateMetadata={({ props }) => {
          const typed = props as unknown as RenderInputProps;
          const timeline = buildSceneTimeline(typed.script, "short", typed.manifest);
          return {
            durationInFrames: timeline.totalFrames,
            fps: timeline.fps,
            width: 1080,
            height: 1920,
          };
        }}
      />

      <Still
        id="ThumbnailLong"
        component={Thumbnail as unknown as React.ComponentType<Record<string, unknown>>}
        width={1280}
        height={720}
        defaultProps={{
          script: SAMPLE_SCRIPT,
          variant: "long",
        }}
      />

      <Still
        id="ThumbnailShort"
        component={Thumbnail as unknown as React.ComponentType<Record<string, unknown>>}
        width={1080}
        height={1920}
        defaultProps={{
          script: SAMPLE_SCRIPT,
          variant: "short",
        }}
      />
    </>
  );
};
