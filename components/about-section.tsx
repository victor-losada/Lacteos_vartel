"use client"

import { useEffect, useRef, useState } from "react"
import { Truck, ShieldCheck, Clock, Users } from "lucide-react"

// Drone video replaces the static image
const DRONE_VIDEO =
  "https://i42d9qctgnyy3wqn.public.blob.vercel-storage.com/Videos/Dji%200203.mp4"

const features = [
  {
    icon: ShieldCheck,
    title: "Calidad Garantizada",
    desc: "Productos seleccionados con los mas altos estandares.",
  },
  {
    icon: Truck,
    title: "Entregas en Bogota",
    desc: "Distribucion directa con cadena de frio.",
  },
  {
    icon: Clock,
    title: "Atencion Rapida",
    desc: "Respuesta inmediata por WhatsApp.",
  },
  {
    icon: Users,
    title: "Asesoria Personalizada",
    desc: "Te ayudamos a elegir lo mejor para tu negocio.",
  },
]

const regions = ["Caqueta", "Meta", "Guaviare", "Boyaca"]

export function AboutSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !mounted) {
          setMounted(true)
          observer.disconnect()
        }
      },
      { rootMargin: "600px 0px" }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [mounted])

  // Load video once mounted
  useEffect(() => {
    if (!mounted) return
    const vid = videoRef.current
    if (!vid) return
    vid.src = DRONE_VIDEO
    vid.load()
    const onReady = () => {
      setVideoLoaded(true)
      vid.play().catch(() => {})
    }
    vid.addEventListener("canplaythrough", onReady, { once: true })

    // Pause when not visible
    const visObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) vid.play().catch(() => {})
        else vid.pause()
      },
      { threshold: 0.1 }
    )
    visObs.observe(vid)
    return () => {
      vid.removeEventListener("canplaythrough", onReady)
      visObs.disconnect()
    }
  }, [mounted])

  return (
    <section ref={containerRef} id="nosotros" className="relative text-white overflow-hidden bg-[#111]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: text */}
          <div>
            <p className="text-[#c9a96e] font-medium tracking-[0.2em] uppercase text-xs mb-4">
              Quienes Somos
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 text-balance">
              Comercializadora de Lacteos Vartel S.A.S.
            </h2>
            <div className="space-y-5 text-white/70 leading-relaxed">
              <p>
                Somos una empresa colombiana dedicada a la comercializacion de
                productos lacteos y alimenticios. Trabajamos directamente con
                productores de las mejores regiones ganaderas del pais para
                garantizar frescura, calidad y precios justos.
              </p>
              <p>
                Desde nuestra sede en el Barrio Las Ferias de Bogota,
                distribuimos a restaurantes, tiendas, panaderias y hogares que
                valoran el autentico sabor del campo colombiano.
              </p>
            </div>

            <blockquote className="border-l-2 border-[#c9a96e] pl-6 mt-10 mb-10">
              <p className="text-white/80 italic font-serif text-lg leading-relaxed">
                &quot;Calidad significa hacer las cosas bien incluso cuando nadie
                esta mirando&quot;
              </p>
              <footer className="text-white/40 text-sm mt-3">Henry Ford</footer>
            </blockquote>

            <div>
              <p className="text-white/50 text-xs tracking-widest uppercase mb-4">
                Regiones de origen
              </p>
              <div className="flex flex-wrap gap-3">
                {regions.map((r) => (
                  <span
                    key={r}
                    className="bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/20 px-5 py-2 rounded-full text-sm"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: drone video + features */}
          <div className="space-y-6">
            {/* Drone video replacing the woman/image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#1a1a1a]">
              {mounted && (
                <video
                  ref={videoRef}
                  muted
                  loop
                  playsInline
                  preload="none"
                  className={`w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                />
              )}
              {mounted && !videoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pointer-events-none">
                <p className="text-white/80 text-xs tracking-widest uppercase">
                  Regiones ganaderas de Colombia
                </p>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.08] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#8B1A1A]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#8B1A1A]/30 transition-colors">
                    <f.icon className="w-5 h-5 text-[#8B1A1A]" />
                  </div>
                  <h3 className="font-semibold text-white mb-1 text-sm">
                    {f.title}
                  </h3>
                  <p className="text-white/50 text-xs leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="bg-[#c9a96e]/10 border border-[#c9a96e]/20 rounded-2xl p-6 grid grid-cols-4 gap-4">
              {[
                { val: "4+", label: "Regiones" },
                { val: "8+", label: "Productos" },
                { val: "100%", label: "Frescos" },
                { val: "10+", label: "Anos" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-serif text-2xl md:text-3xl font-bold text-[#c9a96e]">
                    {s.val}
                  </p>
                  <p className="text-white/40 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
