"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { Bug, Lightbulb, MessageSquare, CheckCircle, Send } from "lucide-react"
import Link from "next/link"

const TYPES = [
    { value: 'bug', label: 'Bug', icon: Bug, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { value: 'suggestion', label: 'Sugestão', icon: Lightbulb, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { value: 'other', label: 'Outro', icon: MessageSquare, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
]

export default function FeedbackPage() {
    const { user, profile } = useAuth()
    const [type, setType] = useState('suggestion')
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [name, setName] = useState(profile?.username || "")
    const [email, setEmail] = useState("")
    const [sending, setSending] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return setError("Preencha título e descrição.")
        setSending(true)
        setError("")

        const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user?.id,
                username: profile?.username || name,
                email: email,
                type,
                title: title.trim(),
                content: content.trim()
            })
        })
        const data = await res.json()
        if (data.error) {
            setError(data.error)
        } else {
            setDone(true)
        }
        setSending(false)
    }

    if (done) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white font-serif mb-3">Obrigado!</h2>
                    <p className="text-gray-400 mb-8">Seu feedback foi enviado e será analisado em breve.</p>
                    <Link href="/" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">
                        Voltar ao início
                    </Link>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-xl mx-auto px-4 py-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white font-serif mb-2">Feedback</h1>
                        <p className="text-gray-400">Encontrou um bug? Tem uma sugestão? Conta pra gente.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                        {/* Type */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-3">Tipo</label>
                            <div className="flex gap-3">
                                {TYPES.map(t => {
                                    const Icon = t.icon
                                    return (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => setType(t.value)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${type === t.value ? t.color : 'text-gray-500 bg-white/5 border-white/10 hover:border-white/20'}`}
                                        >
                                            <Icon className="w-4 h-4" /> {t.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Name / email if not logged */}
                        {!user && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Seu nome</label>
                                    <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm" placeholder="Opcional" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm" placeholder="Opcional" />
                                </div>
                            </div>
                        )}
                        {user && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email (para resposta)</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm" placeholder="Opcional" />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Título</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm" placeholder="Resumo do feedback..." maxLength={100} required />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Descrição</label>
                            <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm resize-none" placeholder="Descreva com detalhes..." rows={5} maxLength={2000} required />
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
                            <Send className="w-4 h-4" />
                            {sending ? 'Enviando...' : 'Enviar feedback'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
