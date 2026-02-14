"use client"

import Link from "next/link"
import { Instagram } from "lucide-react"
import { useEffect, useState } from "react"
import { getSettings } from "@/lib/storage"

export function Footer() {
    const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/frases_kennye")

    useEffect(() => {
        getSettings().then(s => {
            if (s?.instagramUrl) setInstagramUrl(s.instagramUrl)
        }).catch(() => {})
    }, [])

    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="text-2xl font-bold tracking-tighter text-white font-serif mb-4 block">
                            Poeticus<span className="text-purple-500">.</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Um refúgio digital para a alma. Poemas, poesias e reflexões para quem busca profundidade em cada palavra.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Navegação</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/" className="hover:text-purple-400 transition-colors">Início</Link></li>
                            <li><Link href="/poemas" className="hover:text-purple-400 transition-colors">Poemas</Link></li>
                            <li><Link href="/livros" className="hover:text-purple-400 transition-colors">Livros</Link></li>
                            <li><Link href="/contato" className="hover:text-purple-400 transition-colors">Contato</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Categorias</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/categoria/amor" className="hover:text-purple-400 transition-colors">Amor</Link></li>
                            <li><Link href="/categoria/tristeza" className="hover:text-purple-400 transition-colors">Melancolia</Link></li>
                            <li><Link href="/categoria/existencial" className="hover:text-purple-400 transition-colors">Existencial</Link></li>
                            <li><Link href="/categoria/esperanca" className="hover:text-purple-400 transition-colors">Esperança</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs">
                        © {new Date().getFullYear()} Poeticus. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-4">
                        <Link href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            <Instagram className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
