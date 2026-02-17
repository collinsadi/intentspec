/**
 * Custom syntax highlighters that render with fixed typography so they align
 * exactly with the textarea (no third-party library inline styles).
 */

const SOLIDITY_KEYWORDS = new Set([
  'pragma', 'solidity', 'contract', 'function', 'external', 'internal', 'public', 'private',
  'view', 'pure', 'returns', 'address', 'uint256', 'uint8', 'uint', 'bool', 'string', 'bytes',
  'memory', 'calldata', 'immutable', 'constructor', 'event', 'error', 'import',
])

type Token = { type: string; value: string }

function tokenizeSolidity(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const s = source
  while (i < s.length) {
    const rest = s.slice(i)
    if (rest.startsWith('//')) {
      const end = rest.indexOf('\n')
      const value = end === -1 ? rest : rest.slice(0, end)
      tokens.push({ type: 'comment', value })
      i += value.length
      continue
    }
    if (rest.startsWith('/*')) {
      const end = rest.indexOf('*/')
      const value = end === -1 ? rest : rest.slice(0, end + 2)
      tokens.push({ type: 'comment', value })
      i += value.length
      continue
    }
    if (rest.startsWith('"') || rest.startsWith("'")) {
      const q = rest[0]
      let j = 1
      while (j < rest.length) {
        if (rest[j] === '\\') j += 2
        else if (rest[j] === q) { j++; break }
        else j++
      }
      tokens.push({ type: 'string', value: rest.slice(0, j) })
      i += j
      continue
    }
    if (rest.match(/^@custom:agent-\S+/)) {
      const m = rest.match(/^(@custom:agent-\S+)/)!
      tokens.push({ type: 'tag', value: m[1] })
      i += m[1].length
      continue
    }
    if (rest.match(/^\b[\w]+\b/)) {
      const m = rest.match(/^(\b[\w]+\b)/)!
      const word = m[1]
      tokens.push({
        type: SOLIDITY_KEYWORDS.has(word) ? 'keyword' : 'plain',
        value: word,
      })
      i += word.length
      continue
    }
    tokens.push({ type: 'plain', value: rest[0] })
    i += 1
  }
  return tokens
}

const SOLIDITY_STYLES: Record<string, string> = {
  comment: 'text-gray-500',
  string: 'text-[#fde047]',
  tag: 'text-green-500',
  keyword: 'text-[#c084fc]',
  plain: 'text-gray-300',
}

export function SolidityHighlighter({ code }: { code: string }) {
  const tokens = tokenizeSolidity(code)
  return (
    <code
      className="block font-mono whitespace-pre-wrap wrap-break-word"
      style={{ fontSize: '0.875rem', lineHeight: 1.5 }}
    >
      {tokens.map((t, i) => (
        <span key={i} className={SOLIDITY_STYLES[t.type] ?? SOLIDITY_STYLES.plain}>
          {t.value}
        </span>
      ))}
    </code>
  )
}

function tokenizeJson(json: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const s = json
  while (i < s.length) {
    const rest = s.slice(i)
    const keyMatch = rest.match(/^"([^"\\]*(\\.[^"\\]*)*)"\s*:/)
    if (keyMatch) {
      tokens.push({ type: 'key', value: keyMatch[0] })
      i += keyMatch[0].length
      continue
    }
    const strMatch = rest.match(/^"([^"\\]*(\\.[^"\\]*)*)"/)
    if (strMatch) {
      tokens.push({ type: 'string', value: strMatch[0] })
      i += strMatch[0].length
      continue
    }
    const numMatch = rest.match(/^-?\d+\.?\d*([eE][+-]?\d+)?/)
    if (numMatch) {
      tokens.push({ type: 'number', value: numMatch[0] })
      i += numMatch[0].length
      continue
    }
    if (rest.startsWith('true') || rest.startsWith('false')) {
      const v = rest.startsWith('true') ? 'true' : 'false'
      tokens.push({ type: 'bool', value: v })
      i += v.length
      continue
    }
    if (rest.startsWith('null')) {
      tokens.push({ type: 'null', value: 'null' })
      i += 4
      continue
    }
    if (/[{}\[\],:]/.test(rest[0])) {
      tokens.push({ type: 'punct', value: rest[0] })
      i += 1
      continue
    }
    tokens.push({ type: 'plain', value: rest[0] })
    i += 1
  }
  return tokens
}

const JSON_STYLES: Record<string, string> = {
  key: 'text-[#7dd3fc]',
  string: 'text-[#fde047]',
  number: 'text-[#fb923c]',
  bool: 'text-[#c084fc]',
  null: 'text-[#94a3b8]',
  punct: 'text-gray-500',
  plain: 'text-gray-400',
}

export function JsonHighlighter({ code }: { code: string }) {
  const tokens = tokenizeJson(code)
  return (
    <code
      className="block font-mono text-xs whitespace-pre-wrap break-all"
      style={{ lineHeight: 1.5 }}
    >
      {tokens.map((t, i) => (
        <span key={i} className={JSON_STYLES[t.type] ?? JSON_STYLES.plain}>
          {t.value}
        </span>
      ))}
    </code>
  )
}
