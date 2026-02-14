"use client"

import { useState, use } from "react"
import { Button } from "@/components/ui/button"
import { RichEditor } from "@/components/admin/rich-editor"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getChapters, saveChapter } from "@/lib/storage"

export default function NovoCapituloPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        if (!title) return alert("Adicione um título para o capítulo!")
        setIsSaving(true)
        try {
            const chapters = await getChapters(id)
            const nextNumber = chapters.length + 1
            await saveChapter(id, { title, content, chapter_number: nextNumber })
            router.push(`/admin/livros/${id}`)
        } catch (error) {
            alert("Erro ao salvar capítulo.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/livros/${id}`}><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-white">Novo Capítulo</h1>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar Capítulo"}
                </Button>
            </div>

            <div className="space-y-6">
                <input
                    type="text"
                    placeholder="Título do Capítulo"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-gray-700 focus:outline-none font-serif"
                />
                <RichEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Escreva o conteúdo do capítulo aqui..."
                />
            </div>
        </div>
    )
}
