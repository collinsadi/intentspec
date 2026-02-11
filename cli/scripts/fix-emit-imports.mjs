#!/usr/bin/env node
/**
 * Post-build: add .js to relative imports in dist so Node ESM can resolve them.
 * Source keeps extensionless imports; this runs after tsc.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const distDir = join(dirname(fileURLToPath(import.meta.url)), "../dist");
const files = ["index.js", "natspec.js", "logger.js"];

for (const name of files) {
  const path = join(distDir, name);
  try {
    let code = readFileSync(path, "utf-8");
    code = code.replace(/from\s+["'](\.\/[^"']+)["']/g, (_, spec) => {
      if (spec.endsWith(".js")) return `from "${spec}"`;
      return `from "${spec}.js"`;
    });
    writeFileSync(path, code);
  } catch (_) {}
}
