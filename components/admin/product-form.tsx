"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Upload,
  X,
  Plus,
  Loader2,
  ArrowLeft,
  ImageIcon,
} from "lucide-react"

interface ProductFormProps {
  product?: Product
  mode: "create" | "edit"
}

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(product?.name ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [origin, setOrigin] = useState(product?.origin ?? "")
  const [category, setCategory] = useState(product?.category ?? "lacteos")
  const [presentations, setPresentations] = useState<string[]>(
    product?.presentations ?? [""]
  )
  const [imageUrl, setImageUrl] = useState(product?.image ?? "")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        setImageUrl(data.url)
      } else {
        setError("Error al subir la imagen")
      }
    } catch {
      setError("Error al subir la imagen")
    } finally {
      setUploading(false)
    }
  }

  function addPresentation() {
    setPresentations([...presentations, ""])
  }

  function removePresentation(index: number) {
    setPresentations(presentations.filter((_, i) => i !== index))
  }

  function updatePresentation(index: number, value: string) {
    setPresentations(presentations.map((p, i) => (i === index ? value : p)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const validPresentations = presentations.filter((p) => p.trim())
    if (!name || !origin || validPresentations.length === 0) {
      setError("Nombre, origen y al menos una presentacion son requeridos")
      return
    }

    setSaving(true)
    try {
      const body = {
        name,
        description,
        origin,
        category,
        presentations: validPresentations,
        image: imageUrl || "/images/placeholder-product.jpg",
      }

      const url =
        mode === "create"
          ? "/api/products"
          : `/api/products/${product!.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        router.push("/admin")
      } else {
        const data = await res.json()
        setError(data.error || "Error al guardar")
      }
    } catch {
      setError("Error de conexion")
    } finally {
      setSaving(false)
    }
  }

  const categories = [
    { value: "lacteos", label: "Lacteos" },
    { value: "carnicos", label: "Carnicos" },
    { value: "otros", label: "Otros" },
  ]

  return (
    <div>
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center gap-2 text-sm text-[#8a7a6a] hover:text-[#f5e6d0] transition-colors mb-6 font-sans"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a productos
      </button>

      <h1 className="text-xl font-bold text-[#f5e6d0] mb-6 font-serif">
        {mode === "create" ? "Nuevo Producto" : `Editar: ${product?.name}`}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left: Form fields */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-[#1a0e08] border border-[#2a1a10] rounded-xl p-5 flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#8a7a6a] mb-1.5 block font-sans">
                Nombre del producto *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Queso Doble Crema"
                className="bg-[#0f0805] border-[#2a1a10] text-[#f5e6d0] placeholder:text-[#4a3a2a] font-sans"
                required
              />
            </div>

            <div>
              <label className="text-xs text-[#8a7a6a] mb-1.5 block font-sans">
                Descripcion
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripcion breve del producto..."
                rows={3}
                className="w-full rounded-md bg-[#0f0805] border border-[#2a1a10] text-[#f5e6d0] placeholder:text-[#4a3a2a] px-3 py-2 text-sm font-sans resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8a7a6a] mb-1.5 block font-sans">
                  Origen *
                </label>
                <Input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Ej: Caqueta"
                  className="bg-[#0f0805] border-[#2a1a10] text-[#f5e6d0] placeholder:text-[#4a3a2a] font-sans"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#8a7a6a] mb-1.5 block font-sans">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md bg-[#0f0805] border border-[#2a1a10] text-[#f5e6d0] px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary h-9"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Presentations */}
            <div>
              <label className="text-xs text-[#8a7a6a] mb-1.5 block font-sans">
                Presentaciones *
              </label>
              <div className="flex flex-col gap-2">
                {presentations.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={p}
                      onChange={(e) => updatePresentation(i, e.target.value)}
                      placeholder="Ej: Entero 2500g"
                      className="bg-[#0f0805] border-[#2a1a10] text-[#f5e6d0] placeholder:text-[#4a3a2a] font-sans"
                    />
                    {presentations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePresentation(i)}
                        className="h-9 w-9 text-[#6a5a4a] hover:text-red-400 hover:bg-red-400/10 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addPresentation}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10 justify-start gap-2 text-xs font-sans"
                >
                  <Plus className="w-3 h-3" />
                  Agregar presentacion
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-4 py-2.5 font-sans">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "create" ? (
              "Crear Producto"
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>

        {/* Right: Image */}
        <div className="lg:col-span-1">
          <div className="bg-[#1a0e08] border border-[#2a1a10] rounded-xl p-5">
            <label className="text-xs text-[#8a7a6a] mb-3 block font-sans">
              Imagen del producto
            </label>

            {imageUrl ? (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#0f0805] mb-3">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="300px"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-[#2a1a10] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors mb-3"
              >
                <ImageIcon className="w-8 h-8 text-[#3a2a1a]" />
                <p className="text-xs text-[#6a5a4a] font-sans">
                  Haz clic para subir
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full gap-2 text-xs border-[#2a1a10] text-[#8a7a6a] hover:text-[#f5e6d0] hover:bg-[#2a1a10] font-sans"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? "Subiendo..." : imageUrl ? "Cambiar imagen" : "Subir imagen"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
