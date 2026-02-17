const ITEMS = [
  'DeFi protocols — Make contracts interpretable by agents for agentic liquidity.',
  'Security auditors — Machine-readable spec to compare against bytecode and behavior.',
  'Users — Agents can explain transaction risks in plain language.',
  'Systemic safety — Reduce AI-driven flash crashes from misinterpreted logic.',
]

export function UseCases() {
  return (
    <section className="py-16 border-t border-border">
      <h2 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">Use cases</h2>
      <ul className="grid sm:grid-cols-2 gap-4 sm:gap-x-8">
        {ITEMS.map((text, i) => (
          <li key={i} className="flex gap-3 text-gray-400 items-start">
            <span className="text-green-500 font-mono shrink-0 mt-0.5">→</span>
            <span className="leading-relaxed min-w-0">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
