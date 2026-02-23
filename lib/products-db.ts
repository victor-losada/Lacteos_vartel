import { Pool } from "pg"
import type { Product } from "./types"

function getPool(): Pool {
  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Falta POSTGRES_URL, POSTGRES_PRISMA_URL o DATABASE_URL en variables de entorno")
  }
   return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })
}

let pool: Pool | null = null
function getDb(): Pool {
  if (!pool) pool = getPool()
  return pool
}

let tableInitialized = false

async function ensureTable() {
  if (tableInitialized) return
  const db = getDb()
  await db.query(`
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
  `)
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
  const db = getDb()
  const { rows } = await db.query(
    `SELECT id, name, description, origin, presentations, weight, image, category, status, "createdAt", "updatedAt"
     FROM products
     ORDER BY "createdAt" DESC`
  )
  return rows.map(rowToProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
  await ensureTable()
  const db = getDb()
  const { rows } = await db.query(
    `SELECT id, name, description, origin, presentations, weight, image, category, status, "createdAt", "updatedAt"
     FROM products
     WHERE id = $1`,
    [id]
  )
  if (rows.length === 0) return null
  return rowToProduct(rows[0])
}

export async function addProduct(
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> {
  await ensureTable()
  const id = crypto.randomUUID()
  const now = new Date()
  const db = getDb()
  await db.query(
    `INSERT INTO products (id, name, description, origin, presentations, weight, image, category, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11)`,
    [
      id,
      product.name,
      product.description,
      product.origin,
      JSON.stringify(product.presentations),
      product.weight,
      product.image,
      product.category,
      product.status,
      now,
      now,
    ]
  )
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
  const db = getDb()
  await db.query(
    `UPDATE products
     SET name = $1, description = $2, origin = $3, presentations = $4::jsonb, weight = $5, image = $6, category = $7, status = $8, "updatedAt" = $9
     WHERE id = $10`,
    [
      merged.name,
      merged.description,
      merged.origin,
      JSON.stringify(merged.presentations),
      merged.weight,
      merged.image,
      merged.category,
      merged.status,
      now,
      id,
    ]
  )
  return {
    ...existing,
    ...merged,
    updatedAt: now.toISOString(),
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  await ensureTable()
  const db = getDb()
  const { rowCount } = await db.query("DELETE FROM products WHERE id = $1", [id])
  return (rowCount ?? 0) > 0
}

/** Inserta productos con sus IDs (para migración desde Blob). No sobrescribe si ya existe. */
export async function migrateProducts(products: Product[]): Promise<{ inserted: number }> {
  await ensureTable()
  const db = getDb()
  let inserted = 0
  for (const p of products) {
    try {
      const { rowCount } = await db.query(
        `INSERT INTO products (id, name, description, origin, presentations, weight, image, category, status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10::timestamptz, $11::timestamptz)
         ON CONFLICT (id) DO NOTHING`,
        [
          p.id,
          p.name,
          p.description,
          p.origin,
          JSON.stringify(p.presentations),
          p.weight,
          p.image,
          p.category,
          p.status,
          p.createdAt,
          p.updatedAt,
        ]
      )
      if ((rowCount ?? 0) > 0) inserted += 1
    } catch {
      /* skip error */
    }
  }
  return { inserted }
}
