import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const banned = [
  "guaranteed return",
  "safest investment",
  "safe investment",
  "best stock",
  "you should definitely buy",
  "this will make you money",
  "you will earn",
];

function sourceFiles(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...sourceFiles(fullPath));
      continue;
    }
    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx") || fullPath.endsWith(".css")) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("educational language", () => {
  it("does not use prohibited promise language in the prototype source", () => {
    const files = sourceFiles(path.join(root, "src"));
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8").toLowerCase();
      for (const phrase of banned) {
        if (text.includes(phrase)) hits.push(`${path.relative(root, file)}: ${phrase}`);
      }
    }
    assert.deepEqual(hits, []);
  });
});
