import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { keccak256 } from "ethereum-cryptography/keccak.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Default path for single-file extraction (relative to package) */
const SOLIDITY_FILE_PATH = join(__dirname, "../../../internal-test/contracts/UserProxy.sol");

/** IntentSpec schema-aligned types (packages/schema/intentspec.schema.json) */
export interface IntentSpecContract {
  name: string;
  version?: string;
  description?: string;
}

export interface IntentSpecFunction {
  name: string;
  /** EVM function selector in hexadecimal (0x + 8 hex chars) */
  signature?: string;
  intent: string;
  preconditions?: string[];
  effects?: string[];
  risks?: string[];
  agentGuidance?: string;
}

export interface IntentSpecEvent {
  name: string;
  description?: string;
}

export interface IntentSpec {
  contract: IntentSpecContract;
  functions: IntentSpecFunction[];
  events?: IntentSpecEvent[];
  invariants?: string[];
}

export interface ExtractResult {
  ok: true;
  spec: IntentSpec;
}

export interface ExtractError {
  ok: false;
  reason: string;
}

export type ExtractOutcome = ExtractResult | ExtractError;

const CONTRACT_REGEX = /\bcontract\s+(\w+)\s*\{/;
const NATSPEC_BLOCK_REGEX = /\/\*\*([\s\S]*?)\*\//g;
/** Custom tags: agent-intent, agent-precondition, agent-effect, agent-risk, agent-guidance, agent-version, agent-description, agent-invariant, agent-event */
const CUSTOM_TAG_REGEX = /^@custom:([\w-]+)\s+(.*)$/s;

/** Canonical Solidity type names for the ABI function selector (no spaces). */
function canonicalType(raw: string): string {
  const t = raw.trim();
  if (t === "uint") return "uint256";
  if (t === "int") return "int256";
  if (t === "byte") return "bytes1";
  return t;
}

/**
 * Extract parameter types from a Solidity function parameter list string.
 * e.g. "address target, bytes calldata data, uint256 amount" -> ["address", "bytes", "uint256"]
 */
function parseParamTypes(paramList: string): string[] {
  const types: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < paramList.length; i++) {
    const c = paramList[i];
    if (c === "(" || c === "<") depth++;
    else if (c === ")" || c === ">") depth--;
    else if (depth === 0 && c === ",") {
      const part = paramList.slice(start, i).trim();
      types.push(extractTypeFromParam(part));
      start = i + 1;
    }
  }
  if (start <= paramList.length - 1) {
    const part = paramList.slice(start).trim();
    if (part) types.push(extractTypeFromParam(part));
  }
  return types;
}

function extractTypeFromParam(part: string): string {
  const tokens = part.split(/\s+/).filter((t) => !["memory", "calldata", "storage"].includes(t));
  if (tokens.length === 0) return "address"; // fallback
  const typePart = tokens.length === 1 ? tokens[0]! : tokens.slice(0, -1).join(" ");
  return canonicalType(typePart);
}

/**
 * Compute EVM function selector (first 4 bytes of keccak256("functionName(type1,type2,...)") in hex.
 */
function functionSelectorHex(content: string, functionStartIndex: number): string | undefined {
  const rest = content.slice(functionStartIndex);
  const headerMatch = rest.match(/^\s*function\s+(\w+)\s*\(/);
  if (!headerMatch) return undefined;
  const name = headerMatch[1]!;
  const openParen = functionStartIndex + headerMatch[0].length - 1;
  let depth = 1;
  let closeParen = openParen + 1;
  for (; closeParen < content.length && depth > 0; closeParen++) {
    const c = content[closeParen];
    if (c === "(") depth++;
    else if (c === ")") depth--;
  }
  if (depth !== 0) return undefined;
  const paramList = content.slice(openParen + 1, closeParen - 1);
  const types = parseParamTypes(paramList);
  const signature = `${name}(${types.join(",")})`;
  const hash = keccak256(Buffer.from(signature, "utf8"));
  const selector = hash.slice(0, 4);
  return "0x" + Buffer.from(selector).toString("hex");
}

/**
 * Check if the file content contains a contract declaration.
 */
function hasContractDeclaration(content: string): boolean {
  return CONTRACT_REGEX.test(content);
}

/**
 * Get the next significant token after a position (skip whitespace and single-line comments).
 * Returns { token: "contract" | "function", name, index } or { token: "other", index } or null.
 */
function nextTokenAfter(
  content: string,
  endIndex: number
): { token: string; name?: string; index: number } | null {
  let i = endIndex;
  const len = content.length;
  while (i < len) {
    const rest = content.slice(i);
    const ws = rest.match(/^(\s+)/);
    if (ws) {
      i += ws[1].length;
      continue;
    }
    const lineComment = rest.match(/^\/\/[^\n]*/);
    if (lineComment) {
      i += lineComment[0].length;
      continue;
    }
    const blockComment = rest.match(/^\/\*[\s\S]*?\*\//);
    if (blockComment) {
      i += blockComment[0].length;
      continue;
    }
    const contractMatch = rest.match(/^\bcontract\s+(\w+)\s*\{/);
    if (contractMatch) {
      return { token: "contract", name: contractMatch[1], index: i };
    }
    const fn = rest.match(/^\bfunction\s+(\w+)\s*\(/);
    if (fn) {
      return { token: "function", name: fn[1], index: i };
    }
    return { token: "other", index: i };
  }
  return null;
}

/**
 * Normalize block text: remove leading * and trim lines.
 */
function normalizeBlockLines(blockText: string): string[] {
  return blockText
    .replace(/^\s*\*\s?/gm, "")
    .replace(/^\s+|\s+$/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Parse contract-level NatSpec (version, description, invariants, events).
 * Tags: @custom:agent-version, @dev / @custom:agent-description, @custom:agent-invariant, @custom:agent-event
 * - agent-event format: "EventName Description text" (first word = name, rest = description)
 */
function parseContractNatSpec(blockText: string): Partial<IntentSpecContract> & { invariants?: string[]; events?: IntentSpecEvent[] } {
  const lines = normalizeBlockLines(blockText);
  const out: Partial<IntentSpecContract> & { invariants?: string[]; events?: IntentSpecEvent[] } = {};
  const invariants: string[] = [];
  const events: IntentSpecEvent[] = [];

  for (const line of lines) {
    const customMatch = line.match(CUSTOM_TAG_REGEX);
    if (customMatch) {
      const [, tag, value] = customMatch;
      const v = value.trim();
      if (tag === "agent-version") {
        out.version = v;
      } else if (tag === "agent-description") {
        out.description = v;
      } else if (tag === "agent-invariant") {
        invariants.push(v);
      } else if (tag === "agent-event") {
        const firstSpace = v.indexOf(" ");
        const name = firstSpace >= 0 ? v.slice(0, firstSpace) : v;
        const description = firstSpace >= 0 ? v.slice(firstSpace + 1).trim() : undefined;
        events.push(description ? { name, description } : { name });
      }
      continue;
    }
    const devMatch = line.match(/^@dev\s+(.*)$/s);
    if (devMatch && !out.description) {
      out.description = devMatch[1].trim();
      continue;
    }
    const titleMatch = line.match(/^@title\s+(.*)$/s);
    if (titleMatch && !out.description) {
      out.description = titleMatch[1].trim();
      continue;
    }
  }

  if (invariants.length) out.invariants = invariants;
  if (events.length) out.events = events;
  return out;
}

/**
 * Parse function-level NatSpec into schema-aligned function entry.
 * Tags: @custom:agent-intent (required), @custom:agent-precondition, @custom:agent-effect, @custom:agent-risk, @custom:agent-guidance
 * Multiple preconditions/effects/risks → arrays.
 */
function parseFunctionNatSpec(blockText: string): Partial<IntentSpecFunction> | null {
  const lines = normalizeBlockLines(blockText);
  const preconditions: string[] = [];
  const effects: string[] = [];
  const risks: string[] = [];
  let intent: string | undefined;
  let agentGuidance: string | undefined;

  for (const line of lines) {
    const customMatch = line.match(CUSTOM_TAG_REGEX);
    if (customMatch) {
      const [, tag, value] = customMatch;
      const v = value.trim();
      if (tag === "agent-intent") {
        intent = v;
      } else if (tag === "agent-precondition") {
        preconditions.push(v);
      } else if (tag === "agent-effect") {
        effects.push(v);
      } else if (tag === "agent-risk") {
        risks.push(v);
      } else if (tag === "agent-guidance") {
        agentGuidance = v;
      }
      continue;
    }
  }

  if (!intent) return null;
  const fn: IntentSpecFunction = { name: "", intent };
  if (preconditions.length) fn.preconditions = preconditions;
  if (effects.length) fn.effects = effects;
  if (risks.length) fn.risks = risks;
  if (agentGuidance) fn.agentGuidance = agentGuidance;
  return fn;
}

/**
 * Extract NatSpec from file content.
 * Skips (returns error) if content has no contract declaration.
 * - Contract-level block is the one immediately above `contract Name {` → version, description, invariants, events.
 * - Function-level blocks are those immediately above a `function` → intent, preconditions, effects, risks, agentGuidance.
 */
export function extractFromContent(content: string): ExtractOutcome {
  if (!hasContractDeclaration(content)) {
    return { ok: false, reason: "File does not contain a contract declaration" };
  }

  const contractMatch = content.match(CONTRACT_REGEX);
  const contractName = contractMatch ? contractMatch[1]! : "Unknown";

  let contractSpec: IntentSpecContract = { name: contractName };
  const invariants: string[] = [];
  const events: IntentSpecEvent[] = [];
  const functions: IntentSpecFunction[] = [];

  let m: RegExpExecArray | null;
  NATSPEC_BLOCK_REGEX.lastIndex = 0;
  while ((m = NATSPEC_BLOCK_REGEX.exec(content)) !== null) {
    const blockText = m[1]!;
    const blockEndIndex = m.index + m[0].length;
    const next = nextTokenAfter(content, blockEndIndex);
    if (!next) continue;

    if (next.token === "contract") {
      const parsed = parseContractNatSpec(blockText);
      if (parsed.version) contractSpec.version = parsed.version;
      if (parsed.description) contractSpec.description = parsed.description;
      if (parsed.invariants?.length) invariants.push(...parsed.invariants);
      if (parsed.events?.length) events.push(...parsed.events);
      continue;
    }

    if (next.token === "function") {
      const parsed = parseFunctionNatSpec(blockText);
      if (parsed) {
        const signature = functionSelectorHex(content, next.index);
        functions.push({
          ...parsed,
          name: next.name!,
          ...(signature && { signature }),
        } as IntentSpecFunction);
      }
      continue;
    }
  }

  const spec: IntentSpec = {
    contract: contractSpec,
    functions,
  };
  if (events.length) spec.events = events;
  if (invariants.length) spec.invariants = invariants;

  return { ok: true, spec };
}

/**
 * Extract NatSpec from a Solidity file at the given path.
 */
export function extractNatSpec(filePath: string): ExtractOutcome {
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch (e) {
    return { ok: false, reason: `Failed to read file: ${filePath}` };
  }
  return extractFromContent(content);
}

export function getSolidityFilePath(): string {
  return SOLIDITY_FILE_PATH;
}
