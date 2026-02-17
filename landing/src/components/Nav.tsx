export function Nav() {
  return (
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
  )
}
