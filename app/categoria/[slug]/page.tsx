"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Clock, ArrowLeft } from "lucide-react"
import { Post } from "@/types"
import { getPosts } from "@/lib/storage"
import { cn } from "@/lib/utils"
import { use } from "react"

const SLUG_TO_CATEGORY: Record<string, string> = {
    "amor": "Amor",
    "reflexoes": "Reflexões",
    "escritas-livres": "Escritas Livres",
    "tristeza": "Tristeza",
    "esperanca": "Esperança",
    "existencial": "Existencial",
    "motivacional": "Motivacional",
}

export default function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const categoryName = SLUG_TO_CATEGORY[slug] || slug
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getPosts()
                const filtered = slug === 'todas'
                    ? data.filter((p: any) => p.status === 'published')
                    : data.filter((p: any) => p.status === 'published' && p.category?.toLowerCase() === categoryName.toLowerCase())
                setPosts(filtered)
            } catch (error) {
                console.error("Error fetching poems:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPosts()
    }, [categoryName])

    return (
        <div className="min-h-screen bg-black pt-28 pb-16 px-4">
            <div className="container mx-auto">

                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Início
                    </Link>
                </div>

                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold font-serif text-white mb-4"
                    >
                        {categoryName}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400"
                    >
                        {isLoading ? "Carregando..." : `${posts.length} poema${posts.length !== 1 ? 's' : ''} encontrado${posts.length !== 1 ? 's' : ''}`}
                    </motion.p>
                </div>

                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {posts.map((post) => (
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
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="inline-block px-3 py-1 rounded-full bg-black/40 text-xs text-purple-300 border border-white/5">
                                                {post.category}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl font-bold text-white font-serif mb-4 group-hover:text-purple-200 transition-colors leading-tight">
                                            {post.title}
                                        </h2>

                                        <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3 flex-grow">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-6 mt-auto">
                                            <span>{post.date}</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>

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

                {posts.length === 0 && !isLoading && (
                    <div className="text-center py-20 text-gray-500">
                        <p>Nenhum poema encontrado nesta categoria.</p>
                        <Link href="/" className="mt-4 inline-block text-purple-400 hover:text-purple-300 transition-colors">
                            Voltar ao início
                        </Link>
                    </div>
                )}

            </div>
        </div>
    )
}
