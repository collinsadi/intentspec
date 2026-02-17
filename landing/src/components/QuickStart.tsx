export function QuickStart() {
  return (
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
  )
}
