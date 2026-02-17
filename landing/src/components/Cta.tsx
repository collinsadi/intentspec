export function Cta() {
  return (
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
  )
}
