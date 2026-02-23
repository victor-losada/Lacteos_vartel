"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "./product-card"
import type { Product } from "@/lib/types"
import { Loader2 } from "lucide-react"

const WHATSAPP_NUMBER = "573124422750"

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products")
        if (res.ok) {
          const data: Product[] = await res.json()
          // Only show active products
          setProducts(data.filter((p) => p.status === "activo"))
        }
      } catch {
        /* empty */
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const quesos = products.filter((p) => p.category === "quesos")
  const carnicos = products.filter((p) => p.category === "carnicos")
  const otros = products.filter((p) => p.category === "otros")

  return (
    <section id="productos" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary font-medium tracking-widest uppercase mb-4 text-sm font-sans">
            Nuestro Catalogo
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Productos de calidad para tu negocio
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-sans">
            Selecciona el producto de tu interes y cotiza directamente por
            WhatsApp. Atendemos pedidos mayoristas y minoristas.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {quesos.length > 0 && (
              <div className="mb-16">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                  <span className="w-12 h-1 bg-primary rounded-full" />
                  Quesos Frescos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {quesos.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      whatsappNumber={WHATSAPP_NUMBER}
                    />
                  ))}
                </div>
              </div>
            )}

            {carnicos.length > 0 && (
              <div className="mb-16">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                  <span className="w-12 h-1 bg-primary rounded-full" />
                  Productos Carnicos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {carnicos.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      whatsappNumber={WHATSAPP_NUMBER}
                    />
                  ))}
                </div>
              </div>
            )}

            {otros.length > 0 && (
              <div className="mb-16">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                  <span className="w-12 h-1 bg-primary rounded-full" />
                  Otros Productos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otros.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      whatsappNumber={WHATSAPP_NUMBER}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-16 text-center bg-secondary rounded-2xl p-8 md:p-12">
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
            Buscas otro producto?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto font-sans">
            Manejamos una amplia variedad de productos lacteos y alimenticios.
            Contactanos para conocer nuestro catalogo completo.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me gustaria informacion sobre otros productos que manejan.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors font-sans"
          >
            Contactanos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
