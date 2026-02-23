import { isAuthenticated } from "@/lib/auth"
import { getProductById, updateProduct, deleteProduct } from "@/lib/products-blob"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = await request.json()
    const product = await updateProduct(id, body)
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  try {
    const deleted = await deleteProduct(id)
    if (!deleted) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}
