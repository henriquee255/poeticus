"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getSettings } from "@/lib/storage"
import { SiteSettings } from "@/types"
import Link from "next/link"
import { Instagram } from "lucide-react"

export default function SobrePage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null)

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error)
    }, [])

    const title = settings?.aboutTitle || "Sobre"
    const content = settings?.aboutContent || ""

    return (
        <div className="min-h-screen bg-black">
            {/* Hero */}
            <div className="relative pt-36 pb-16 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
                <div className="container mx-auto max-w-3xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-purple-300 border border-white/10 mb-6">
                            {settings?.name || "Poeticus"}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold font-serif text-white mb-6">{title}</h1>
                        <div className="w-16 h-px bg-purple-500/50 mx-auto" />
                    </motion.div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="container mx-auto max-w-2xl px-4 pb-24">
                {content ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="prose prose-invert prose-lg max-w-none font-serif text-gray-300 leading-relaxed"
                        style={{ lineHeight: '1.9' }}
                        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
                    />
                ) : (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center text-gray-500 font-serif text-lg italic"
                    >
                        Esta página ainda não tem conteúdo.
                    </motion.p>
                )}

                {/* Rodapé */}
                {settings?.instagramUrl && (
                    <div className="mt-16 pt-8 border-t border-white/10 flex justify-center">
                        <a
                            href={settings.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <Instagram className="w-4 h-4" />
                            Siga no Instagram
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
