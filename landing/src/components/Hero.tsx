export function Hero() {
  return (
    <section className="pt-20 pb-16 md:pt-28 md:pb-24">
      <p className="font-mono text-sm text-green-500 mb-4">Agent-readable metadata for smart contracts</p>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6 leading-[1.15]">
        Bridge the semantic gap between onchain logic and autonomous reasoning.
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
          href="#demo"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#252525] hover:border-gray-600 text-gray-300 hover:text-white font-medium text-sm transition-colors"
        >
          Try demo
        </a>
        <a
          href="https://www.youtube.com/watch?v=6IwccYEbqZc"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#252525] hover:border-gray-600 text-gray-300 hover:text-white font-medium text-sm transition-colors"
        >
          Watch video
        </a>
      </div>
    </section>
  )
}
