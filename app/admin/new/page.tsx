
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RichEditor } from "@/components/admin/rich-editor"
import { ArrowLeft, Save, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCategories, savePost, getSettings } from "@/lib/storage"
import { Post } from "@/types"

export default function NewPostPage() {
    const router = useRouter()
    const [content, setContent] = useState("")
    const [title, setTitle] = useState("")
    const [authorName, setAuthorName] = useState("")
    const [category, setCategory] = useState("")
    const [categories, setCategories] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const cats = await getCategories()
                setCategories(cats)
                if (cats.length > 0) setCategory(cats[0])

                const settings = await getSettings()
                setAuthorName(settings.authorName || "Admin")
            } catch (error) {
                console.error("Error loading initial data:", error)
            }
        }

        loadInitialData()
    }, [])

    const handleSave = async () => {
        if (!title) return alert("Adicione um título!")

        setIsSaving(true)

        const slug = title.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const newPost: Post = {
            id: Date.now().toString(),
            title,
            slug,
            excerpt: content.substring(0, 150).replace(/<[^>]*>?/gm, '') + "...",
            content,
            category,
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
            readTime: `${Math.ceil(content.length / 500)} min`,
            author: { name: authorName },
            status: 'published'
        }

        try {
            await savePost(newPost)
            router.push("/admin/posts")
        } catch (error) {
            console.error("Error saving post:", error)
            alert("Erro ao salvar o poema.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-white">Novo Poema</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-gray-400 border-white/10 hover:text-white">
                        Salvar Rascunho
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Publicando..." : "Publicar"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <input
                            type="text"
                            placeholder="Título do Poema"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent text-4xl font-bold text-white placeholder:text-gray-700 focus:outline-none font-serif"
                        />
                    </div>

                    <RichEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Escreva seus versos aqui..."
                    />
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-medium text-white mb-4">Configurações</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">Categoria</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">Autor</label>
                                <input
                                    type="text"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                                    placeholder="Nome do Autor"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">Capa</label>
                                <div className="border border-dashed border-white/10 rounded-lg p-8 text-center hover:bg-white/5 transition-colors cursor-pointer">
                                    <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                                    <span className="text-xs text-gray-500">Clique para upload</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={title.toLowerCase().replace(/\s+/g, '-')}
                                    disabled
                                    className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm text-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

