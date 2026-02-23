"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const REEL_CLIPS = [
  {
    video: "https://i42d9qctgnyy3wqn.public.blob.vercel-storage.com/Videos/Dji%200226.mp4",
    caption: "Caqueta - Tierra de tradicion lechera",
  },
  {
    video: "https://i42d9qctgnyy3wqn.public.blob.vercel-storage.com/Videos/Dji%200185.mp4",
    caption: "Guaviare - Paisajes del campo colombiano",
  },
  {
    video: "https://i42d9qctgnyy3wqn.public.blob.vercel-storage.com/Videos/Dji%200203.mp4",
    caption: "Meta - Desde las mejores fincas ganaderas",
  },
]

export function VideoReel() {
  const [current, setCurrent] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Mount when within 800px of viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !mounted) setMounted(true)
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin: "800px 0px" }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [mounted])

  const loadAndPlay = useCallback(
    (index: number) => {
      const vid = videoRef.current
      if (!vid) return
      setReady(false)
      vid.src = REEL_CLIPS[index].video
      vid.load()
      const onReady = () => {
        setReady(true)
        if (isVisible) vid.play().catch(() => {})
      }
      vid.addEventListener("canplaythrough", onReady, { once: true })
    },
    [isVisible]
  )

  // First load
  useEffect(() => {
    if (!mounted) return
    loadAndPlay(0)
  }, [mounted, loadAndPlay])

  // Pause/play on visibility
  useEffect(() => {
    const vid = videoRef.current
    if (!vid || !ready) return
    if (isVisible) vid.play().catch(() => {})
    else vid.pause()
  }, [isVisible, ready])

  // Auto-advance on end
  const handleEnded = useCallback(() => {
    const next = (current + 1) % REEL_CLIPS.length
    setCurrent(next)
    loadAndPlay(next)
  }, [current, loadAndPlay])

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0a0a0a] overflow-hidden py-16 md:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[#c9a96e] font-medium tracking-[0.2em] uppercase text-xs mb-3">
            Nuestro Campo
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white text-balance">
            Directamente desde las regiones ganaderas
          </h2>
        </div>

        {/* Cinematic widescreen video */}
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-[#111]">
          {mounted && (
            <video
              ref={videoRef}
              muted
              playsInline
              preload="none"
              onEnded={handleEnded}
              className={`w-full h-full object-cover transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
            />
          )}

          {mounted && !ready && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Caption overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 md:p-8 pointer-events-none">
            <p className="text-white font-serif text-base md:text-lg">
              {REEL_CLIPS[current].caption}
            </p>
          </div>
        </div>

        {/* Progress dots - non-interactive */}
        <div className="flex justify-center gap-2 mt-6" aria-hidden="true">
          {REEL_CLIPS.map((clip, i) => (
            <div key={clip.caption} className="relative h-1 w-16 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  i === current
                    ? "bg-[#c9a96e] animate-[progress_15s_linear]"
                    : i < current
                      ? "bg-[#c9a96e] w-full"
                      : "w-0"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
