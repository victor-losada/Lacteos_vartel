import { sql } from "@vercel/postgres"
import type { Product } from "./types"

let tableInitialized = false

async function ensureTable() {
  if (tableInitialized) return
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      origin TEXT NOT NULL DEFAULT '',
      presentations JSONB NOT NULL DEFAULT '[]',
      weight TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'quesos' CHECK (category IN ('quesos', 'carnicos', 'otros')),
      status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  tableInitialized = true
}

function rowToProduct(row: Record<string, unknown>): Product {
  const toDate = (v: unknown) => (v instanceof Date ? v : v ? new Date(String(v)) : new Date(0))
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    origin: String(row.origin ?? ""),
    presentations: Array.isArray(row.presentations) ? row.presentations.map(String) : [],
    weight: String(row.weight ?? ""),
    image: String(row.image ?? ""),
    category: (row.category as Product["category"]) || "quesos",
    status: (row.status as Product["status"]) || "activo",
    createdAt: toDate(row.createdAt ?? row["createdAt"]).toISOString(),
    updatedAt: toDate(row.updatedAt ?? row["updatedAt"]).toISOString(),
  }
}

export async function getProducts(): Promise<Product[]> {
  await ensureTable()
  const { rows } = await sql`
    SELECT id, name, description, origin, presentations, weight, image, category, status, "createdAt", "updatedAt"
    FROM products
    ORDER BY "createdAt" DESC
  `
  return rows.map(rowToProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
  await ensureTable()
  const { rows } = await sql`
    SELECT id, name, description, origin, presentations, weight, image, category, status, "createdAt", "updatedAt"
    FROM products
    WHERE id = ${id}
  `
  if (rows.length === 0) return null
  return rowToProduct(rows[0])
}

export async function addProduct(
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> {
  await ensureTable()
  const id = crypto.randomUUID()
  const now = new Date()
  await sql`
    INSERT INTO products (id, name, description, origin, presentations, weight, image, category, status, "createdAt", "updatedAt")
    VALUES (
      ${id},
      ${product.name},
      ${product.description},
      ${product.origin},
      ${JSON.stringify(product.presentations)}::jsonb,
      ${product.weight},
      ${product.image},
      ${product.category},
      ${product.status},
      ${now},
      ${now}
    )
  `
  return {
    ...product,
    id,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "createdAt">>
): Promise<Product | null> {
  await ensureTable()
  const existing = await getProductById(id)
  if (!existing) return null

  const merged = {
    name: updates.name ?? existing.name,
    description: updates.description ?? existing.description,
    origin: updates.origin ?? existing.origin,
    presentations: updates.presentations ?? existing.presentations,
    weight: updates.weight ?? existing.weight,
    image: updates.image ?? existing.image,
    category: updates.category ?? existing.category,
    status: updates.status ?? existing.status,
  }
  const now = new Date()

  await sql`
    UPDATE products
    SET
      name = ${merged.name},
      description = ${merged.description},
      origin = ${merged.origin},
      presentations = ${JSON.stringify(merged.presentations)}::jsonb,
      weight = ${merged.weight},
      image = ${merged.image},
      category = ${merged.category},
      status = ${merged.status},
      "updatedAt" = ${now}
    WHERE id = ${id}
  `
  return {
    ...existing,
    ...merged,
    updatedAt: now.toISOString(),
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  await ensureTable()
  const { rowCount } = await sql`
    DELETE FROM products WHERE id = ${id}
  `
  return (rowCount ?? 0) > 0
}

/** Inserta productos con sus IDs (para migración desde Blob). No sobrescribe si ya existe. */
export async function migrateProducts(products: Product[]): Promise<{ inserted: number }> {
  await ensureTable()
  let inserted = 0
  for (const p of products) {
    try {
      const { rowCount } = await sql`
        INSERT INTO products (id, name, description, origin, presentations, weight, image, category, status, "createdAt", "updatedAt")
        VALUES (
          ${p.id},
          ${p.name},
          ${p.description},
          ${p.origin},
          ${JSON.stringify(p.presentations)}::jsonb,
          ${p.weight},
          ${p.image},
          ${p.category},
          ${p.status},
          ${p.createdAt}::timestamptz,
          ${p.updatedAt}::timestamptz
        )
        ON CONFLICT (id) DO NOTHING
      `
      if ((rowCount ?? 0) > 0) inserted += 1
    } catch {
      /* skip error */
    }
  }
  return { inserted }
}
