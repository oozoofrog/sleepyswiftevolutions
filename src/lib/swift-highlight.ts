export type SwiftTokenKind =
  | "comment"
  | "string"
  | "attribute"
  | "keyword"
  | "backtick"
  | "number"
  | "type"
  | "function"
  | "operator"
  | "plain";

export interface SwiftToken {
  kind: SwiftTokenKind;
  text: string;
}

const SWIFT_KEYWORDS = new Set([
  "actor",
  "any",
  "as",
  "associatedtype",
  "async",
  "await",
  "borrowing",
  "break",
  "case",
  "catch",
  "class",
  "consuming",
  "continue",
  "convenience",
  "default",
  "defer",
  "deinit",
  "distributed",
  "do",
  "dynamic",
  "else",
  "enum",
  "extension",
  "fallthrough",
  "false",
  "fileprivate",
  "final",
  "for",
  "func",
  "get",
  "guard",
  "if",
  "import",
  "in",
  "indirect",
  "infix",
  "init",
  "inout",
  "internal",
  "is",
  "isolated",
  "lazy",
  "let",
  "macro",
  "mutating",
  "nil",
  "nonisolated",
  "nonmutating",
  "open",
  "operator",
  "optional",
  "override",
  "package",
  "postfix",
  "precedencegroup",
  "prefix",
  "private",
  "protocol",
  "public",
  "repeat",
  "required",
  "rethrows",
  "return",
  "self",
  "Self",
  "sending",
  "set",
  "some",
  "static",
  "struct",
  "subscript",
  "super",
  "switch",
  "throw",
  "throws",
  "true",
  "try",
  "typealias",
  "unowned",
  "var",
  "weak",
  "where",
  "while",
]);

function isIdentStart(ch: string): boolean {
  return /[A-Za-z_]/.test(ch);
}

function isIdentPart(ch: string): boolean {
  return /[A-Za-z0-9_]/.test(ch);
}

/**
 * Tokenizes Swift source code line-by-line into syntax-highlighted tokens.
 * Handles multi-line block comments, string literals, backtick-escaped identifiers,
 * attributes (@MainActor/#available), keywords, types, function calls, and numbers.
 */
export function tokenizeSwift(code: string): SwiftToken[][] {
  const lines = code.replace(/\r\n/g, "\n").split("\n");
  const result: SwiftToken[][] = [];
  let inBlockComment = false;

  for (const line of lines) {
    const tokens: SwiftToken[] = [];
    let i = 0;

    while (i < line.length) {
      if (inBlockComment) {
        const closeIdx = line.indexOf("*/", i);
        if (closeIdx === -1) {
          tokens.push({ kind: "comment", text: line.slice(i) });
          i = line.length;
        } else {
          tokens.push({ kind: "comment", text: line.slice(i, closeIdx + 2) });
          i = closeIdx + 2;
          inBlockComment = false;
        }
        continue;
      }

      const ch = line[i];
      const next = line[i + 1] ?? "";

      // Line comment
      if (ch === "/" && next === "/") {
        tokens.push({ kind: "comment", text: line.slice(i) });
        break;
      }

      // Block comment start
      if (ch === "/" && next === "*") {
        const closeIdx = line.indexOf("*/", i + 2);
        if (closeIdx === -1) {
          tokens.push({ kind: "comment", text: line.slice(i) });
          inBlockComment = true;
          break;
        }
        tokens.push({ kind: "comment", text: line.slice(i, closeIdx + 2) });
        i = closeIdx + 2;
        continue;
      }

      // String literal
      if (ch === '"') {
        let j = i + 1;
        while (j < line.length) {
          if (line[j] === "\\") {
            j += 2;
            continue;
          }
          if (line[j] === '"') {
            j += 1;
            break;
          }
          j += 1;
        }
        tokens.push({ kind: "string", text: line.slice(i, j) });
        i = j;
        continue;
      }

      // Backtick-escaped identifier/keyword like `in` or `protocol`
      if (ch === "`") {
        const closeIdx = line.indexOf("`", i + 1);
        if (closeIdx !== -1) {
          tokens.push({ kind: "backtick", text: line.slice(i, closeIdx + 1) });
          i = closeIdx + 1;
          continue;
        }
      }

      // Attribute or compiler directive (@MainActor, #available)
      if ((ch === "@" || ch === "#") && isIdentStart(next)) {
        let j = i + 2;
        while (j < line.length && isIdentPart(line[j])) j += 1;
        tokens.push({ kind: "attribute", text: line.slice(i, j) });
        i = j;
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        let j = i + 1;
        while (j < line.length && /[0-9A-Fa-fxXoObB_.]/.test(line[j])) j += 1;
        tokens.push({ kind: "number", text: line.slice(i, j) });
        i = j;
        continue;
      }

      // Identifiers / keywords / types / function calls
      if (isIdentStart(ch)) {
        let j = i + 1;
        while (j < line.length && isIdentPart(line[j])) j += 1;
        const word = line.slice(i, j);
        const afterSpace = line.slice(j).trimStart();

        if (SWIFT_KEYWORDS.has(word)) {
          tokens.push({ kind: "keyword", text: word });
        } else if (afterSpace.startsWith("(")) {
          tokens.push({ kind: "function", text: word });
        } else if (/^[A-Z][A-Za-z0-9_]*$/.test(word)) {
          tokens.push({ kind: "type", text: word });
        } else {
          tokens.push({ kind: "plain", text: word });
        }
        i = j;
        continue;
      }

      // Whitespace or punctuation/operators
      if (/\s/.test(ch)) {
        let j = i + 1;
        while (j < line.length && /\s/.test(line[j])) j += 1;
        tokens.push({ kind: "plain", text: line.slice(i, j) });
        i = j;
        continue;
      }

      if (/[=+\-*/<>!&|?:.~]/.test(ch)) {
        let j = i + 1;
        while (j < line.length && /[=+\-*/<>!&|?:.~]/.test(line[j])) j += 1;
        tokens.push({ kind: "operator", text: line.slice(i, j) });
        i = j;
        continue;
      }

      tokens.push({ kind: "plain", text: ch });
      i += 1;
    }

    result.push(tokens);
  }

  return result;
}
