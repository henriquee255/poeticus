"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, Menu, X, User, LogOut, BookmarkCheck } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { SearchBar } from "@/components/ui/search-bar"
import { getSettings } from "@/lib/storage"
import { SiteSettings } from "@/types"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const navLinks = [
    { label: "Amor", href: "/categoria/amor" },
    { label: "Reflexões", href: "/categoria/reflexoes" },
    { label: "Escritas Livres", href: "/escritas-livres" },
    { label: "Comunidade", href: "/comunidade" },
    { label: "Livros", href: "/livros" },
    { label: "Sobre", href: "/sobre" },
]

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)
    const { user, profile, signOut } = useAuth()
    const router = useRouter()

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error)
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

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
                        {navLinks.map(l => (
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
                        {navLinks.map(l => (
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
