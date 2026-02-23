import { put, list } from "@vercel/blob"
import type { Product } from "./types"

const PRODUCTS_FILE = "products.json"
const PRODUCTS_IMAGES_PREFIX = "products/"

async function getProductsBlobUrl(): Promise<string | null> {
  const { blobs } = await list({ prefix: PRODUCTS_FILE })
  const match = blobs.find((b) => b.pathname === PRODUCTS_FILE)
  return match?.url ?? null
}

/** Mapa pathname -> URL pública para imágenes en products/ */
async function getProductImagesMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  try {
    const { blobs } = await list({ prefix: PRODUCTS_IMAGES_PREFIX })
    for (const b of blobs) {
      map.set(b.pathname, b.url)
    }
  } catch {
    // Si no hay blob store o falla, devolvemos mapa vacío
  }
  return map
}

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i

/** Resuelve product.image: si es ruta relativa (products/xxx) la convierte a URL de Blob */
function resolveImageUrl(image: string, imagesMap: Map<string, string>): string {
  if (!image) return image
  if (image.startsWith("http://") || image.startsWith("https://")) return image
  const path = image.startsWith(PRODUCTS_IMAGES_PREFIX) ? image : `${PRODUCTS_IMAGES_PREFIX}${image}`
  return imagesMap.get(path) ?? image
}

/** Crea productos a partir de los blobs en products/ (cuando products.json está vacío) */
async function getProductsFromBlobImages(): Promise<Product[]> {
  const now = new Date().toISOString()
  const { blobs } = await list({ prefix: PRODUCTS_IMAGES_PREFIX })
  const imageBlobs = blobs.filter((b) => IMAGE_EXTENSIONS.test(b.pathname))
  return imageBlobs.map((b, index) => {
    const filename = b.pathname.replace(PRODUCTS_IMAGES_PREFIX, "").replace(/\.[^.]+$/, "")
    const name = filename.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || `Producto ${index + 1}`
    return {
      id: `blob-${b.pathname}`,
      name,
      description: "",
      origin: "",
      presentations: ["Unidad"],
      weight: "",
      image: b.url,
      category: "otros" as const,
      status: "activo" as const,
      createdAt: now,
      updatedAt: now,
    } satisfies Product
  })
}

export async function getProducts(): Promise<Product[]> {
  try {
    const url = await getProductsBlobUrl()
    if (url) {
      const cacheBust = `${url.includes("?") ? "&" : "?"}_=${Date.now()}`
      const res = await fetch(url + cacheBust, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })
      if (res.ok) {
        const products: Product[] = await res.json()
        if (products.length > 0) {
          const imagesMap = await getProductImagesMap()
          return products.map((p) => ({
            ...p,
            image: resolveImageUrl(p.image, imagesMap),
          }))
        }
      }
    }
    // products.json vacío o inexistente: mostrar imágenes de products/ como catálogo
    return getProductsFromBlobImages()
  } catch {
    // Sin BLOB_READ_WRITE_TOKEN en local (o error de red) no se puede listar Blob
    return []
  }
}

export async function getActiveProducts(): Promise<Product[]> {
  const all = await getProducts()
  return all.filter((p) => p.status === "activo")
}

export async function saveProducts(products: Product[]): Promise<void> {
  await put(PRODUCTS_FILE, JSON.stringify(products, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  })
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find((p) => p.id === id) ?? null
}

export async function addProduct(
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> {
  const products = await getProducts()
  const now = new Date().toISOString()
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  products.push(newProduct)
  await saveProducts(products)
  return newProduct
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "createdAt">>
): Promise<Product | null> {
  const products = await getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return null
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  await saveProducts(products)
  return products[index]
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts()
  const filtered = products.filter((p) => p.id !== id)
  if (filtered.length === products.length) return false
  await saveProducts(filtered)
  return true
}
