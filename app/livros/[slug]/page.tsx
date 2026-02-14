"use client"

import { useState, useEffect, use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react"
import { Book, Chapter } from "@/types"
import { getBooks, getChapters } from "@/lib/storage"

export default function LivroPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [book, setBook] = useState<Book | null>(null)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getBooks().then(async books => {
            const found = books.find(b => b.slug === slug && b.status === 'published')
            if (!found) return
            setBook(found)
            const caps = await getChapters(found.id)
            setChapters(caps)
        }).catch(() => {}).finally(() => setIsLoading(false))
    }, [slug])

    if (isLoading) return <div className="min-h-screen bg-black pt-28 text-center text-gray-500">Carregando...</div>
    if (!book) return <div className="min-h-screen bg-black pt-28 text-center text-gray-500">Livro não encontrado.</div>

    return (
        <div className="min-h-screen bg-black pt-28 pb-16 px-4">
            <div className="container mx-auto max-w-3xl">
                <Link href="/livros" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" />
                    Todos os livros
                </Link>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-purple-900/30 border border-purple-500/20 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-purple-400" />
                        </div>
                        {book.author_name && <span className="text-sm text-gray-500">{book.author_name}</span>}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4">{book.title}</h1>
                    {book.description && (
                        <p className="text-gray-400 leading-relaxed mb-12 border-l-2 border-purple-500/30 pl-4">{book.description}</p>
                    )}
                </motion.div>

                <div>
                    <h2 className="text-lg font-bold text-white mb-4">
                        {chapters.length} Capítulo{chapters.length !== 1 ? 's' : ''}
                    </h2>

                    {chapters.length === 0 ? (
                        <p className="text-gray-500 text-sm">Este livro ainda não possui capítulos publicados.</p>
                    ) : (
                        <div className="space-y-2">
                            {chapters.map((cap, i) => (
                                <motion.div
                                    key={cap.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        href={`/livros/${slug}/${cap.chapter_number}`}
                                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 hover:bg-white/[0.07] transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-mono text-purple-400 w-6 text-center">{cap.chapter_number}</span>
                                            <span className="text-white font-medium group-hover:text-purple-200 transition-colors">{cap.title}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
