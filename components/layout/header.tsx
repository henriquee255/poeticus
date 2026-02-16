"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, Menu, X, User, LogOut, BookmarkCheck, Bell } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { SearchBar } from "@/components/ui/search-bar"
import { getSettings } from "@/lib/storage"
import { SiteSettings } from "@/types"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface SiteUpdate { id: string; title: string; content: string; type: string; created_at: string }

const UPDATE_TYPE_ICON: Record<string, string> = {
    update: '🔄', feature: '✨', fix: '🐛', news: '📢'
}

const DEFAULT_NAV_LINKS = [
    { label: "Amor", href: "/categoria/amor", enabled: true },
    { label: "Reflexões", href: "/categoria/reflexoes", enabled: true },
    { label: "Escritas Livres", href: "/escritas-livres", enabled: true },
    { label: "Comunidade", href: "/comunidade", enabled: true },
    { label: "Livros", href: "/livros", enabled: true },
    { label: "Feedback", href: "/feedback", enabled: true },
    { label: "Sobre", href: "/sobre", enabled: true },
]

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [bellOpen, setBellOpen] = useState(false)
    const [updates, setUpdates] = useState<SiteUpdate[]>([])
    const [seenCount, setSeenCount] = useState(0)
    const userMenuRef = useRef<HTMLDivElement>(null)
    const bellRef = useRef<HTMLDivElement>(null)
    const { user, profile, signOut } = useAuth()
    const router = useRouter()

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error)
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener("scroll", handleScroll)
        // Load updates for bell
        fetch('/api/updates').then(r => r.json()).then(data => {
            if (Array.isArray(data)) {
                setUpdates(data)
                const seen = parseInt(localStorage.getItem('bell_seen_count') || '0')
                setSeenCount(seen)
            }
        }).catch(() => {})
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Close bell on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const unreadCount = Math.max(0, updates.length - seenCount)
    const activeNavLinks = (settings?.navLinks && settings.navLinks.length > 0
        ? settings.navLinks.filter(l => l.enabled)
        : DEFAULT_NAV_LINKS.filter(l => l.enabled)
    )

    const handleOpenBell = () => {
        setBellOpen(p => !p)
        if (!bellOpen) {
            setSeenCount(updates.length)
            localStorage.setItem('bell_seen_count', String(updates.length))
        }
    }

    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])

    // Close user menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSignOut = async () => {
        await signOut()
        setUserMenuOpen(false)
        router.push('/')
    }

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                    isScrolled ? "bg-black/80 backdrop-blur-sm border-white/10 py-2" : "bg-transparent py-4"
                )}
            >
                <div className="container mx-auto px-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-white font-serif" onClick={() => setMenuOpen(false)}>
                        {settings?.name || "Poeticus"}<span className="text-purple-500">.</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {activeNavLinks.map(l => (
                            <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                {l.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <SearchBar />

                        {settings?.instagramUrl && (
                            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hidden md:flex">
                                <Button variant="glow" size="sm" className="gap-2">
                                    <Instagram className="w-4 h-4" />
                                    <span>Instagram</span>
                                </Button>
                            </a>
                        )}

                        {/* Bell */}
                        <div className="relative" ref={bellRef}>
                            <button onClick={handleOpenBell}
                                className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                <Bell className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-purple-500 rounded-full text-[9px] text-white flex items-center justify-center px-0.5 font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            {bellOpen && (
                                <div className="absolute right-0 top-10 w-80 bg-black/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-purple-400" />
                                        <p className="text-white text-sm font-semibold">Atualizações</p>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {updates.length === 0 ? (
                                            <p className="text-gray-500 text-sm text-center py-6">Nenhuma atualização ainda.</p>
                                        ) : (
                                            <div className="divide-y divide-white/5">
                                                {updates.map(u => (
                                                    <div key={u.id} className="px-4 py-3 hover:bg-white/[0.03] transition-colors">
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-base shrink-0">{UPDATE_TYPE_ICON[u.type] || '🔔'}</span>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-white leading-tight">{u.title}</p>
                                                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{u.content}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User menu */}
                        {user ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(prev => !prev)}
                                    className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/30 overflow-hidden flex items-center justify-center hover:border-purple-400 transition-colors"
                                >
                                    {profile?.avatar_url
                                        ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                        : <User className="w-4 h-4 text-purple-400" />
                                    }
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 top-10 w-48 bg-black/95 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-white text-sm font-medium">@{profile?.username}</p>
                                            <p className="text-gray-500 text-xs truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            href="/perfil"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            <BookmarkCheck className="w-4 h-4" /> Meu Perfil
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-colors w-full"
                                        >
                                            <LogOut className="w-4 h-4" /> Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="hidden md:block">
                                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white gap-2">
                                    <User className="w-4 h-4" /> Entrar
                                </Button>
                            </Link>
                        )}

                        {/* Hamburger */}
                        <button
                            onClick={() => setMenuOpen(prev => !prev)}
                            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                            aria-label="Menu"
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md flex flex-col pt-24 px-6 md:hidden">
                    <nav className="flex flex-col gap-2">
                        {activeNavLinks.map(l => (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setMenuOpen(false)}
                                className="text-xl font-serif text-gray-200 hover:text-white py-3 border-b border-white/10 transition-colors"
                            >
                                {l.label}
                            </Link>
                        ))}
                        {user ? (
                            <>
                                <Link href="/perfil" onClick={() => setMenuOpen(false)} className="text-xl font-serif text-gray-200 hover:text-white py-3 border-b border-white/10 transition-colors">
                                    Meu Perfil
                                </Link>
                                <button onClick={() => { handleSignOut(); setMenuOpen(false) }} className="text-left text-xl font-serif text-red-400 py-3 border-b border-white/10 transition-colors">
                                    Sair
                                </button>
                            </>
                        ) : (
                            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-xl font-serif text-purple-400 hover:text-purple-300 py-3 border-b border-white/10 transition-colors">
                                Entrar / Criar conta
                            </Link>
                        )}
                    </nav>

                    {settings?.instagramUrl && (
                        <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-8">
                            <Button variant="glow" className="w-full gap-2">
                                <Instagram className="w-4 h-4" />
                                Instagram
                            </Button>
                        </a>
                    )}
                </div>
            )}
        </>
    )
}
