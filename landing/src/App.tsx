import './App.css'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { WhyIntentSpec } from './components/WhyIntentSpec'
import { NatSpecTags } from './components/NatSpecTags'
import { QuickStart } from './components/QuickStart'
import { DemoSection } from './components/DemoSection'
import { UseCases } from './components/UseCases'
import { Cta } from './components/Cta'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-black text-white bg-grid">
      <Nav />
      <main className="max-w-4xl mx-auto px-6 pb-24">
        <Hero />
        <WhyIntentSpec />
        <NatSpecTags />
        <QuickStart />
        <DemoSection />
        <UseCases />
        <Cta />
        <Footer />
      </main>
    </div>
  )
}

export default App
