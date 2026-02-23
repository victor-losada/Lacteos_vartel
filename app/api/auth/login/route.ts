import { setSessionCookie } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Contrasena incorrecta" },
        { status: 401 }
      )
    }

    await setSessionCookie()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    )
  }
}
