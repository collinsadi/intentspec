import { useState, useEffect } from 'react'
import { SolidityEditor } from './SolidityEditor'
import { JsonHighlighter } from './CustomHighlight'
import { extractIntentSpec, isCompileCommand } from '../lib/extractIntentSpec'
import { DEFAULT_SOLIDITY } from '../lib/constants'
import { CLI_BANNER } from '../lib/cliBanner'
import type { ExtractResult } from '../lib/extractIntentSpec'

type HistoryItem = { cmd: string; result: ExtractResult }

const RESIZER_WIDTH = 6
const MIN_PANEL_PERCENT = 20
const MAX_PANEL_PERCENT = 80

export function DemoSection() {
  const [demoSource, setDemoSource] = useState(DEFAULT_SOLIDITY)
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalHistory, setTerminalHistory] = useState<HistoryItem[]>([])
  const [expanded, setExpanded] = useState(false)
  const [splitPercent, setSplitPercent] = useState(50)
  const [resizing, setResizing] = useState(false)

  const runCompile = () => {
    const result = extractIntentSpec(demoSource)
    const cmd = terminalInput.trim() || 'npx intentspec compile'
    setTerminalHistory((prev) => [...prev, { cmd, result }])
    setTerminalInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cmd = terminalInput.trim()
    if (cmd.toLowerCase() === 'clear') {
      setTerminalHistory([])
      setTerminalInput('')
      return
    }
    if (!cmd || isCompileCommand(cmd)) runCompile()
    else {
      setTerminalHistory((prev) => [...prev, { cmd, result: { ok: false, error: 'Unknown command. Try: npx intentspec compile' } }])
      setTerminalInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = terminalInput.trim()
      if (cmd.toLowerCase() === 'clear') {
        setTerminalHistory([])
        setTerminalInput('')
        return
      }
      if (!cmd || isCompileCommand(cmd)) runCompile()
      else {
        setTerminalHistory((prev) => [...prev, { cmd, result: { ok: false, error: 'Unknown command. Try: npx intentspec compile' } }])
        setTerminalInput('')
      }
    }
  }

  useEffect(() => {
    if (!expanded) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [expanded])

  useEffect(() => {
    if (!resizing) return
    const onMouseMove = (e: MouseEvent) => {
      const container = document.getElementById('demo-fullscreen-container')
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percent = (x / rect.width) * 100
      const clamped = Math.max(MIN_PANEL_PERCENT, Math.min(MAX_PANEL_PERCENT, percent))
      setSplitPercent(clamped)
    }
    const onMouseUp = () => setResizing(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [resizing])

  const onResizerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setResizing(true)
  }

  return (
    <section id="demo" className="py-16 border-t border-border scroll-mt-24">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider">Try it</h2>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors font-mono text-xs"
          title="Expand to full screen"
          aria-label="Expand to full screen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          Expand
        </button>
      </div>
      <p className="text-gray-400 text-sm mb-6 max-w-2xl">
        Edit the Solidity on the left (add or change <span className="font-mono text-gray-300">@custom:agent-*</span> tags in block comments above each function). On the right, type <span className="font-mono text-gray-300">npx intentspec compile</span> and press Enter to compile. Output updates whenever you change the code and run again.
      </p>
      <div className="grid md:grid-cols-2 gap-4 h-[380px] md:h-[420px]">
        <div className="rounded-xl border border-border bg-surface overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center px-4 py-3 border-b border-border shrink-0">
            <span className="font-mono text-xs text-gray-500">Solidity</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-2">
            <SolidityEditor
              value={demoSource}
              onChange={setDemoSource}
              height="100%"
              className="h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:overflow-auto [&_.cm-content]:min-h-full"
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center px-4 py-3 border-b border-border shrink-0">
            <span className="font-mono text-xs text-gray-500">Terminal</span>
          </div>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-auto p-4">
            {terminalHistory.length > 0 && (
              <div className="space-y-3 mb-3">
                {terminalHistory.map((item, i) => (
                  <div key={i} className="font-mono text-sm">
                    <div className="text-gray-500">$ {item.cmd || 'npx intentspec compile'}</div>
                    {item.result.ok ? (
                      <>
                        <div className="text-cyan-400 mt-1">ℹ️ Scanning for .sol files in current directory</div>
                        <div className="text-gray-500">→ Found 1 .sol file(s)</div>
                        <div className="text-cyan-400">ℹ️ Creating output directory: intentspec/</div>
                        <div className="text-gray-500">→ Wrote intentspec/{item.result.contractName}.json</div>
                        <div className="my-2 overflow-x-auto overflow-y-hidden">
                          <pre
                            className="font-mono leading-tight text-blue-400 whitespace-pre w-max min-w-0"
                            style={{
                              fontSize: 'clamp(0.4rem, 2.2vw, 0.75rem)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {CLI_BANNER}
                          </pre>
                        </div>
                        <div className="text-green-500">✅ Compilation complete: 1 spec(s) written to intentspec/</div>
                        <div className="text-cyan-400 text-xs mt-1">ℹ️ Next steps:</div>
                        <div className="text-gray-500 text-xs">→ Inspect generated files in ./intentspec/</div>
                        <div className="mt-2 p-3 rounded-lg bg-black/40 overflow-x-auto">
                          <JsonHighlighter
                            code={JSON.stringify(item.result.json, null, 2)}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-red-400 mt-1">{item.result.error}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {terminalHistory.length === 0 && (
              <p className="text-gray-500 text-sm font-mono mb-3">
                Type <span className="text-gray-400">npx intentspec compile</span> and press Enter to compile.
              </p>
            )}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 font-mono text-sm shrink-0 p-4 border-t border-border">
              <span className="text-gray-500 shrink-0">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="npx intentspec compile"
                className="flex-1 min-w-0 bg-transparent text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-0"
                spellCheck={false}
              />
            </form>
          </div>
        </div>
      </div>

      {/* Fullscreen overlay: both panels side by side with resizable divider */}
      {expanded && (
        <div
          id="demo-fullscreen-container"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Try it full screen"
          style={{ userSelect: resizing ? 'none' : undefined }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <span className="font-mono text-sm text-gray-400">Try it — full screen</span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
              aria-label="Close full screen"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Left: Solidity */}
            <div className="flex flex-col overflow-hidden border-r border-border" style={{ width: `calc(${splitPercent}% - ${RESIZER_WIDTH / 2}px)` }}>
              <div className="flex items-center px-4 py-2 border-b border-border shrink-0">
                <span className="font-mono text-xs text-gray-500">Solidity</span>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden p-2">
                <SolidityEditor
                  value={demoSource}
                  onChange={setDemoSource}
                  height="100%"
                  className="h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:overflow-auto [&_.cm-content]:min-h-full"
                />
              </div>
            </div>
            {/* Resizer */}
            <div
              role="separator"
              aria-orientation="vertical"
              onMouseDown={onResizerMouseDown}
              className="shrink-0 flex items-center justify-center bg-border hover:bg-gray-600 cursor-col-resize transition-colors"
              style={{ width: RESIZER_WIDTH }}
              title="Drag to resize"
            >
              <div className="w-0.5 h-8 rounded-full bg-gray-600" />
            </div>
            {/* Right: Terminal */}
            <div className="flex flex-col overflow-hidden flex-1 min-w-0">
              <div className="flex items-center px-4 py-2 border-b border-border shrink-0">
                <span className="font-mono text-xs text-gray-500">Terminal</span>
              </div>
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 overflow-auto p-4">
                  {terminalHistory.length > 0 ? (
                    <div className="space-y-3 mb-3">
                      {terminalHistory.map((item, i) => (
                        <div key={i} className="font-mono text-sm">
                          <div className="text-gray-500">$ {item.cmd || 'npx intentspec compile'}</div>
                          {item.result.ok ? (
                            <>
                              <div className="text-cyan-400 mt-1">ℹ️ Scanning for .sol files in current directory</div>
                              <div className="text-gray-500">→ Found 1 .sol file(s)</div>
                              <div className="text-cyan-400">ℹ️ Creating output directory: intentspec/</div>
                              <div className="text-gray-500">→ Wrote intentspec/{item.result.contractName}.json</div>
                              <div className="my-2 overflow-x-auto overflow-y-hidden">
                                <pre className="font-mono leading-tight text-blue-400 whitespace-pre w-max min-w-0" style={{ fontSize: 'clamp(0.4rem, 2.2vw, 0.75rem)', fontVariantNumeric: 'tabular-nums' }}>{CLI_BANNER}</pre>
                              </div>
                              <div className="text-green-500">✅ Compilation complete: 1 spec(s) written to intentspec/</div>
                              <div className="text-cyan-400 text-xs mt-1">ℹ️ Next steps:</div>
                              <div className="text-gray-500 text-xs">→ Inspect generated files in ./intentspec/</div>
                              <div className="mt-2 p-3 rounded-lg bg-black/40 overflow-x-auto">
                                <JsonHighlighter code={JSON.stringify(item.result.json, null, 2)} />
                              </div>
                            </>
                          ) : (
                            <div className="text-red-400 mt-1">{item.result.error}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm font-mono mb-3">Type <span className="text-gray-400">npx intentspec compile</span> and press Enter to compile.</p>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="flex items-center gap-2 font-mono text-sm shrink-0 p-4 border-t border-border">
                  <span className="text-gray-500 shrink-0">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="npx intentspec compile"
                    className="flex-1 min-w-0 bg-transparent text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-0"
                    spellCheck={false}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
