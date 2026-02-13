"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getPosts } from "@/lib/storage"
import { Post } from "@/types"
import { cn } from "@/lib/utils"

export function SearchBar() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        const handleSearch = async () => {
            if (query.trim() === "") {
                setResults([])
                return
            }

            setIsLoading(true)
            try {
                const allPosts = await getPosts()
                const lowerQuery = query.toLowerCase()
                const filtered = allPosts.filter(post =>
                    post.status === 'published' && (
                        post.title.toLowerCase().includes(lowerQuery) ||
                        post.excerpt.toLowerCase().includes(lowerQuery) ||
                        post.category.toLowerCase().includes(lowerQuery)
                    )
                )
                setResults(filtered)
            } catch (error) {
                console.error("Error searching posts:", error)
            } finally {
                setIsLoading(false)
            }
        }

        const timeoutId = setTimeout(handleSearch, 300)
        return () => clearTimeout(timeoutId)
    }, [query])

    const handleSelect = (slug: string) => {
        setIsOpen(false)
        setQuery("")
        router.push(`/post/${slug}`)
    }

    return (
        <div ref={wrapperRef} className="relative hidden md:block">
            <div className={cn(
                "flex items-center relative transition-all duration-300",
                isOpen ? "w-64" : "w-48"
            )}>
                <Search className="w-4 h-4 text-gray-400 absolute left-3 z-10" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar poemas..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all w-full placeholder:text-gray-500"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("")
                            setResults([])
                            inputRef.current?.focus()
                        }}
                        className="absolute right-3 text-gray-400 hover:text-white"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (query || results.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-80 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/5"
                    >
                        {isLoading ? (
                            <div className="p-4 flex items-center justify-center text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-xs">Buscando inspiração...</span>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="py-2">
                                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-semibold border-b border-white/5 mb-1">
                                    Sugestões
                                </div>
                                {results.map((post) => (
                                    <button
                                        key={post.id}
                                        onClick={() => handleSelect(post.slug)}
                                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors group flex flex-col gap-1 border-b border-white/5 last:border-0"
                                    >
                                        <span className="text-sm font-medium text-gray-200 group-hover:text-purple-300 transition-colors line-clamp-1">
                                            {post.title}
                                        </span>
                                        <span className="text-xs text-gray-500 line-clamp-1">
                                            {post.excerpt}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : query ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                Nenhum poema encontrado para "{query}"
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
