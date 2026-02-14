"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveBook, getSettings } from "@/lib/storage"

export default function NovoLivroPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [authorName, setAuthorName] = useState("")
    const [status, setStatus] = useState<'published' | 'draft'>('draft')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        getSettings().then(s => setAuthorName(s.authorName || "")).catch(() => {})
    }, [])

    const slug = title.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')

    const handleSave = async () => {
        if (!title) return alert("Adicione um título!")
        setIsSaving(true)
        try {
            await saveBook({ title, slug, description, author_name: authorName, status })
            router.push("/admin/livros")
        } catch (error) {
            alert("Erro ao salvar livro.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/livros"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-white">Novo Livro</h1>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar"}
                </Button>
            </div>

            <div className="space-y-6 bg-white/5 border border-white/10 rounded-xl p-6">
                <div>
                    <label className="block text-xs text-gray-500 uppercase mb-2">Título</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Título do livro ou conto"
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-xl font-serif focus:outline-none focus:border-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-500 uppercase mb-2">Descrição / Sinopse</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Uma breve sinopse do livro..."
                        rows={4}
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-500 uppercase mb-2">Autor</label>
                    <input
                        type="text"
                        value={authorName}
                        onChange={e => setAuthorName(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-500 uppercase mb-2">Status</label>
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value as 'published' | 'draft')}
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 uppercase mb-2">Slug (URL)</label>
                    <input
                        type="text"
                        value={slug}
                        disabled
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-gray-500"
                    />
                </div>
            </div>
        </div>
    )
}
