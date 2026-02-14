"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Plus, Edit, Trash2, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getBookById, updateBook, getChapters, deleteChapter } from "@/lib/storage"
import { Book, Chapter } from "@/types"
import { cn } from "@/lib/utils"

export default function EditarLivroPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [book, setBook] = useState<Book | null>(null)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        getBookById(id).then(setBook).catch(() => router.push('/admin/livros'))
        getChapters(id).then(setChapters).catch(() => {})
    }, [id])

    const handleSave = async () => {
        if (!book) return
        setIsSaving(true)
        try {
            await updateBook(id, {
                title: book.title,
                description: book.description,
                author_name: book.author_name,
                status: book.status,
            })
            alert("Livro salvo!")
        } catch {
            alert("Erro ao salvar.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteChapter = async (capId: string, title: string) => {
        if (!confirm(`Excluir capítulo "${title}"?`)) return
        try {
            await deleteChapter(id, capId)
            setChapters(chapters.filter(c => c.id !== capId))
        } catch {
            alert("Erro ao excluir capítulo.")
        }
    }

    if (!book) return <div className="p-8 text-gray-500">Carregando...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/livros"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-white font-serif">Editar Livro</h1>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar"}
                </Button>
            </div>

            {/* Dados do Livro */}
            <div className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-6">
                <div>
                    <label className="block text-xs text-gray-500 uppercase mb-2">Título</label>
                    <input
                        type="text"
                        value={book.title}
                        onChange={e => setBook({ ...book, title: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-xl font-serif focus:outline-none focus:border-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 uppercase mb-2">Descrição</label>
                    <textarea
                        value={book.description || ''}
                        onChange={e => setBook({ ...book, description: e.target.value })}
                        rows={3}
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 uppercase mb-2">Autor</label>
                        <input
                            type="text"
                            value={book.author_name || ''}
                            onChange={e => setBook({ ...book, author_name: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 uppercase mb-2">Status</label>
                        <select
                            value={book.status}
                            onChange={e => setBook({ ...book, status: e.target.value as 'published' | 'draft' })}
                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="draft">Rascunho</option>
                            <option value="published">Publicado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Capítulos */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Capítulos ({chapters.length})</h2>
                    <Button asChild className="bg-purple-900 hover:bg-purple-800 text-white">
                        <Link href={`/admin/livros/${id}/capitulo/new`}>
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Capítulo
                        </Link>
                    </Button>
                </div>

                {chapters.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                        <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Nenhum capítulo ainda. Comece escrevendo!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {chapters.map((cap) => (
                            <div
                                key={cap.id}
                                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/20 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-purple-400 w-6 text-center">{cap.chapter_number}</span>
                                    <span className="text-white text-sm font-medium">{cap.title}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-gray-400 hover:text-white">
                                        <Link href={`/admin/livros/${id}/capitulo/${cap.id}`}>
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                        onClick={() => handleDeleteChapter(cap.id, cap.title)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
