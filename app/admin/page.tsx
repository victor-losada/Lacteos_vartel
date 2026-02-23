"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Package,
  Eye,
  EyeOff,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"

const PAGE_SIZE = 4

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch {
      /* empty */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  async function toggleStatus(product: Product) {
    setToggling(product.id)
    try {
      const newStatus = product.status === "activo" ? "inactivo" : "activo"
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, status: newStatus } : p
          )
        )
      }
    } catch {
      /* empty */
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Estas seguro de eliminar este producto?")) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
      }
    } catch {
      /* empty */
    } finally {
      setDeleting(null)
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  const activeCount = products.filter((p) => p.status === "activo").length
  const inactiveCount = products.filter((p) => p.status === "inactivo").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#f5e6d0] font-serif">
            Productos
          </h1>
          <p className="text-sm text-[#8a7a6a] font-sans">
            {products.length} productos | {activeCount} activos |{" "}
            {inactiveCount} agotados
          </p>
        </div>
        <Link href="/admin/nuevo">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans gap-2">
            <Plus className="w-4 h-4" />
            Agregar producto
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a5a4a]" />
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#1a0e08] border-[#2a1a10] text-[#f5e6d0] placeholder:text-[#5a4a3a] font-sans"
        />
      </div>

      {/* Products table */}
      <div className="bg-[#1a0e08] border border-[#2a1a10] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-[#3a2a1a] mx-auto mb-3" />
            <p className="text-[#6a5a4a] text-sm font-sans">
              {search ? "Sin resultados" : "No hay productos aun"}
            </p>
          </div>
        ) : (
          <>
          <div className="divide-y divide-[#2a1a10]">
            {paginated.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 hover:bg-[#2a1a10]/50 transition-colors"
              >
                {/* Image */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#2a1a10] shrink-0 relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#f5e6d0] truncate font-sans">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#8a7a6a] font-sans">
                    {product.origin} | {product.presentations.join(", ")}
                  </p>
                </div>

                {/* Status badge */}
                <button
                  onClick={() => toggleStatus(product)}
                  disabled={toggling === product.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-colors shrink-0 ${
                    product.status === "activo"
                      ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                      : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                  }`}
                >
                  {toggling === product.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : product.status === "activo" ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                  {product.status === "activo" ? "Activo" : "Agotado"}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/admin/editar/${product.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#8a7a6a] hover:text-[#f5e6d0] hover:bg-[#2a1a10]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleting === product.id}
                    className="h-8 w-8 text-[#8a7a6a] hover:text-red-400 hover:bg-red-400/10"
                  >
                    {deleting === product.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-[#2a1a10] bg-[#0f0805]">
              <p className="text-xs text-[#8a7a6a] font-sans">
                Mostrando {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="h-8 w-8 p-0 text-[#8a7a6a] hover:text-[#f5e6d0] hover:bg-[#2a1a10] disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-[#8a7a6a] font-sans min-w-[4rem] text-center">
                  Pág. {safePage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="h-8 w-8 p-0 text-[#8a7a6a] hover:text-[#f5e6d0] hover:bg-[#2a1a10] disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  )
}
