import React from "react";
import { FONT_MONO, FONT_SANS, THEME } from "../theme";

interface ProposalBadgeProps {
  proposalId: string;
  episodeNumber: number;
  swiftVersion: string;
  proposalState: string;
  compact?: boolean;
}

export const ProposalBadge: React.FC<ProposalBadgeProps> = ({
  proposalId,
  episodeNumber,
  swiftVersion,
  proposalState,
  compact = false,
}) => {
  const epLabel = `EP.${String(episodeNumber).padStart(3, "0")}`;
  const stateLabel =
    proposalState === "implemented"
      ? `Swift ${swiftVersion}`
      : `${proposalState.toUpperCase()} · ${swiftVersion}`;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 10 : 12,
        fontFamily: FONT_SANS,
      }}
    >
      <span
        style={{
          background: THEME.swiftGradient,
          color: THEME.bgDeep,
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: compact ? 20 : 24,
          padding: compact ? "6px 14px" : "8px 18px",
          borderRadius: 999,
          letterSpacing: "0.03em",
          boxShadow: "0 8px 24px rgba(240, 81, 56, 0.35)",
        }}
      >
        {proposalId}
      </span>

      <span
        style={{
          backgroundColor: THEME.skyBg,
          border: `1px solid ${THEME.skyBorder}`,
          color: THEME.sky,
          fontWeight: 700,
          fontSize: compact ? 18 : 22,
          padding: compact ? "6px 14px" : "8px 16px",
          borderRadius: 999,
        }}
      >
        {stateLabel}
      </span>

      <span
        style={{
          backgroundColor: "rgba(148, 163, 184, 0.12)",
          border: `1px solid ${THEME.borderSubtle}`,
          color: THEME.textSecondary,
          fontFamily: FONT_MONO,
          fontWeight: 600,
          fontSize: compact ? 17 : 20,
          padding: compact ? "6px 12px" : "8px 14px",
          borderRadius: 999,
        }}
      >
        {epLabel}
      </span>
    </div>
  );
};
