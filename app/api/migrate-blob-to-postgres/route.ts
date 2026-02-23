import { isAuthenticated } from "@/lib/auth"
import { getProductsFromBlobJsonOnly } from "@/lib/products-blob"
import { migrateProducts } from "@/lib/products-db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/** Una sola vez: copia productos desde products.json (Blob) a Postgres. */
export async function POST() {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const products = await getProductsFromBlobJsonOnly()
    if (products.length === 0) {
      return NextResponse.json({
        message: "No hay productos en Blob para migrar",
        inserted: 0,
      })
    }
    const { inserted } = await migrateProducts(products)
    return NextResponse.json({
      message: `Migración lista. ${inserted} de ${products.length} productos insertados en Postgres.`,
      inserted,
      total: products.length,
    })
  } catch (err) {
    const message =
      process.env.NODE_ENV === "development" && err instanceof Error ? err.message : "Error al migrar"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
