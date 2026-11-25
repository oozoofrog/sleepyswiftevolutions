import type { EpisodeScript } from "../schema/script";

export const SAMPLE_SCRIPT: EpisodeScript = {
  schemaVersion: 1,
  proposalId: "SE-0001",
  episodeNumber: 1,
  swiftVersion: "2.2",
  proposalState: "implemented",
  proposalTitle: "Allow (most) keywords as argument labels",
  koreanTitle: "이제 `in`을 백틱 없이 함수 인자 레이블로 쓴다고?",
  authors: ["Doug Gregor"],
  proposalUrl:
    "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0001-keywords-as-argument-labels.md",
  thumbnail: {
    eyebrow: "EP.001 · SWIFT 2.2",
    headline: "백틱 지옥 끝!\n키워드 인자 레이블 허용",
    subheadline: "Allow (most) keywords as argument labels",
    codeBefore: "indexOf(value, `in`: list)",
    codeAfter: "indexOf(value, in: list)",
  },
  scenes: [
    {
      id: "01-intro",
      type: "intro",
      chapterTitle: "인트로",
      heading: "키워드도 인자 레이블로 허용하기",
      subheading: "Allow (most) keywords as argument labels",
      narration:
        "Swift Evolution 첫 번째 에피소드, SE-0001입니다. Swift 2.2에서 백틱 없이 키워드를 인자 레이블로 쓸 수 있게 된 이야기를 알아봅니다.",
      badge: "첫 번째 공식 제안",
      includeInShort: true,
    },
    {
      id: "02-compare",
      type: "code-compare",
      chapterTitle: "Before & After",
      heading: "백틱(`)을 빼니 이렇게 깔끔해집니다",
      narration:
        "예전에는 in이나 protocol 같은 예약어를 인자 레이블로 쓰려면 백틱으로 감싸야 했습니다. SE-0001 이후에는 그대로 적으면 됩니다.",
      codeBefore: {
        label: "Before · Swift 2.1",
        code: "indexOf(value, `in`: collection)\nNSXPCInterface(`protocol`: MyService.self)",
        highlightLines: [1, 2],
        diffRemovedLines: [1, 2],
      },
      codeAfter: {
        label: "After · Swift 2.2",
        code: "indexOf(value, in: collection)\nNSXPCInterface(protocol: MyService.self)",
        highlightLines: [1, 2],
        diffAddedLines: [1, 2],
      },
      callout: "inout, var, let 단 3개 키워드만 제외하고 모든 키워드 허용",
      includeInShort: true,
    },
    {
      id: "03-outro",
      type: "outro",
      chapterTitle: "정리",
      heading: "가장 읽기 좋은 이름이 최우선",
      narration:
        "작지만 Swift의 API 가독성 철학을 보여준 첫 번째 제안이었습니다. 다음 에피소드도 기대해주세요.",
      bullets: ["대부분의 키워드를 백틱 없이 인자 레이블로 사용 가능", "다음 에피소드: SE-0002"],
      includeInShort: false,
    },
  ],
  youtube: {
    long: {
      title: "[Swift Evolution #001] SE-0001 - 키워드를 함수 인자 레이블로 허용 (Swift 2.2)",
      description: "Swift Evolution SE-0001 소개 영상입니다.",
      tags: ["Swift", "SwiftEvolution", "SE-0001"],
      playlistNames: ["Swift Evolution 처음부터 끝까지"],
      categoryId: "28",
      defaultLanguage: "ko",
    },
    short: {
      title: "SE-0001 백틱 없이 in: 쓰기 #Shorts",
      description: "Swift Evolution SE-0001 쇼츠 요약 #Shorts",
      tags: ["Swift", "SE-0001", "Shorts"],
      playlistNames: ["Swift Evolution Shorts"],
      categoryId: "28",
      defaultLanguage: "ko",
    },
  },
};
