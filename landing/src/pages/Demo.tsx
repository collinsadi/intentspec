import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'

const YOUTUBE_DEMO_URL = 'https://www.youtube.com/watch?v=6IwccYEbqZc'

export function Demo() {
  return (
    <div className="min-h-screen bg-black text-white bg-grid">
      <Nav />
      <main className="max-w-4xl mx-auto px-6 pb-24 pt-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Watch the Demo</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            See Intent Spec in action — from Solidity with NatSpec to agent-readable intent metadata.
          </p>
          <a
            href={YOUTUBE_DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-lg bg-[#ff0000] hover:bg-[#cc0000] text-white font-medium text-sm transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Watch Demo on Youtube
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
