"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Plus, Trash2, Send, Megaphone, Bug, Star, Info } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Update {
    id: string
    title: string
    content: string
    type: string
    created_at: string
}

const TYPE_OPTIONS = [
    { value: 'update', label: 'Atualização', icon: '🔄', color: 'text-blue-400 bg-blue-900/20 border-blue-500/20' },
    { value: 'feature', label: 'Nova função', icon: '✨', color: 'text-purple-400 bg-purple-900/20 border-purple-500/20' },
    { value: 'fix', label: 'Correção', icon: '🐛', color: 'text-green-400 bg-green-900/20 border-green-500/20' },
    { value: 'news', label: 'Notícia', icon: '📢', color: 'text-amber-400 bg-amber-900/20 border-amber-500/20' },
]

export default function AtualizacoesPage() {
    const [updates, setUpdates] = useState<Update[]>([])
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [type, setType] = useState('update')
    const [sending, setSending] = useState(false)
    const [toast, setToast] = useState('')

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    useEffect(() => {
        fetch('/api/updates').then(r => r.json()).then(data => {
            setUpdates(Array.isArray(data) ? data : [])
            setLoading(false)
        })
    }, [])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return
        setSending(true)
        const res = await fetch('/api/updates', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, type })
        })
        const data = await res.json()
        if (data.id) {
            setUpdates(prev => [data, ...prev])
            setTitle(''); setContent(''); setType('update')
            showToast('Atualização publicada!')
        }
        setSending(false)
    }

    const handleDelete = async (id: string) => {
        await fetch('/api/updates?id=' + id, { method: 'DELETE' })
        setUpdates(prev => prev.filter(u => u.id !== id))
        showToast('Removida')
    }

    const typeInfo = (t: string) => TYPE_OPTIONS.find(o => o.value === t) || TYPE_OPTIONS[0]

    return (
        <div className="p-6 md:p-8 max-w-3xl">
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">{toast}</div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white font-serif mb-1 flex items-center gap-3">
                    <Bell className="w-7 h-7 text-purple-400" /> Atualizações do Blog
                </h1>
                <p className="text-gray-400 text-sm">Publique novidades que aparecem no sino de notificações do blog.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8 space-y-4">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Nova atualização</h2>
                <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Tipo</label>
                    <div className="flex gap-2 flex-wrap">
                        {TYPE_OPTIONS.map(opt => (
                            <button key={opt.value} type="button" onClick={() => setType(opt.value)}
                                className={`px-3 py-1.5 rounded-xl text-xs border transition-all flex items-center gap-1.5 ${type === opt.value ? opt.color : 'border-white/10 text-gray-500 hover:text-white'}`}>
                                <span>{opt.icon}</span>{opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Título</label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="Ex: Nova funcionalidade de grupos..." maxLength={100}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-gray-600" />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Descrição</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)}
                        placeholder="Descreva o que mudou ou foi adicionado..." rows={3} maxLength={500}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-gray-600 resize-none" />
                </div>
                <button type="submit" disabled={!title.trim() || !content.trim() || sending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors">
                    <Send className="w-4 h-4" />{sending ? 'Publicando...' : 'Publicar atualização'}
                </button>
            </form>

            {/* List */}
            {loading && <p className="text-center py-8 text-gray-500">Carregando...</p>}
            <div className="space-y-3">
                <AnimatePresence>
                    {updates.map((u, i) => {
                        const info = typeInfo(u.type)
                        return (
                            <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                                <div className="flex items-start gap-3">
                                    <span className={`text-xs px-2 py-1 rounded-lg border shrink-0 ${info.color}`}>{info.icon} {info.label}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white mb-1">{u.title}</p>
                                        <p className="text-xs text-gray-400 leading-relaxed">{u.content}</p>
                                        <p className="text-xs text-gray-600 mt-2">{format(new Date(u.created_at), 'dd MMM yyyy, HH:mm', { locale: ptBR })}</p>
                                    </div>
                                    <button onClick={() => handleDelete(u.id)}
                                        className="p-2 text-gray-600 hover:text-red-400 transition-colors shrink-0 rounded-lg hover:bg-red-900/10">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {!loading && updates.length === 0 && (
                    <div className="text-center py-12 text-gray-600">
                        <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Nenhuma atualização publicada ainda.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
