import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkKoreanCopy, checkScriptCopy } from "../src/lib/korean-copy";

const root = fileURLToPath(new URL("../", import.meta.url));
const episodes = join(root, "episodes");
let files = process.argv.slice(2).filter(arg => arg !== "--");
if (!files.length) {
  files = readdirSync(episodes).filter(n => /^SE-\d+$/.test(n) && readdirSync(join(episodes,n)).includes("script.json"))
    .map(n => join(episodes,n,"script.json"));
  for (const file of ["narration.tsv", "film.py", "draw.py", "produce.py", "film_opening.py", "motion/lines.json", "motion/motion.js"]) {
    files.push(join(episodes, "unicode-1.0", file));
  }
}
let errors = 0;
for (const file of files) {
  const input = readFileSync(resolve(file), "utf8");
  function report(position: string, message: string) {
    console.error(`${file}:${position} [ko-copy] ${message}`);
    errors++;
  }
  if (file.endsWith("script.json")) {
    checkScriptCopy(JSON.parse(input), (path, message) => report(path.join("."), message));
  } else {
    input.split(/\r?\n/u).forEach((line, i) => {
      const message = checkKoreanCopy(line);
      if (message) report(String(i + 1), message);
    });
  }
}
if (errors) process.exitCode = 1;
else console.log(`한국어 문구 린트 통과 (${files.length}개 파일)`);
