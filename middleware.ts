import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("vartel_session")?.value

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login-vartel", request.url))
    }

    // Verify token structure (timestamp.hash)
    try {
      const [timestamp] = sessionCookie.split(".")
      if (!timestamp) {
        return NextResponse.redirect(new URL("/login-vartel", request.url))
      }
      const age = Date.now() - parseInt(timestamp)
      const maxAge = 60 * 60 * 24 * 7 * 1000 // 7 days
      if (age > maxAge) {
        const response = NextResponse.redirect(
          new URL("/login-vartel", request.url)
        )
        response.cookies.delete("vartel_session")
        return response
      }
    } catch {
      return NextResponse.redirect(new URL("/login-vartel", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
