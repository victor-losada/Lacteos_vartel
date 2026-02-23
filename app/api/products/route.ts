import { isAuthenticated } from "@/lib/auth"
import { getProducts, addProduct } from "@/lib/products-blob"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products)
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
    const { name, description, origin, presentations, image, category } = body

    if (!name || !origin || !presentations?.length) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: nombre, origen, presentaciones" },
        { status: 400 }
      )
    }

    const product = await addProduct({
      name,
      description: description || "",
      origin,
      presentations,
      image: image || "/images/placeholder-product.jpg",
      category: category || "lacteos",
      status: "activo",
    })

    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
