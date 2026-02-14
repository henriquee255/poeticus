"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { SearchBar } from "@/components/ui/search-bar"
import { getSettings } from "@/lib/storage"
import { SiteSettings } from "@/types"

const navLinks = [
    { label: "Amor", href: "/categoria/amor" },
    { label: "Reflexões", href: "/categoria/reflexoes" },
    { label: "Escritas Livres", href: "/categoria/escritas-livres" },
    { label: "Livros", href: "/livros" },
    { label: "Sobre", href: "/sobre" },
]

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error)
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Fecha menu ao redimensionar para desktop
    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])

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

            {/* Mobile Menu Overlay */}
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
