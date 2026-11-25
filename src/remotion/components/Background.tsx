import React from "react";
import { AbsoluteFill } from "remotion";
import { stageBackground, THEME } from "../theme";

export const Background: React.FC<{ accentColor?: string }> = ({
  accentColor = THEME.swiftOrange,
}) => (
  <AbsoluteFill style={{ background: stageBackground(accentColor), borderTop: `4px solid ${accentColor}` }} />
);
