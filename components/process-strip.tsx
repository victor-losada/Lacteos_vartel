"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"

type MediaItem =
  | { type: "image"; src: string }
  | { type: "video"; src: string }

interface ProcessStep {
  label: string
  desc: string
  media: MediaItem[]
  duration: number // seconds to show step (for image-only or mixed)
}

const STEPS: ProcessStep[] = [
  {
    label: "Moldeado artesanal",
    desc: "Proceso manual de moldeado siguiendo la tradicion quesera colombiana.",
    media: [{ type: "image", src: "/images/mg-7234.jpg" }],
    duration: 6,
  },
  {
    label: "Control de calidad",
    desc: "Verificacion rigurosa para garantizar un producto fresco y seguro.",
    media: [
      { type: "image", src: "/images/mg-7263.jpg" },
      {
        type: "video",
        src: "https://i42d9qctgnyy3wqn.public.blob.vercel-storage.com/Videos/Mvi%207009.mp4",
      },
    ],
    duration: 5, // for the image portion before the video plays
  },
  {
    label: "Producto terminado",
    desc: "Listo para distribucion con cadena de frio hasta tu puerta.",
    media: [
      {
        type: "video",
        src: "https://i42d9qctgnyy3wqn.public.blob.vercel-storage.com/Videos/Mvi%206945.mp4",
      },
    ],
    duration: 0, // video controls its own duration
  },
]

export function ProcessStrip() {
  const [activeStep, setActiveStep] = useState(0)
  const [activeMedia, setActiveMedia] = useState(0) // index within step's media array
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [showImage, setShowImage] = useState(true)

  // Observe visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting && !mounted) setMounted(true)
      },
      { rootMargin: "400px 0px" },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [mounted])

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  // Start playing current step's media
  const playCurrentMedia = useCallback(() => {
    clearTimer()
    const step = STEPS[activeStep]
    const media = step.media[activeMedia]

    if (media.type === "image") {
      setShowImage(true)
      setVideoReady(false)
      // If there's a next media in this step, advance after duration
      if (activeMedia < step.media.length - 1) {
        timerRef.current = setTimeout(() => {
          setActiveMedia((prev) => prev + 1)
        }, step.duration * 1000)
      } else {
        // Last media in step, advance to next step after duration
        timerRef.current = setTimeout(() => {
          advanceStep()
        }, step.duration * 1000)
      }
    } else {
      setShowImage(false)
      const vid = videoRef.current
      if (!vid) return
      setVideoReady(false)
      vid.src = media.src
      vid.load()
      const onReady = () => {
        setVideoReady(true)
        if (isVisible) vid.play().catch(() => {})
      }
      vid.addEventListener("canplaythrough", onReady, { once: true })
    }
  }, [activeStep, activeMedia, isVisible])

  const advanceStep = useCallback(() => {
    setActiveMedia(0)
    setActiveStep((prev) => (prev + 1) % STEPS.length)
  }, [])

  // When step or media index changes, start playback
  useEffect(() => {
    if (!mounted || !isVisible) return
    playCurrentMedia()
    return () => clearTimer()
  }, [activeStep, activeMedia, mounted, isVisible, playCurrentMedia])

  // Pause/resume video on visibility
  useEffect(() => {
    const vid = videoRef.current
    if (!vid || !videoReady) return
    if (isVisible) vid.play().catch(() => {})
    else vid.pause()
  }, [isVisible, videoReady])

  // When video ends, go to next media or next step
  const handleEnded = useCallback(() => {
    const step = STEPS[activeStep]
    if (activeMedia < step.media.length - 1) {
      setActiveMedia((prev) => prev + 1)
    } else {
      advanceStep()
    }
  }, [activeStep, activeMedia, advanceStep])

  const goToStep = (i: number) => {
    if (i === activeStep) return
    clearTimer()
    setActiveMedia(0)
    setActiveStep(i)
  }

  const currentMedia = STEPS[activeStep].media[activeMedia]
  const isCurrentImage = currentMedia.type === "image"

  return (
    <section
      ref={sectionRef}
      id="proceso"
      className="relative bg-[#0a0a0a] py-16 md:py-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-[#c9a96e] font-medium tracking-[0.2em] uppercase text-xs mb-3">
              Nuestro Proceso
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white text-balance">
              Elaboracion artesanal, calidad garantizada
            </h2>
          </div>
          <p className="text-white/50 max-w-sm text-sm leading-relaxed md:text-right">
            Cada producto pasa por estrictos controles en plantas certificadas,
            garantizando frescura y seguridad alimentaria.
          </p>
        </div>

        {/* Media display */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#111] mb-6">
          {/* Image layer */}
          {mounted && isCurrentImage && (
            <Image
              src={currentMedia.src}
              alt={STEPS[activeStep].label}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className={`object-cover transition-opacity duration-700 ${showImage ? "opacity-100" : "opacity-0"}`}
            />
          )}

          {/* Video layer */}
          {mounted && (
            <video
              ref={videoRef}
              muted
              playsInline
              preload="none"
              onEnded={handleEnded}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                !isCurrentImage && videoReady ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Loading spinner for video */}
          {mounted && !isCurrentImage && !videoReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Label overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
            <p className="text-white font-serif text-lg md:text-xl font-medium">
              {STEPS[activeStep].label}
            </p>
            <p className="text-white/60 text-sm mt-1">
              {STEPS[activeStep].desc}
            </p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2">
          {STEPS.map((step, i) => (
            <button
              key={step.label}
              type="button"
              onClick={() => goToStep(i)}
              className="flex-1 group cursor-pointer"
              aria-label={`Ver ${step.label}`}
            >
              <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    i === activeStep
                      ? "bg-[#c9a96e] animate-[progress_12s_linear]"
                      : i < activeStep
                        ? "bg-[#c9a96e] w-full"
                        : "w-0"
                  }`}
                />
              </div>
              <p
                className={`text-xs font-medium transition-colors ${
                  i === activeStep
                    ? "text-[#c9a96e]"
                    : "text-white/30 group-hover:text-white/60"
                }`}
              >
                {step.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
