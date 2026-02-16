import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-black text-white bg-grid">
      {/* Nav */}
      <header className="border-b border-border sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
        <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-mono font-medium text-lg tracking-tight">Intent Spec</span>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="https://www.npmjs.com/package/intentspec" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">npm</a>
            <a href="https://www.youtube.com/watch?v=6IwccYEbqZc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Demo</a>
            <a href="https://github.com/collinsadi/intentspec/tree/main/cli" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24">
        {/* Hero */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-24">
          <p className="font-mono text-sm text-green-500 mb-4">Agent-readable metadata for smart contracts</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6 leading-[1.15]">
            Bridge the semantic gap between on-chain logic and autonomous reasoning.
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed mb-10">
            Add a standardized, machine-verifiable metadata layer so developers can declare a function's intent, economic impact, and safety boundaries. Turn opaque bytecode into structured semantics.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.npmjs.com/package/intentspec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-black font-medium text-sm transition-colors font-mono"
            >
              npx intentspec compile
            </a>
            <a
              href="https://www.youtube.com/watch?v=6IwccYEbqZc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#252525] hover:border-gray-600 text-gray-300 hover:text-white font-medium text-sm transition-colors"
            >
              Watch demo
            </a>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="py-16 border-t border-border">
          <h2 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">Why Intent Spec</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-gray-500 font-mono text-sm mb-3">The problem</h3>
              <p className="text-gray-300 leading-relaxed">
                Agents infer behavior from function names and ABIs alone. Is <code className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-sm">execute()</code> a harmless update or a high-risk transfer? Preconditions and irreversibility stay invisible.
              </p>
            </div>
            <div>
              <h3 className="text-green-500 font-mono text-sm mb-3">The solution</h3>
              <p className="text-gray-300 leading-relaxed">
                Declare intent, preconditions, effects, and risks in NatSpec. The CLI emits schema-strict JSON. Publish the spec; implement <code className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-sm">getIntentSpecURI()</code> so agents can discover and validate before signing.
              </p>
            </div>
          </div>
        </section>

        {/* Code block */}
        <section className="py-16 border-t border-border">
          <h2 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">Quick start</h2>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <span className="font-mono text-xs text-gray-500 ml-2">Contract.sol</span>
            </div>
            <pre className="p-5 overflow-x-auto text-sm font-mono leading-relaxed">
              <code>
                <span className="text-gray-500">/// @custom:agent-intent</span> Withdraws collateral and closes position{'\n'}
                <span className="text-gray-500">/// @custom:agent-risk</span> High slippage during volatility{'\n'}
                <span className="text-[#c084fc]">function</span> <span className="text-[#22d3ee]">exitPosition</span>(<span className="text-[#fbbf24]">uint256</span> amount) <span className="text-[#c084fc]">external</span> {'{'} ... {'}'}
              </code>
            </pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <span className="font-mono text-xs text-gray-500">Terminal</span>
            </div>
            <pre className="p-5 overflow-x-auto text-sm font-mono leading-relaxed">
              <code>
                <span className="text-gray-500">$</span> npx intentspec compile{'\n'}
                <span className="text-green-500">→ intentspec/ContractName.json</span>
              </code>
            </pre>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-border">
          <h2 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">Use cases</h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {[
              'DeFi protocols — Make contracts interpretable by agents for agentic liquidity.',
              'Security auditors — Machine-readable spec to compare against bytecode and behavior.',
              'Users — Agents can explain transaction risks in plain language.',
              'Systemic safety — Reduce AI-driven flash crashes from misinterpreted logic.',
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-gray-400">
                <span className="text-green-500 font-mono shrink-0">→</span>
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-border">
          <div className="rounded-2xl border border-border bg-surface p-8 md:p-10 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Ready to add intent metadata?</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">Install the CLI and annotate your Solidity with <span className="font-mono text-gray-300">@custom:agent-*</span> NatSpec tags.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://www.npmjs.com/package/intentspec"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-black font-medium text-sm transition-colors font-mono"
              >
                npm install -g intentspec
              </a>
              <a
                href="https://github.com/collinsadi/intentspec/tree/main/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#252525] hover:border-gray-600 text-gray-300 hover:text-white font-medium text-sm transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 pb-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span className="font-mono">Intent Spec</span>
          <span>MIT © Collins Adi</span>
        </footer>
      </main>
    </div>
  )
}

export default App
