"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { getAds } from "@/lib/storage"
import { Ad } from "@/types"

export function AdBanner({ location }: { location: Ad['location'] }) {
    const [ads, setAds] = useState<Ad[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const allAds = await getAds()
                const activeForLocation = allAds.filter(a => a.active && a.location === location)
                setAds(activeForLocation)
            } catch (error) {
                console.error("Error fetching ads:", error)
            }
        }

        fetchAds()
    }, [location])

    useEffect(() => {
        if (ads.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % ads.length)
        }, 5000) // Change ad every 5 seconds

        return () => clearInterval(interval)
    }, [ads])

    if (ads.length === 0) return null

    const ad = ads[currentIndex]

    return (
        <div className="container mx-auto px-4 my-8 min-h-[100px] flex justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                >
                    {ad.script ? (
                        <div className="ad-container text-center" dangerouslySetInnerHTML={{ __html: ad.script }} />
                    ) : (
                        <a
                            href={ad.linkUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative overflow-hidden rounded-xl group border border-white/5 bg-white/5"
                        >
                            {ad.imageUrl ? (
                                <img
                                    src={ad.imageUrl}
                                    alt={ad.title}
                                    className="w-full h-auto max-h-[200px] object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-32 flex items-center justify-center text-gray-500">
                                    <span className="text-sm font-medium">{ad.title} (Sem Imagem)</span>
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-gray-400 border border-white/10 uppercase tracking-widest">
                                Anúncio
                            </div>
                        </a>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

