import type { SwiftTokenKind } from "../lib/swift-highlight";

export const THEME = {
  bgDeep: "#101012",
  bgNavy: "#1C1C1E",
  bgCard: "rgba(44, 44, 46, 0.84)",
  bgCardStrong: "rgba(28, 28, 30, 0.94)",
  bgCode: "#1B1C21",
  codeSurface: "linear-gradient(115deg, #272930, #1B1C21 66%)",
  bgCodeHeader: "#29292C",
  borderSubtle: "rgba(174, 174, 178, 0.16)",
  borderHighlight: "rgba(240, 81, 56, 0.45)",

  swiftOrange: "#F05138",
  swiftAmber: "#FF7A45",
  swiftGradient: "linear-gradient(135deg, #F05138 0%, #FF7A45 100%)",

  textPrimary: "#F5F5F7",
  textSecondary: "#D1D1D6",
  textMuted: "#AEAEB2",

  emerald: "#64D77A",
  emeraldBg: "rgba(48, 209, 88, 0.12)",
  emeraldBorder: "rgba(48, 209, 88, 0.35)",

  rose: "#FF827B",
  roseBg: "rgba(255, 69, 58, 0.12)",
  roseBorder: "rgba(255, 69, 58, 0.35)",

  sky: "#75BBFF",
  skyBg: "rgba(10, 132, 255, 0.12)",
  skyBorder: "rgba(10, 132, 255, 0.35)",

  amber: "#FFD60A",
  amberBg: "rgba(255, 214, 10, 0.12)",
  amberBorder: "rgba(255, 214, 10, 0.35)",
} as const;

export const FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';

export const FONT_LABEL = '"Atkinson Hyperlegible Next", ' + FONT_SANS;

export const FONT_MONO = 'Menlo, "Apple SD Gothic Neo", monospace';

export const SYNTAX_COLORS: Record<SwiftTokenKind, string> = {
  keyword: "#FF91C8",
  backtick: "#FFD60A",
  type: "#D9B4FF",
  function: "#9FDFFF",
  string: "#FFB7A8",
  number: "#F2CC60",
  attribute: "#FFA657",
  comment: "#A2A2AD",
  operator: "#AEAEB2",
  plain: "#E2E8F0",
};

export function stageBackground(accent: string): string {
  return `radial-gradient(ellipse at 96% 0%, color-mix(in srgb, ${accent} 22%, transparent), transparent 54%), radial-gradient(ellipse at 0% 100%, rgba(89, 119, 154, 0.12), transparent 58%), linear-gradient(135deg, ${THEME.bgDeep}, ${THEME.bgNavy})`;
}
