"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { PenLine, Send, CheckCircle, Image as ImageIcon, X, AlertCircle } from "lucide-react"
import Link from "next/link"
import { RichEditor } from "@/components/admin/rich-editor"

const DEFAULT_CATEGORIES = ['geral', 'amor', 'reflexão', 'saudade', 'natureza', 'cristã', 'outro']

export default function NovaEscritaPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
    const [category, setCategory] = useState('geral')
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState('')
    const [uploadingImg, setUploadingImg] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!loading && !user) router.push('/login')
    }, [user, loading])

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const cats = data.map((c: any) => (typeof c === 'string' ? c : c.name)?.toLowerCase().trim()).filter(Boolean)
                const merged = [...new Set([...DEFAULT_CATEGORIES.map(c => c.toLowerCase()), ...cats])]
                setCategories(merged)
            }
        }).catch(() => {})
    }, [])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return setError('Preencha título e conteúdo.')
        setSaving(true); setError('')

        let image_url = ''
        if (imageFile) {
            setUploadingImg(true)
            const form = new FormData()
            form.append('file', imageFile); form.append('user_id', user!.id)
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
            const uploadData = await uploadRes.json()
            if (uploadData.url) image_url = uploadData.url
            setUploadingImg(false)
        }

        const res = await fetch('/api/escritas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user!.id, title: title.trim(), content: content.trim(), category, image_url: image_url || undefined })
        })
        const data = await res.json()
        if (data.error) { setError(data.error); setSaving(false) }
        else setDone(true)
    }

    if (done) return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white font-serif mb-3">Escrita publicada!</h2>
                <p className="text-gray-400 mb-8">Sua escrita já está visível nas Escritas Livres. ✨</p>
                <div className="flex gap-3 justify-center">
                    <Link href="/escritas-livres" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">Ver escritas</Link>
                    <button onClick={() => { setDone(false); setTitle(''); setContent(''); setCategory('geral'); setImagePreview(''); setImageFile(null) }}
                        className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white text-sm rounded-xl transition-colors">
                        Escrever outra
                    </button>
                </div>
            </motion.div>
        </div>
    )

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 py-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-8">
                        <Link href="/escritas-livres" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4 block">
                            ← Escritas Livres
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <PenLine className="w-6 h-6 text-purple-400" />
                            <h1 className="text-3xl font-bold text-white font-serif">Nova escrita</h1>
                        </div>
                        <p className="text-gray-500 text-sm">Compartilhe sua poesia com a comunidade. Conteúdo desrespeitoso ou ofensivo será removido.</p>
                    </div>

                    {/* Aviso de moderação */}
                    <div className="flex items-start gap-3 bg-amber-900/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-300/80">Ao publicar você concorda com as regras da comunidade. Conteúdo ofensivo, discurso de ódio ou spam será removido sem aviso prévio.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Título + Categoria */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Título</label>
                                <input value={title} onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-xl font-serif focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-700"
                                    placeholder="Nome da sua escrita..." maxLength={100} required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Categoria</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}
                                    className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors capitalize">
                                    {categories.map(c => <option key={c} value={c} className="bg-black capitalize">{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Editor rico */}
                        <RichEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escreva seu poema aqui..."
                        />

                        {/* Imagem opcional */}
                        <div>
                            {imagePreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-white/10 w-fit">
                                    <img src={imagePreview} alt="" className="max-h-48 object-cover rounded-xl" />
                                    <button type="button" onClick={() => { setImageFile(null); setImagePreview('') }}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-white/10 hover:border-purple-500/40 text-gray-500 hover:text-purple-400 text-sm rounded-xl transition-colors">
                                    <ImageIcon className="w-4 h-4" /> Adicionar imagem (opcional)
                                </button>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button type="submit" disabled={saving || uploadingImg}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
                            <Send className="w-4 h-4" />
                            {uploadingImg ? 'Enviando imagem...' : saving ? 'Publicando...' : 'Publicar escrita'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
