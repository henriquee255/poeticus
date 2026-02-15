"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, PenTool, FileText, Settings, LogOut, BookOpen, Users, Menu, X, MessageSquare } from "lucide-react"
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
    const [mobileOpen, setMobileOpen] = useState(false)
    const isLoginPage = pathname === "/admin/login"

    useEffect(() => {
        if (!isLoginPage && !isAuthenticated()) {
            router.push("/admin/login")
        } else {
            setIsChecking(false)
        }
    }, [pathname, isLoginPage, router])

    useEffect(() => { setMobileOpen(false) }, [pathname])

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
        { name: "Comentários", href: "/admin/comentarios", icon: MessageSquare },
        { name: "Configurações", href: "/admin/settings", icon: Settings },
    ]

    const NavLinks = () => (
        <nav className="px-4 py-4 space-y-1 flex-1 overflow-y-auto">
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
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
    )

    const LogoutBtn = () => (
        <div className="p-4 border-t border-white/10">
            <button
                onClick={() => { logout(); router.push("/admin/login") }}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/10 transition-colors"
            >
                <LogOut className="w-4 h-4" />
                Sair
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl fixed inset-y-0 left-0 z-50 hidden md:flex md:flex-col">
                <div className="p-6">
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-white font-serif">
                        Poeticus<span className="text-purple-500">.</span>
                    </Link>
                    <span className="text-xs text-gray-500 block mt-1">Painel do Autor</span>
                </div>
                <NavLinks />
                <LogoutBtn />
            </aside>

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 h-14">
                <Link href="/" className="text-xl font-bold tracking-tighter text-white font-serif">
                    Poeticus<span className="text-purple-500">.</span>
                </Link>
                <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white transition-colors p-1">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile Drawer */}
            <aside className={cn(
                "md:hidden fixed inset-y-0 left-0 z-[60] w-72 bg-[#080808] border-r border-white/10 flex flex-col transition-transform duration-300",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between px-6 h-14 border-b border-white/10 shrink-0">
                    <span className="text-lg font-bold text-white font-serif">Menu</span>
                    <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <NavLinks />
                <LogoutBtn />
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen pt-14 md:pt-0">
                {children}
            </main>
        </div>
    )
}
