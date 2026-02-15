"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { PenLine, Send, CheckCircle } from "lucide-react"
import Link from "next/link"

const CATEGORIES = ['geral', 'amor', 'reflexão', 'saudade', 'natureza', 'outro']

export default function NovaEscritaPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("geral")
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!loading && !user) router.push("/login")
    }, [user, loading])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return setError("Preencha título e conteúdo.")
        setSaving(true)
        setError("")
        const res = await fetch('/api/escritas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user!.id, title: title.trim(), content: content.trim(), category })
        })
        const data = await res.json()
        if (data.error) {
            setError(data.error)
            setSaving(false)
        } else {
            setDone(true)
        }
    }

    if (done) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white font-serif mb-3">Escrita enviada!</h2>
                    <p className="text-gray-400 mb-8">Sua escrita foi enviada para revisão. Assim que for aprovada pelo administrador, aparecerá nas Escritas Livres.</p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/escritas-livres" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">
                            Ver escritas
                        </Link>
                        <button onClick={() => { setDone(false); setTitle(""); setContent(""); setCategory("geral") }} className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white text-sm rounded-xl transition-colors">
                            Escrever outra
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-2xl mx-auto px-4 py-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-8">
                        <Link href="/escritas-livres" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4 block">
                            ← Escritas Livres
                        </Link>
                        <h1 className="text-3xl font-bold text-white font-serif mb-2">Nova escrita</h1>
                        <p className="text-gray-400 text-sm">Compartilhe sua poesia com a comunidade. Será revisada antes de publicar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Título</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="Nome da sua escrita..."
                                maxLength={100}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Categoria</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors capitalize"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c} className="bg-black capitalize">{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Conteúdo</label>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"
                                placeholder="Escreva seu poema aqui..."
                                rows={14}
                                maxLength={5000}
                                required
                            />
                            <p className="text-xs text-gray-600 mt-1 text-right">{content.length}/5000</p>
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            {saving ? "Enviando..." : "Enviar para revisão"}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
