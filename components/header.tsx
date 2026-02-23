"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Inicio", id: "inicio" },
  { label: "Proceso", id: "proceso" },
  { label: "Productos", id: "productos" },
  { label: "Nosotros", id: "nosotros" },
  { label: "Contacto", id: "contacto" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/98 backdrop-blur-sm border-b border-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-vartel.png"
              alt="Lacteos Vartel"
              width={140}
              height={56}
              className="h-12 md:h-14 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="text-white/80 hover:text-white cursor-pointer transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+573124422750" className="flex items-center gap-2 text-accent text-sm">
              <Phone className="w-4 h-4" />
              <span>312 442 2750</span>
            </a>
            <Button
              onClick={() => scrollToSection("productos")}
              className="bg-primary cursor-pointer hover:bg-primary/90 text-primary-foreground"
            >
              Ver Productos
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-t border-accent/20">
          <nav className="flex flex-col p-4 gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="text-left text-white hover:text-accent transition-colors font-medium py-2"
              >
                {item.label}
              </button>
            ))}
            <a href="tel:+573124422750" className="flex items-center gap-2 text-accent py-2">
              <Phone className="w-4 h-4" />
              <span>312 442 2750</span>
            </a>
            <Button
              onClick={() => scrollToSection("productos")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
            >
              Ver Productos
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
