import { put, list } from "@vercel/blob"
import type { Product } from "./types"

const PRODUCTS_FILE = "products.json"

async function getProductsBlobUrl(): Promise<string | null> {
  const { blobs } = await list({ prefix: PRODUCTS_FILE })
  const match = blobs.find((b) => b.pathname === PRODUCTS_FILE)
  return match?.url ?? null
}

export async function getProducts(): Promise<Product[]> {
  const url = await getProductsBlobUrl()
  if (!url) return []
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
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
