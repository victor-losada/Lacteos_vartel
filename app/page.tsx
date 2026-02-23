import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProcessStrip } from "@/components/process-strip"
import { ProductsSection } from "@/components/products-section"
import { AboutSection } from "@/components/about-section"
import { VideoReel } from "@/components/video-reel"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ProcessStrip />
      <ProductsSection />
      <AboutSection />
      <VideoReel />
      <Footer />
    </main>
  )
}
