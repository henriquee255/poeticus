"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, BookOpen } from "lucide-react"
import { Book } from "@/types"
import { getBooks, deleteBook } from "@/lib/storage"
import { cn } from "@/lib/utils"

export default function LivrosAdminPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchBooks()
    }, [])

    const fetchBooks = async () => {
        try {
            const data = await getBooks()
            setBooks(data)
        } catch (error) {
            console.error("Erro ao buscar livros:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Excluir "${title}" e todos os seus capítulos?`)) return
        try {
            await deleteBook(id)
            setBooks(books.filter(b => b.id !== id))
        } catch (error) {
            alert("Erro ao excluir livro.")
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Livros & Contos</h1>
                    <p className="text-gray-400">{books.length} obra{books.length !== 1 ? 's' : ''} no acervo</p>
                </div>
                <Button asChild className="bg-purple-900 hover:bg-purple-800 text-white">
                    <Link href="/admin/livros/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Livro
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-500">Carregando...</div>
            ) : books.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nenhum livro criado ainda.</p>
                    <Button asChild className="bg-purple-900 hover:bg-purple-800 text-white">
                        <Link href="/admin/livros/new">Criar primeiro livro</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {books.map((book) => (
                        <div
                            key={book.id}
                            className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/20 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-900/30 border border-purple-500/20 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">{book.title}</h3>
                                    {book.description && (
                                        <p className="text-sm text-gray-500 line-clamp-1">{book.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "text-xs px-2 py-1 rounded-full border",
                                    book.status === 'published'
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                )}>
                                    {book.status === 'published' ? 'Publicado' : 'Rascunho'}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-gray-400 hover:text-white">
                                        <Link href={`/livros/${book.slug}`} target="_blank">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-gray-400 hover:text-white">
                                        <Link href={`/admin/livros/${book.id}`}>
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                        onClick={() => handleDelete(book.id, book.title)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
