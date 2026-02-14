"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Book } from "@/types"
import { getBooks } from "@/lib/storage"

export default function LivrosPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getBooks().then(data => {
            setBooks(data.filter(b => b.status === 'published'))
        }).catch(() => {}).finally(() => setIsLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-black pt-28 pb-16 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold font-serif text-white mb-4"
                    >
                        Livros & Contos
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400"
                    >
                        {isLoading ? "Carregando..." : `${books.length} obra${books.length !== 1 ? 's' : ''} disponível${books.length !== 1 ? 'is' : ''}`}
                    </motion.p>
                </div>

                {!isLoading && books.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Nenhum livro publicado ainda.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {books.map((book, i) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={`/livros/${book.slug}`} className="group block h-full">
                                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col p-8 group-hover:bg-white/[0.07]">
                                    <div className="w-12 h-12 bg-purple-900/30 border border-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                                        <BookOpen className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white font-serif mb-3 group-hover:text-purple-200 transition-colors">
                                        {book.title}
                                    </h2>
                                    {book.description && (
                                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-grow">
                                            {book.description}
                                        </p>
                                    )}
                                    {book.author_name && (
                                        <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-white/5">
                                            {book.author_name}
                                        </p>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900 opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity duration-500" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
