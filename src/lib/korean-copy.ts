// Keep literal uses such as "가장자리" and "소수점 셋째 자리" available.
const vaguePlacePatterns = [
  /들어\s*(?:가(?:는|느|던|야\s*할)|갈|간|갔던|오(?:는|던)|올|온)\s*자리/u,
  /(?:되)?돌아\s*(?:온|올|오(?:는|던)|간|갈|가(?:는|던))\s*자리/u,
  /행과\s*열이\s*만나는\s*자리/u,
  /한\s*획(?:의|,\s*세\s*나라의)\s*(?:세\s*)?자리/u,
  /서로\s*다른\s*자리를\s*주/u,
];

export function checkKoreanCopy(value: string): string | undefined {
  const text = value.normalize("NFC");
  const vagueEvent = text.match(/(?:에서|부터|으로|로)\s*시작된\s*일(?=$|[^가-힣]|이(?:다|었)|은(?:$|\s))/u);
  if (vagueEvent) {
    return `“${vagueEvent[0]}”에서 가리키는 사건을 구체적으로 쓰세요. 예를 들어 “제록스의 중국어 글꼴 개발”처럼 쓰세요.`;
  }
  for (const pattern of vaguePlacePatterns) {
    const match = text.match(pattern);
    if (match) {
      return `“${match[0]}” 대신 대상과 동작을 구체적으로 쓰세요. 문자표에서는 번호 또는 행과 열을 명시하세요.`;
    }
  }
}

const copyKeys = new Set([
  "koreanTitle", "chapterTitle", "heading", "subheading", "narration", "shortNarration",
  "caption", "text", "meaning", "event", "bullets", "badge", "callout", "title",
  "description", "eyebrow", "headline", "subheadline", "focus", "example",
]);

export function checkScriptCopy(
  value: unknown,
  issue: (path: (string | number)[], message: string) => void,
  path: (string | number)[] = [],
  isCopy = false,
): void {
  if (typeof value === "string" && isCopy) {
    const message = checkKoreanCopy(value);
    if (message) issue(path, message);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => checkScriptCopy(item, issue, [...path, i], isCopy));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      checkScriptCopy(item, issue, [...path, key], copyKeys.has(key));
    }
  }
}
