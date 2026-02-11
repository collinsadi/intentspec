#!/usr/bin/env node

import { mkdirSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { program } from "commander";
import { extractNatSpec, getSolidityFilePath } from "./natspec.js";

const INTENTSPEC_DIR = "intentspec";

program
  .name("intent-spec")
  .description("CLI for IntentSpec")
  .version("0.1.0");

program
  .command("extract-natspec")
  .description("Extract NatSpec from a single Solidity file and print JSON")
  .option("-f, --file <path>", "Solidity file path (default: internal-test/contracts/UserProxy.sol)")
  .action((opts) => {
    const filePath = opts.file ? join(process.cwd(), opts.file) : getSolidityFilePath();
    const result = extractNatSpec(filePath);
    if (!result.ok) {
      console.error(result.reason);
      process.exit(1);
    }
    console.log(JSON.stringify(result.spec, null, 2));
  });

program
  .command("generate")
  .description("Find all Solidity files in the directory, generate specs, and write intentspec/<ContractName>.json for each file that has a contract")
  .option("-d, --dir <path>", "Root directory to search (default: cwd)", process.cwd())
  .action((opts) => {
    const rootDir = opts.dir ?? process.cwd();
    const files: string[] = [];
    function walk(dir: string) {
      try {
        for (const name of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, name.name);
          if (name.isDirectory()) {
            if (name.name !== "node_modules" && name.name !== ".git") walk(full);
          } else if (name.name.endsWith(".sol")) {
            files.push(full);
          }
        }
      } catch (_) {}
    }
    walk(rootDir);
    const outDir = join(rootDir, INTENTSPEC_DIR);
    mkdirSync(outDir, { recursive: true });
    let written = 0;
    let skipped = 0;
    for (const file of files) {
      const result = extractNatSpec(file);
      if (!result.ok) {
        skipped++;
        continue;
      }
      const name = result.spec.contract.name;
      const outPath = join(outDir, `${name}.json`);
      writeFileSync(outPath, JSON.stringify(result.spec, null, 2), "utf-8");
      written++;
    }
    console.log(`Wrote ${written} spec(s) to ${INTENTSPEC_DIR}/ (skipped ${skipped} file(s) without a contract).`);
  });

program.parse();
