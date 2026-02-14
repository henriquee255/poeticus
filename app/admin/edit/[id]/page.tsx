"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { RichEditor } from "@/components/admin/rich-editor"
import { ArrowLeft, Save, Upload, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCategories, updatePost, getPostById } from "@/lib/storage"
import { Post } from "@/types"

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const [content, setContent] = useState("")
    const [title, setTitle] = useState("")
    const [authorName, setAuthorName] = useState("")
    const [category, setCategory] = useState("")
    const [categories, setCategories] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [status, setStatus] = useState<'published' | 'draft'>('published')
    const [post, setPost] = useState<Post | null>(null)

    useEffect(() => {
        const loadPostData = async () => {
            try {
                const cats = await getCategories()
                setCategories(cats)

                const existingPost = await getPostById(id)
                if (existingPost) {
                    setPost(existingPost)
                    setTitle(existingPost.title)
                    setContent(existingPost.content)
                    setCategory(existingPost.category)
                    setAuthorName(existingPost.author.name)
                    setStatus(existingPost.status)
                } else {
                    router.push("/admin/posts")
                }
            } catch (error) {
                console.error("Error loading post data:", error)
            }
        }

        loadPostData()
    }, [id, router])

    const handleSave = async (newStatus?: 'published' | 'draft') => {
        if (!title || !post) return alert("Adicione um título!")

        setIsSaving(true)
        const currentStatus = newStatus || status

        const slug = title.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const updatedPost: Post = {
            ...post,
            title,
            slug,
            excerpt: content.substring(0, 150).replace(/<[^>]*>?/gm, '') + "...",
            content,
            category,
            author: { ...post.author, name: authorName },
            status: currentStatus,
            readTime: `${Math.ceil(content.length / 500)} min`,
        }

        try {
            await updatePost(updatedPost)
            if (newStatus) setStatus(newStatus)
            alert("Alterações salvas!")
            router.push("/admin/posts")
        } catch (error) {
            console.error("Error updating post:", error)
            alert("Erro ao salvar as alterações.")
        } finally {
            setIsSaving(false)
        }
    }

    if (!post) return null

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/posts"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-white font-serif">Editar Poema</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
                        <Link href={`/post/${post.slug}`} target="_blank">
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        className="text-gray-400 border-white/10 hover:text-white"
                        onClick={() => handleSave('draft')}
                    >
                        {status === 'draft' ? 'Salvar Rascunho' : 'Mudar para Rascunho'}
                    </Button>
                    <Button onClick={() => handleSave('published')} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Salvando..." : "Salvar Alterações"}
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
                                <label className="block text-xs text-gray-500 uppercase mb-2">Status Atual</label>
                                <div className="text-sm font-medium">
                                    {status === 'published' ? (
                                        <span className="text-emerald-400">Publicado</span>
                                    ) : (
                                        <span className="text-gray-400">Rascunho</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={post.slug}
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
