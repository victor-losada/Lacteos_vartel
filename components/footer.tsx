import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const WHATSAPP_NUMBER = "573124422750"

export function Footer() {
  return (
    <footer id="contacto" className="bg-[#0d0d0d] text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-balance">
            Listo para hacer tu pedido?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Contactanos por WhatsApp y recibe una cotizacion personalizada. 
            Atendemos pedidos mayoristas y minoristas en Bogota.
          </p>
          <Button
            size="lg"
            className="bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2 text-lg px-8"
            asChild
          >
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me gustaria hacer un pedido de productos.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5" />
              Contactar por WhatsApp
            </a>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo-vartel.png"
                alt="Lacteos Vartel"
                width={160}
                height={64}
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-white/70 max-w-sm leading-relaxed mb-4">
              Comercializadora de Lacteos Vartel S.A.S. Distribuidores de quesos 
              frescos colombianos y productos alimenticios de calidad en Bogota.
            </p>
            <p className="text-accent italic text-sm">
              &quot;Calidad significa hacer las cosas bien incluso cuando nadie esta mirando&quot;
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                <span>Calle 77 #69p-74<br />Barrio Las Ferias<br />Bogota, Colombia</span>
              </li>
              <li>
                <a 
                  href="tel:+573124422750" 
                  className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors"
                >
                  <Phone className="w-5 h-5 shrink-0 text-primary" />
                  <span>312 442 2750</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+573125656757" 
                  className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors"
                >
                  <Phone className="w-5 h-5 shrink-0 text-primary" />
                  <span>312 56 56 757</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Horarios</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70">
                <Clock className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                <div>
                  <p>Lunes a Viernes</p>
                  <p className="text-white">6:00 AM - 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <Clock className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                <div>
                  <p>Sabados</p>
                  <p className="text-white">6:00 AM - 2:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            {new Date().getFullYear()} Comercializadora de Lacteos Vartel S.A.S. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-white/50 hover:text-white transition-colors">
              Politica de Privacidad
            </Link>
            <Link href="#" className="text-white/50 hover:text-white transition-colors">
              Terminos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
