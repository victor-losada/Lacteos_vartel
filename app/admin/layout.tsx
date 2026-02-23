"use client"

import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Package, Plus, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Productos", href: "/admin", icon: Package },
  { label: "Agregar producto", href: "/admin/nuevo", icon: Plus },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login-vartel")
  }

  return (
    <div className="min-h-screen bg-[#0f0805] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a0e08] border-r border-[#2a1a10] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#2a1a10]">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/images/logo-vartel.png"
              alt="Lacteos Vartel"
              width={100}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="text-[10px] text-[#6a5040] mt-1 font-sans">
            Panel de Administracion
          </p>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-[#a09080] hover:bg-[#2a1a10] hover:text-[#d0c0b0]"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="font-sans">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-[#2a1a10]">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-[#6a5040] hover:text-red-400 hover:bg-red-400/10 font-sans"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
