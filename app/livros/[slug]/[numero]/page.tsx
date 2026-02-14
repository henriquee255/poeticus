"use client"

import { useState, useEffect, use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react"
import { Book, Chapter } from "@/types"
import { getBooks, getChapters } from "@/lib/storage"

export default function CapituloPage({ params }: { params: Promise<{ slug: string; numero: string }> }) {
    const { slug, numero } = use(params)
    const capNumber = parseInt(numero)
    const [book, setBook] = useState<Book | null>(null)
    const [chapter, setChapter] = useState<Chapter | null>(null)
    const [totalChapters, setTotalChapters] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getBooks().then(async books => {
            const found = books.find(b => b.slug === slug && b.status === 'published')
            if (!found) return
            setBook(found)
            const caps = await getChapters(found.id)
            setTotalChapters(caps.length)
            const cap = caps.find(c => c.chapter_number === capNumber)
            if (cap) setChapter(cap)
        }).catch(() => {}).finally(() => setIsLoading(false))
    }, [slug, capNumber])

    if (isLoading) return <div className="min-h-screen bg-black pt-28 text-center text-gray-500">Carregando...</div>
    if (!book || !chapter) return <div className="min-h-screen bg-black pt-28 text-center text-gray-500">Capítulo não encontrado.</div>

    const hasPrev = capNumber > 1
    const hasNext = capNumber < totalChapters

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-4">
            <div className="container mx-auto max-w-2xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-10">
                    <Link href="/livros" className="hover:text-white transition-colors">Livros</Link>
                    <span>/</span>
                    <Link href={`/livros/${slug}`} className="hover:text-white transition-colors">{book.title}</Link>
                    <span>/</span>
                    <span className="text-gray-400">Capítulo {capNumber}</span>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 text-xs text-purple-400 mb-3">
                        <BookOpen className="w-3 h-3" />
                        <span>Capítulo {capNumber} de {totalChapters}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mb-12">{chapter.title}</h1>

                    {chapter.content ? (
                        <div
                            className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed font-serif"
                            style={{ lineHeight: '2' }}
                            dangerouslySetInnerHTML={{ __html: chapter.content }}
                        />
                    ) : (
                        <p className="text-gray-500 italic">Capítulo sem conteúdo.</p>
                    )}
                </motion.div>

                {/* Navegação */}
                <div className="flex items-center justify-between mt-16 pt-8 border-t border-white/10">
                    {hasPrev ? (
                        <Link
                            href={`/livros/${slug}/${capNumber - 1}`}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Capítulo anterior
                        </Link>
                    ) : <div />}

                    <Link href={`/livros/${slug}`} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                        Ver índice
                    </Link>

                    {hasNext ? (
                        <Link
                            href={`/livros/${slug}/${capNumber + 1}`}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Próximo capítulo
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <Link href={`/livros/${slug}`} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                            Fim do livro
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
