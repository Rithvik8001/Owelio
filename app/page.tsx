import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { HowItWorks } from "@/components/landing/how-it-works"
import { AiSection } from "@/components/landing/ai-section"
import { FinalCta } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <FeaturesGrid />
        <HowItWorks />
        <AiSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
