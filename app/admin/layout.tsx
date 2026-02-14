"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, PenTool, FileText, Settings, LogOut, BookOpen, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { isAuthenticated, logout } from "@/lib/storage"
import { useEffect, useState } from "react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)
    const isLoginPage = pathname === "/admin/login"

    useEffect(() => {
        if (!isLoginPage && !isAuthenticated()) {
            router.push("/admin/login")
        } else {
            setIsChecking(false)
        }
    }, [pathname, isLoginPage, router])

    if (isLoginPage) {
        return <>{children}</>
    }

    if (isChecking) {
        return <div className="min-h-screen bg-black" />
    }

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Novo Post", href: "/admin/new", icon: PenTool },
        { name: "Todos os Posts", href: "/admin/posts", icon: FileText },
        { name: "Categorias", href: "/admin/categories", icon: FileText },
        { name: "Livros & Contos", href: "/admin/livros", icon: BookOpen },
        { name: "Anúncios", href: "/admin/ads", icon: Settings },
        { name: "Notificações", href: "/admin/notifications", icon: Settings },
        { name: "Usuários", href: "/admin/usuarios", icon: Users },
        { name: "Configurações", href: "/admin/settings", icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl fixed inset-y-0 left-0 z-50 hidden md:block">
                <div className="p-6">
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-white font-serif">
                        Poeticus<span className="text-purple-500">.</span>
                    </Link>
                    <span className="text-xs text-gray-500 block mt-1">Painel do Autor</span>
                </div>

                <nav className="px-4 py-8 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-purple-900/20 text-purple-300 border border-purple-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <button
                        onClick={() => {
                            logout()
                            router.push("/admin/login")
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                {children}
            </main>
        </div>
    )
}
