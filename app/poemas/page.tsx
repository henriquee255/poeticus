"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Filter, X } from "lucide-react"
import { Post, Category } from "@/types"
import { getPosts } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DEFAULT_CATS = ['Todas', 'Amor', 'Reflexões', 'Tristeza', 'Esperança', 'Existencial', 'Motivacional', 'Escritas Livres']

export default function PoemasPage() {
    const [activeCategory, setActiveCategory] = useState<string>('Todas')
    const [allPosts, setAllPosts] = useState<Post[]>([])
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATS)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getPosts()
                const published = data.filter(p => p.status === 'published')
                setAllPosts(published)
                setFilteredPosts(published)
            } catch (error) {
                console.error("Error fetching poems:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPosts()
    }, [])

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const cats = data.map((c: any) => typeof c === 'string' ? c : c.name).filter(Boolean)
                const merged = [...new Set([...DEFAULT_CATS, ...cats])]
                setCategories(merged)
            }
        }).catch(() => {})
    }, [])

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category)
        if (category === 'Todas') {
            setFilteredPosts(allPosts)
        } else {
            setFilteredPosts(allPosts.filter(post => post.category === category))
        }
    }

    return (
        <div className="min-h-screen bg-black pt-28 pb-16 px-4">
            <div className="container mx-auto">

                {/* Header da Página */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold font-serif text-white mb-4"
                    >
                        Acervo Literário
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto"
                    >
                        Explore nossa coleção de sentimentos traduzidos em palavras.
                        Filtre por categoria para encontrar o que sua alma procura.
                    </motion.p>
                </div>

                {/* Filtros */}
                <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex justify-center min-w-max gap-2 px-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm transition-all duration-300 border",
                                    activeCategory === cat
                                        ? "bg-purple-900/50 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de Posts */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredPosts.map((post) => (
                            <motion.article
                                layout
                                key={post.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group relative flex flex-col h-full"
                            >
                                <Link href={`/post/${post.slug}`} className="block h-full">
                                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col p-8 group-hover:bg-white/[0.07]">

                                        {/* Tags */}
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="inline-block px-3 py-1 rounded-full bg-black/40 text-xs text-purple-300 border border-white/5">
                                                {post.category}
                                            </span>
                                        </div>

                                        {/* Conteúdo */}
                                        <h2 className="text-2xl font-bold text-white font-serif mb-4 group-hover:text-purple-200 transition-colors leading-tight">
                                            {post.title}
                                        </h2>

                                        <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3 flex-grow">
                                            {post.excerpt}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-6 mt-auto">
                                            <span>{post.date}</span>
                                            
                                        </div>

                                        {/* Efeito Glow no Hover */}
                                        <div
                                            className={cn(
                                                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500",
                                                post.color || "from-purple-900 to-blue-900"
                                            )}
                                        />
                                    </div>
                                </Link>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredPosts.length === 0 && !isLoading && (
                    <div className="text-center py-20 text-gray-500">
                        <p>Nenhum poema encontrado nesta categoria.</p>
                        <Button
                            variant="link"
                            onClick={() => handleCategoryChange('Todas')}
                            className="mt-4 text-purple-400"
                        >
                            Ver todos os poemas
                        </Button>
                    </div>
                )}

            </div>
        </div>
    )
}
