"use client"

import { useState, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getAds } from "@/lib/storage"
import { Ad } from "@/types"

export function AdBanner({ location }: { location: Ad['location'] }) {
    const [ads, setAds] = useState<Ad[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(1)

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

    const next = useCallback(() => {
        setDirection(1)
        setCurrentIndex(prev => (prev + 1) % ads.length)
    }, [ads.length])

    const prev = useCallback(() => {
        setDirection(-1)
        setCurrentIndex(prev => (prev - 1 + ads.length) % ads.length)
    }, [ads.length])

    useEffect(() => {
        if (ads.length <= 1) return
        const interval = setInterval(next, 5000)
        return () => clearInterval(interval)
    }, [ads, next])

    if (ads.length === 0) return null

    const ad = ads[currentIndex]

    return (
        <div className="container mx-auto px-4 my-8 relative group">
            <div className="relative min-h-[100px] flex justify-center items-center">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={ad.id}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -40 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                    >
                        {ad.script ? (
                            <div className="ad-container text-center" dangerouslySetInnerHTML={{ __html: ad.script }} />
                        ) : (
                            <a
                                href={ad.linkUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative overflow-hidden rounded-xl border border-white/5 bg-white/5 group/img"
                            >
                                {ad.imageUrl ? (
                                    <img
                                        src={ad.imageUrl}
                                        alt={ad.title}
                                        className="w-full h-auto max-h-[200px] object-cover transition-transform duration-700 group-hover/img:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-32 flex items-center justify-center text-gray-500">
                                        <span className="text-sm font-medium">{ad.title}</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-gray-400 border border-white/10 uppercase tracking-widest">
                                    Anúncio
                                </div>
                            </a>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Setas de navegação */}
                {ads.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.preventDefault(); prev() }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); next() }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Indicadores */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {ads.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i) }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white w-3' : 'bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
