import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const srcDir = fileURLToPath(new URL("../src/", import.meta.url));

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = path.join(srcDir, specifier.slice(2));
    const candidates = [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")];
    const match = candidates.find((candidate) => existsSync(candidate));
    if (!match) {
      throw new Error(`Cannot resolve ${specifier}`);
    }
    return {
      url: pathToFileURL(match).href,
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}
