"use client"

import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Clock, Calendar, ChevronLeft, Type, Minus, Plus, Heart } from "lucide-react"
import Link from "next/link"
import { getPosts, likePost } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Post } from "@/types"

export default function PostPage() {
    const params = useParams()
    const slug = params.slug as string

    const [post, setPost] = useState<Post & { likes?: number } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [fontSize, setFontSize] = useState(18)
    const [isReadingMode, setIsReadingMode] = useState(false)
    const [hasLiked, setHasLiked] = useState(false)
    const [isLiking, setIsLiking] = useState(false)

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const allPosts = await getPosts()
                const found = allPosts.find(p => p.slug === slug)
                setPost(found || null)

                // Simple local state check for likes
                if (typeof window !== 'undefined') {
                    const liked = localStorage.getItem(`liked_${found?.id}`)
                    setHasLiked(!!liked)
                }
            } catch (error) {
                console.error("Error fetching post:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPost()
        window.scrollTo(0, 0)
    }, [slug])

    const handleLike = async () => {
        if (!post || hasLiked || isLiking) return

        setIsLiking(true)
        try {
            await likePost(post.id)
            setHasLiked(true)
            setPost(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null)
            if (typeof window !== 'undefined') {
                localStorage.setItem(`liked_${post.id}`, 'true')
            }
        } catch (error) {
            console.error("Error liking post:", error)
        } finally {
            setIsLiking(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-pulse font-serif text-2xl">Carregando...</div>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-serif mb-4">Poema não encontrado</h1>
                    <Button asChild variant="link" className="text-purple-400">
                        <Link href="/poemas">Voltar para o acervo</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <article className={cn(
            "min-h-screen transition-colors duration-500",
            isReadingMode ? "bg-[#1a1a1a]" : "bg-black"
        )}>

            {/* Reading Controls (Sticky) */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-20 right-4 z-40 flex flex-col gap-2 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFontSize(Math.min(fontSize + 2, 24))}
                    className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                    title="Aumentar fonte"
                >
                    <Plus className="w-4 h-4" />
                </Button>
                <div className="text-xs text-center text-gray-500 font-mono">{fontSize}px</div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFontSize(Math.max(fontSize - 2, 14))}
                    className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                    title="Diminuir fonte"
                >
                    <Minus className="w-4 h-4" />
                </Button>
                <div className="h-px bg-white/10 my-1" />
                <Button
                    variant={isReadingMode ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setIsReadingMode(!isReadingMode)}
                    className={cn(
                        "rounded-full h-8 w-8 transition-colors",
                        isReadingMode ? "bg-purple-600 text-white" : "text-white hover:bg-white/10"
                    )}
                    title="Modo Leitura"
                >
                    <Type className="w-4 h-4" />
                </Button>
            </motion.div>

            {/* Hero / Header do Post */}
            <div className="relative pt-32 pb-12 px-4 overflow-hidden">
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-b opacity-20 pointer-events-none",
                    post.color || "from-purple-900 via-black to-black"
                )} />

                <div className="container mx-auto max-w-3xl relative z-10 text-center">
                    <Link
                        href="/poemas"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-purple-400 transition-colors mb-8"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Voltar para o acervo
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-purple-300 border border-white/10 mb-6 backdrop-blur-sm">
                            {post.category}
                        </span>

                        <h1 className="text-4xl md:text-6xl font-bold font-serif text-white mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                            <span className="flex items-center gap-2">
                                <span className="w-8 h-px bg-white/20"></span>
                                {post.author.name}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {post.date}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.readTime}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Conteúdo do Poema */}
            <div className="container mx-auto max-w-2xl px-4 pb-24">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="prose prose-invert prose-lg md:prose-xl mx-auto"
                    style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: '1.8'
                    }}
                >
                    {/* Renderização segura do HTML do conteúdo */}
                    <div
                        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                        className="font-serif text-gray-200 whitespace-pre-line"
                    />
                </motion.div>

                {/* Rodapé do Post */}
                <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            disabled={hasLiked || isLiking}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
                                hasLiked
                                    ? "bg-red-500/10 border-red-500/50 text-red-500"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:border-red-500/30 hover:text-red-400"
                            )}
                        >
                            <Heart className={cn("w-5 h-5 transition-transform duration-300", hasLiked && "fill-current scale-110")} />
                            <span className="text-sm font-medium">{post.likes || 0}</span>
                        </button>
                        <div className="text-sm text-gray-500">
                            {hasLiked ? "Você tocou este verso." : "Gostou? Deixe seu toque."}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href)
                                alert("Link copiado!")
                            }}
                        >
                            Copiar Link
                        </Button>
                    </div>
                </div>
            </div>

        </article>
    )
}
