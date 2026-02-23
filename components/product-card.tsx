"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { MessageCircle, MapPin, Package } from "lucide-react"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  whatsappNumber: string
}

export function ProductCard({ product, whatsappNumber }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPresentation, setSelectedPresentation] = useState(
    product.presentations[0]
  )
  const [quantity, setQuantity] = useState("1")
  const [customQuantity, setCustomQuantity] = useState("")
  const [quantityType, setQuantityType] = useState<"preset" | "custom">(
    "preset"
  )

  const quantityOptions = ["1", "2", "5", "10", "otro"]

  const handleWhatsAppRedirect = () => {
    const finalQuantity =
      quantityType === "custom" || quantity === "otro"
        ? customQuantity
        : quantity
    const message = encodeURIComponent(
      `Hola, estoy interesado en cotizar:\n\n*Producto:* ${product.name}\n*Presentacion:* ${selectedPresentation}\n*Cantidad:* ${finalQuantity} unidades\n\nPor favor, necesito informacion sobre precio y disponibilidad.`
    )
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")
    setIsDialogOpen(false)
  }

  return (
    <>
      <Card className="group overflow-hidden bg-card border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${product.status === "activo" ? "group-hover:scale-105" : "opacity-80"}`}
          />
          {product.status === "inactivo" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-muted-foreground/90 text-muted text-sm font-semibold px-4 py-2 rounded-full font-sans">
                Agotado
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full font-sans">
              {product.weight}
            </span>
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-serif text-xl font-semibold text-card-foreground mb-2">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2 font-sans">
            {product.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-sans">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Origen: {product.origin}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {product.presentations.map((pres) => (
              <span
                key={pres}
                className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded font-sans"
              >
                {pres}
              </span>
            ))}
          </div>
          {product.status === "inactivo" ? (
            <div className="w-full py-3 rounded-md bg-muted text-muted-foreground text-center text-sm font-medium font-sans">
              Producto agotado
            </div>
          ) : (
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-sans"
              onClick={() => setIsDialogOpen(true)}
            >
              <MessageCircle className="w-4 h-4" />
              Cotizar Ahora
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-card-foreground">
              {product.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-sans">
              Selecciona la presentacion y cantidad para cotizar
            </DialogDescription>
          </DialogHeader>

          <div className="relative aspect-video rounded-lg overflow-hidden my-2 bg-[#1a1a1a]">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground font-sans">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Origen: {product.origin}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground font-sans">
              <Package className="w-4 h-4 text-primary" />
              <span>Peso: {product.weight}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {product.presentations.length > 1 && (
              <div>
                <Label className="text-card-foreground font-medium mb-3 block font-sans">
                  Presentacion:
                </Label>
                <RadioGroup
                  value={selectedPresentation}
                  onValueChange={setSelectedPresentation}
                  className="flex flex-wrap gap-3"
                >
                  {product.presentations.map((pres) => (
                    <div key={pres}>
                      <RadioGroupItem
                        value={pres}
                        id={`${product.id}-pres-${pres}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`${product.id}-pres-${pres}`}
                        className="flex items-center justify-center rounded-lg border-2 border-border bg-background px-4 py-2 cursor-pointer hover:bg-secondary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all font-sans"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {pres}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div>
              <Label className="text-card-foreground font-medium mb-3 block font-sans">
                Cantidad (unidades):
              </Label>
              <RadioGroup
                value={quantity}
                onValueChange={(val) => {
                  setQuantity(val)
                  setQuantityType(val === "otro" ? "custom" : "preset")
                }}
                className="grid grid-cols-3 sm:grid-cols-5 gap-3"
              >
                {quantityOptions.map((opt) => (
                  <div key={opt}>
                    <RadioGroupItem
                      value={opt}
                      id={`${product.id}-qty-${opt}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`${product.id}-qty-${opt}`}
                      className="flex items-center justify-center rounded-lg border-2 border-border bg-background p-3 cursor-pointer hover:bg-secondary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all font-sans"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {opt === "otro" ? "Otra" : opt}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {quantity === "otro" && (
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="custom-quantity"
                  className="text-card-foreground font-sans"
                >
                  Especifica la cantidad:
                </Label>
                <Input
                  id="custom-quantity"
                  placeholder="Ej: 20 unidades, 50kg, etc."
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  className="bg-background border-border text-foreground font-sans"
                />
              </div>
            )}

            <Button
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2 text-lg py-6 mt-4 font-sans"
              onClick={handleWhatsAppRedirect}
              disabled={quantity === "otro" && !customQuantity}
            >
              <MessageCircle className="w-5 h-5" />
              Enviar Cotizacion por WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
