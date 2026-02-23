"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/types"
import ProductForm from "@/components/admin/product-form"
import { Loader2 } from "lucide-react"

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (res.ok) {
          setProduct(await res.json())
        } else {
          router.push("/admin")
        }
      } catch {
        router.push("/admin")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) return null

  return <ProductForm product={product} mode="edit" />
}
