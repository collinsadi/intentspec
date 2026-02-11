#!/usr/bin/env node

import { mkdirSync, readdirSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { program } from "commander";
import {
  logBanner,
  logError,
  logInfo,
  logStep,
  logSuccess,
  logWarning,
} from "./logger";
import { extractNatSpec, getSolidityFilePath } from "./natspec";

const INTENTSPEC_DIR = "intentspec";

program
  .name("intentspec")
  .description("CLI for IntentSpec")
  .version("0.1.0");

program
  .command("extract-natspec")
  .description("Extract NatSpec from a single Solidity file and print JSON")
  .option("-f, --file <path>", "Solidity file path (default: internal-test/contracts/UserProxy.sol)")
  .action((opts) => {
    const filePath = opts.file ? join(process.cwd(), opts.file) : getSolidityFilePath();
    logInfo(`Reading ${relative(process.cwd(), filePath) || filePath}`);
    const result = extractNatSpec(filePath);
    if (!result.ok) {
      logError(result.reason);
      logStep("Ensure the file contains a contract declaration and valid NatSpec.");
      process.exit(1);
    }
    logSuccess(`Extracted spec for contract "${result.spec.contract.name}"`);
    console.log(JSON.stringify(result.spec, null, 2));
  });

program
  .command("compile")
  .description("Find all Solidity files in the directory, generate specs, and write intentspec/<ContractName>.json for each file that has a contract")
  .option("-d, --dir <path>", "Root directory to search (default: cwd)", process.cwd())
  .action((opts) => {
    const rootDir = opts.dir ?? process.cwd();
    logInfo(`Scanning for .sol files in ${rootDir === process.cwd() ? "current directory" : rootDir}`);

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

    if (files.length === 0) {
      logWarning("No Solidity files found.");
      logStep("Add .sol files with contract declarations and @custom:agent-* NatSpec, then run again.");
      return;
    }

    logStep(`Found ${files.length} .sol file(s)`);
    const outDir = join(rootDir, INTENTSPEC_DIR);
    logInfo(`Creating output directory: ${INTENTSPEC_DIR}/`);
    mkdirSync(outDir, { recursive: true });

    let written = 0;
    let skipped = 0;
    const skippedPaths: string[] = [];

    for (const file of files) {
      const rel = relative(rootDir, file);
      const result = extractNatSpec(file);
      if (!result.ok) {
        skipped++;
        skippedPaths.push(rel);
        logStep(`Skipped ${rel} (no contract or invalid spec)`);
        continue;
      }
      const name = result.spec.contract.name;
      const outPath = join(outDir, `${name}.json`);
      writeFileSync(outPath, JSON.stringify(result.spec, null, 2), "utf-8");
      written++;
      logStep(`Wrote ${INTENTSPEC_DIR}/${name}.json from ${rel}`);
    }

    if (written > 0) {
      logBanner();
      logSuccess(`Compilation complete: ${written} spec(s) written to ${INTENTSPEC_DIR}/`);
      logInfo("Next steps:");
      logStep(`Inspect generated files in ./${INTENTSPEC_DIR}/`);
      logStep("Publish specs (e.g. IPFS) and update on-chain pointer when ready.");
      logStep("Run intentspec compile again after changing NatSpec in your contracts.");
    } else {
      logWarning("No contracts with valid NatSpec were found.");
      logStep("Add @custom:agent-intent (and optional agent-precondition, agent-effect, etc.) above functions.");
      logStep("Add a contract-level NatSpec block above your contract for version, description, invariants, events.");
    }
    if (skipped > 0) {
      logWarning(`${skipped} file(s) skipped (no contract declaration).`);
    }
  });

program.parse();
