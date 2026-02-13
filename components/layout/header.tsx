"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { SearchBar } from "@/components/ui/search-bar"
// import { motion } from "framer-motion"

import { getSettings } from "@/lib/storage"
import { SiteSettings } from "@/types"

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [settings, setSettings] = useState<SiteSettings | null>(null)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings()
                setSettings(data)
            } catch (error) {
                console.error("Error fetching settings:", error)
            }
        }

        fetchSettings()

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                isScrolled ? "bg-black/80 backdrop-blur-sm border-white/10 py-2" : "bg-transparent py-4"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tighter text-white font-serif">
                    {settings?.name || "Poeticus"}<span className="text-purple-500">.</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/categoria/amor" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Amor
                    </Link>
                    <Link href="/categoria/reflexoes" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Reflexões
                    </Link>
                    <Link href="/categoria/escritas-livres" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Escritas Livres
                    </Link>
                    <Link href="/sobre" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Sobre
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <SearchBar />

                    {settings?.instagramUrl && (
                        <a
                            href={settings.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex"
                        >
                            <Button variant="glow" size="sm" className="gap-2">
                                <Instagram className="w-4 h-4" />
                                <span>Instagram</span>
                            </Button>
                        </a>
                    )}

                    <Button variant="ghost" size="icon" className="md:hidden text-white">
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
