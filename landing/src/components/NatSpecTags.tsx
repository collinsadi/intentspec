export function NatSpecTags() {
  return (
    <section className="py-16 border-t border-border">
      <h2 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">NatSpec tags</h2>
      <p className="text-gray-400 text-sm mb-6 max-w-2xl">Put tags in block comments (<span className="font-mono text-gray-300">/** ... */</span>) directly above the contract or function. Only functions with <span className="font-mono text-green-500">@custom:agent-intent</span> are included in the spec.</p>
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <span className="font-mono text-xs text-gray-500">Contract-level</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300 font-mono border-collapse">
            <thead><tr className="text-gray-500 border-b border-border"><th className="pb-2 pr-4 w-0 whitespace-nowrap">Tag</th><th className="pb-2">Purpose</th></tr></thead>
            <tbody className="[&_tr]:border-b [&_tr]:border-border">
              <tr><td className="py-2.5 pr-4 align-baseline text-green-500 whitespace-nowrap">@custom:agent-version</td><td className="py-2.5 align-baseline">Contract version</td></tr>
              <tr><td className="py-2.5 pr-4 align-baseline text-green-500 whitespace-nowrap">@custom:agent-description</td><td className="py-2.5 align-baseline">Short description</td></tr>
              <tr><td className="py-2.5 pr-4 align-baseline text-green-500 whitespace-nowrap">@custom:agent-invariant</td><td className="py-2.5 align-baseline">Invariant (repeatable)</td></tr>
              <tr><td className="py-2.5 pr-4 align-baseline text-green-500 whitespace-nowrap">@custom:agent-event</td><td className="py-2.5 align-baseline">Event name + description</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-border bg-surface overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <span className="font-mono text-xs text-gray-500">Function-level</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300 font-mono border-collapse">
            <thead><tr className="text-gray-500 border-b border-border"><th className="pb-2 pr-4 w-0 whitespace-nowrap">Tag</th><th className="pb-2">Purpose</th></tr></thead>
            <tbody className="[&_tr]:border-b [&_tr]:border-border">
              <tr><td className="py-2.5 pr-4 align-baseline text-green-500 whitespace-nowrap">@custom:agent-intent</td><td className="py-2.5 align-baseline"><strong className="text-white">Required.</strong> One-line intent</td></tr>
              <tr><td className="py-2.5 pr-4 align-baseline text-green-500 whitespace-nowrap">@custom:agent-precondition</td><td className="py-2.5 align-baseline">Precondition (repeatable)</td></tr>
              <tr><td className="py-2.5 pr-4 align-baseline text-green-500 whitespace-nowrap">@custom:agent-effect</td><td className="py-2.5 align-baseline">Effect (repeatable)</td></tr>
              <tr><td className="py-2.5 pr-4 align-baseline text-green-500 whitespace-nowrap">@custom:agent-risk</td><td className="py-2.5 align-baseline">Risk (repeatable)</td></tr>
              <tr><td className="py-2.5 pr-4 align-baseline text-green-500 whitespace-nowrap">@custom:agent-guidance</td><td className="py-2.5 align-baseline">Guidance for agents</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
