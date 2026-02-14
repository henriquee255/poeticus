"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { RichEditor } from "@/components/admin/rich-editor"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getChapters, updateChapter } from "@/lib/storage"
import { Chapter } from "@/types"

export default function EditarCapituloPage({ params }: { params: Promise<{ id: string; capId: string }> }) {
    const { id, capId } = use(params)
    const router = useRouter()
    const [chapter, setChapter] = useState<Chapter | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        getChapters(id).then(caps => {
            const cap = caps.find(c => c.id === capId)
            if (cap) setChapter(cap)
            else router.push(`/admin/livros/${id}`)
        }).catch(() => router.push(`/admin/livros/${id}`))
    }, [id, capId])

    const handleSave = async () => {
        if (!chapter) return
        setIsSaving(true)
        try {
            await updateChapter(id, capId, { title: chapter.title, content: chapter.content })
            router.push(`/admin/livros/${id}`)
        } catch {
            alert("Erro ao salvar capítulo.")
        } finally {
            setIsSaving(false)
        }
    }

    if (!chapter) return <div className="p-8 text-gray-500">Carregando...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/livros/${id}`}><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Editar Capítulo</h1>
                        <p className="text-xs text-gray-500">Capítulo {chapter.chapter_number}</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar"}
                </Button>
            </div>

            <div className="space-y-6">
                <input
                    type="text"
                    value={chapter.title}
                    onChange={e => setChapter({ ...chapter, title: e.target.value })}
                    className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-gray-700 focus:outline-none font-serif"
                />
                <RichEditor
                    value={chapter.content || ''}
                    onChange={val => setChapter({ ...chapter, content: val })}
                    placeholder="Conteúdo do capítulo..."
                />
            </div>
        </div>
    )
}
