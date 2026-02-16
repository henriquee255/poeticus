"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { PenLine, Save, X, AlertCircle } from "lucide-react"
import Link from "next/link"
import { RichEditor } from "@/components/admin/rich-editor"

const DEFAULT_CATEGORIES = ['geral', 'amor', 'reflexão', 'saudade', 'natureza', 'cristã', 'outro']

export default function EditarEscritaPage() {
    const { id } = useParams() as { id: string }
    const { user, loading } = useAuth()
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('geral')
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        if (!loading && !user) router.push('/login')
    }, [user, loading])

    useEffect(() => {
        if (!id) return
        fetch(`/api/escritas/${id}`).then(r => r.json()).then(data => {
            if (data?.id) {
                setTitle(data.title || '')
                setContent(data.content || '')
                setCategory(data.category || 'geral')
            }
            setLoadingData(false)
        })
    }, [id])

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const cats = data.map((c: any) => (typeof c === 'string' ? c : c.name)?.toLowerCase().trim()).filter(Boolean)
                const merged = [...new Set([...DEFAULT_CATEGORIES, ...cats])]
                setCategories(merged)
            }
        }).catch(() => {})
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return setError('Preencha título e conteúdo.')
        setSaving(true); setError('')
        const res = await fetch(`/api/escritas/${id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim(), content: content.trim(), category })
        })
        const data = await res.json()
        if (data.error) { setError(data.error); setSaving(false) }
        else router.push('/escritas-livres/' + id)
    }

    if (loadingData) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 py-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-8">
                        <Link href="/perfil" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4 block">
                            ← Meu perfil
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <PenLine className="w-6 h-6 text-purple-400" />
                            <h1 className="text-3xl font-bold text-white font-serif">Editar escrita</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Título</label>
                                <input value={title} onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-xl font-serif focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-700"
                                    placeholder="Título..." maxLength={100} required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Categoria</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}
                                    className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 capitalize">
                                    {categories.map(c => <option key={c} value={c} className="bg-black capitalize">{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <RichEditor value={content} onChange={setContent} placeholder="Conteúdo da escrita..." />

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <div className="flex gap-3">
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
                                <Save className="w-4 h-4" />{saving ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                            <Link href={'/escritas-livres/' + id}
                                className="flex items-center gap-2 px-6 py-3 border border-white/10 text-gray-400 hover:text-white rounded-xl transition-colors">
                                <X className="w-4 h-4" /> Cancelar
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
