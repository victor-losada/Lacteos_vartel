import { isAuthenticated } from "@/lib/auth"
import { getProducts, addProduct } from "@/lib/products-db"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    })
  } catch {
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, origin, presentations, image, category, weight } = body

    if (!name || !origin || !presentations?.length) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: nombre, origen, presentaciones" },
        { status: 400 }
      )
    }

    const validCategories = ["quesos", "carnicos", "otros"] as const
    const categoryValue = validCategories.includes(category) ? category : "quesos"

    const product = await addProduct({
      name,
      description: description ?? "",
      origin,
      presentations,
      image: image ?? "/images/placeholder-product.jpg",
      category: categoryValue,
      weight: weight ?? "",
      status: "activo",
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    const message =
      process.env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : "Error al crear producto"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
