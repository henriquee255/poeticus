"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, ArrowRight, Heart } from "lucide-react"
import { useEffect, useState } from "react"
import { getPosts } from "@/lib/storage"
import { Post } from "@/types"

export function FeaturedPosts() {
    const [posts, setPosts] = useState<Post[]>([])

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const allPosts = await getPosts()
                const published = allPosts.filter(p => p.status === 'published').slice(0, 3)
                setPosts(published)
            } catch (error) {
                console.error("Error fetching posts:", error)
            }
        }

        fetchPosts()
    }, [])

    if (posts.length === 0) return null

    return (
        <section className="py-24 bg-black relative">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                    <div>
                        <span className="text-purple-400 font-medium tracking-wider text-sm uppercase mb-2 block">Destaques da Semana</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">Leituras Essenciais</h2>
                    </div>
                    <Link href="/poemas" className="hidden md:flex items-center gap-2 text-white/60 hover:text-purple-400 transition-colors group">
                        Ver todos os poemas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="group relative flex flex-col h-full"
                        >
                            <Link href={`/post/${post.slug}`} className="block h-full">
                                <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col`}>

                                    {/* Hover Gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${post.color || 'from-purple-900/20 to-black'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    <div className="p-8 relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-purple-300 border border-white/5 backdrop-blur-sm">
                                                {post.category}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white font-serif mb-4 group-hover:text-purple-200 transition-colors leading-tight line-clamp-2">
                                            {post.title}
                                        </h3>

                                        <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3 flex-grow group-hover:text-gray-300 transition-colors">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-6 mt-auto group-hover:border-white/10 group-hover:text-gray-400 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span>{post.date}</span>
                                                <div className="flex items-center gap-1 text-red-400/70">
                                                    <Heart className="w-3 h-3 fill-current" />
                                                    <span>{post.likes || 0}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link href="/poemas" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                        Ver todos <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
