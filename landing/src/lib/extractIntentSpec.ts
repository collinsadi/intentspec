/** Normalize block: strip * and leading/trailing whitespace from lines */
function normalizeBlock(text: string): string {
  return text
    .replace(/\s*\*\s*$/gm, '')
    .replace(/^\s*\/?\*?\s?/gm, '')
    .replace(/^\s*\*\s?/gm, '')
    .trim()
}

/** Extract tag values from a comment block */
export function getTagValues(block: string, tag: string): string[] {
  const out: string[] = []
  const blockRe = new RegExp(`@custom:agent-${tag}\\s+([\\s\\S]+?)(?=\\n\\s*\\*?\\s*@custom:|\\n\\s*\\*\\/|$)`, 'g')
  let m
  while ((m = blockRe.exec(block)) !== null) {
    out.push(normalizeBlock(m[1]))
  }
  const lineRe = new RegExp(`@custom:agent-${tag}\\s+(.+)$`, 'gm')
  while ((m = lineRe.exec(block)) !== null) {
    const v = m[1].trim()
    if (v) out.push(v)
  }
  return [...new Set(out)]
}

export type ExtractResult =
  | { ok: true; json: object; contractName: string }
  | { ok: false; error: string }

/** In-browser extractor: parses @custom:agent-* tags and emits schema-shaped JSON. */
export function extractIntentSpec(source: string): ExtractResult {
  const contractMatch = source.match(/contract\s+(\w+)\s*[\{\s]/)
  if (!contractMatch) return { ok: false, error: 'No contract found. Add a contract declaration.' }

  const contractName = contractMatch[1]
  const contractBlockMatch = source.match(/\/\*\*([\s\S]*?)\*\/\s*contract\s+\w+\s*[\{\s]/)
  const contractBlock = contractBlockMatch ? contractBlockMatch[1] : ''
  const getTag = (block: string, tag: string) => getTagValues(block, tag)
  const getSingle = (block: string, tag: string) => getTag(block, tag)[0]

  const contract: Record<string, string> = { name: contractName }
  const v = getSingle(contractBlock, 'version')
  if (v) contract.version = v
  const d = getSingle(contractBlock, 'description')
  if (d) contract.description = d

  const invariants = getTag(contractBlock, 'invariant').filter(Boolean)
  const events: { name: string; description?: string }[] = []
  for (const line of getTag(contractBlock, 'event')) {
    const [name, ...rest] = line.split(/\s+/)
    if (name) events.push({ name, description: rest.join(' ').trim() || undefined })
  }

  const functions: Array<{
    name: string
    intent: string
    signature?: string
    preconditions?: string[]
    effects?: string[]
    risks?: string[]
    agentGuidance?: string
  }> = []
  const fnWithComment = source.matchAll(/(\/\*\*[\s\S]*?\*\/)\s*function\s+(\w+)\s*\([^)]*\)\s*[\s\S]*?\{/g)
  for (const [, block, fnName] of fnWithComment) {
    const intent = getSingle(block, 'intent')
    if (!intent) continue
    const preconditions = getTag(block, 'precondition').filter(Boolean)
    const effects = getTag(block, 'effect').filter(Boolean)
    const risks = getTag(block, 'risk').filter(Boolean)
    const agentGuidance = getSingle(block, 'guidance')
    functions.push({
      name: fnName,
      intent,
      signature: '0x' + Array(8).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      ...(preconditions.length > 0 && { preconditions }),
      ...(effects.length > 0 && { effects }),
      ...(risks.length > 0 && { risks }),
      ...(agentGuidance && { agentGuidance }),
    })
  }

  if (functions.length === 0)
    return { ok: false, error: 'No function with @custom:agent-intent found. Add at least one.' }

  const result: Record<string, unknown> = { contract, functions }
  if (events.length > 0) result.events = events
  if (invariants.length > 0) result.invariants = invariants
  return { ok: true, json: result, contractName }
}

export function isCompileCommand(cmd: string): boolean {
  const c = cmd.trim().toLowerCase()
  return (
    c === 'npx intentspec compile' ||
    c === 'intentspec compile' ||
    c === 'compile'
  )
}
