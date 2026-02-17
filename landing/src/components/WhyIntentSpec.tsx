export function WhyIntentSpec() {
  return (
    <section className="py-16 border-t border-border">
      <h2 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">Why Intent Spec</h2>
      <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
        <div className="min-w-0">
          <h3 className="text-gray-500 font-mono text-sm mb-3">The problem</h3>
          <p className="text-gray-300 leading-relaxed">
            Agents infer behavior from function names and ABIs alone. Is <code className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-sm">execute()</code> a harmless update or a high-risk transfer? Preconditions and irreversibility stay invisible.
          </p>
        </div>
        <div className="min-w-0">
          <h3 className="text-green-500 font-mono text-sm mb-3">The solution</h3>
          <p className="text-gray-300 leading-relaxed">
            Declare intent, preconditions, effects, and risks in NatSpec. The CLI emits schema-strict JSON. Publish the spec; implement <code className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-sm">getIntentSpecURI()</code> so agents can discover and validate before signing.
          </p>
        </div>
      </div>
    </section>
  )
}
