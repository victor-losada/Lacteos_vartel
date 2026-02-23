"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle, ChevronDown } from "lucide-react"

const WHATSAPP_NUMBER = "573124422750"

// Only load ONE drone video for the hero - the lightest/shortest
const HERO_VIDEO =
  "https://i42d9qctgnyy3wqn.public.blob.vercel-storage.com/Videos/Dji%200185.mp4"

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Start loading after page is interactive
    const timer = setTimeout(() => {
      video.src = HERO_VIDEO
      video.load()
    }, 100)

    const onCanPlay = () => {
      setVideoLoaded(true)
      video.play().catch(() => {})
    }

    video.addEventListener("canplaythrough", onCanPlay, { once: true })
    return () => {
      clearTimeout(timer)
      video.removeEventListener("canplaythrough", onCanPlay)
    }
  }, [])

  const scrollToProducts = () => {
    document.getElementById("proceso")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="inicio"
      className="relative h-screen flex items-center overflow-hidden bg-[#0a0a0a]"
    >
      
     

      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-30" : "opacity-0"}`}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl mt-15 px-0 mx-9">
          
          <p className="text-[#c9a96e] font-medium tracking-[0.2em] uppercase text-xs sm:text-sm mb-5">
            Comercializadora de Lacteos &amp; Alimentos
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 text-balance">
            Del campo colombiano a tu negocio
          </h1>
          <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-lg">
            Quesos frescos artesanales, productos carnicos ahumados y mas.
            Directamente desde las mejores regiones ganaderas de Colombia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-base px-8 py-6 cursor-pointer"
              onClick={scrollToProducts}
            >
              Explorar Productos
            </Button>
            <Button
              size="lg"
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white text-base px-8 py-6 gap-2"
              asChild
            >
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me interesa conocer sus productos y precios.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5" />
                Escribenos
              </a>
            </Button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToProducts}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer"
        aria-label="Ver mas"
      >
        <span className="text-xs tracking-widest uppercase">Descubre</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  )
}
