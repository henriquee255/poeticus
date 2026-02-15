"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bug, Lightbulb, MessageSquare, CheckCircle, Circle, Trash2, User } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Feedback {
    id: string
    user_id: string
    username: string
    email: string
    type: string
    title: string
    content: string
    status: string
    created_at: string
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    bug: { icon: Bug, color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Bug' },
    suggestion: { icon: Lightbulb, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', label: 'Sugestão' },
    other: { icon: MessageSquare, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Outro' },
}

export default function AdminFeedbackPage() {
    const [items, setItems] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState("")
    const [filterType, setFilterType] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [expanded, setExpanded] = useState<string | null>(null)

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    const load = () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (filterType) params.set('type', filterType)
        if (filterStatus) params.set('status', filterStatus)
        fetch(`/api/feedback?${params}`)
            .then(r => r.json())
            .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
    }

    useEffect(() => { load() }, [filterType, filterStatus])

    const handleStatus = async (id: string, status: string) => {
        await fetch('/api/feedback', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        })
        showToast(status === 'resolved' ? "Marcado como resolvido" : "Reaberto")
        load()
    }

    const handleDelete = async (id: string) => {
        await fetch(`/api/feedback?id=${id}`, { method: 'DELETE' })
        showToast("Removido")
        load()
    }

    const open = items.filter(i => i.status === 'open').length
    const resolved = items.filter(i => i.status === 'resolved').length

    return (
        <div className="p-6 md:p-8">
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
                    {toast}
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white font-serif mb-2">Feedback</h1>
                <p className="text-gray-400">{open} aberto{open !== 1 ? 's' : ''} · {resolved} resolvido{resolved !== 1 ? 's' : ''}</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
                >
                    <option value="">Todos os tipos</option>
                    <option value="bug">Bug</option>
                    <option value="suggestion">Sugestão</option>
                    <option value="other">Outro</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors"
                >
                    <option value="">Todos os status</option>
                    <option value="open">Abertos</option>
                    <option value="resolved">Resolvidos</option>
                </select>
            </div>

            {loading && <div className="text-center py-16 text-gray-500">Carregando...</div>}
            {!loading && items.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>Nenhum feedback ainda.</p>
                </div>
            )}

            <div className="space-y-3">
                {items.map((item, i) => {
                    const t = TYPE_CONFIG[item.type] || TYPE_CONFIG.other
                    const Icon = t.icon
                    const isExpanded = expanded === item.id

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`bg-white/5 border rounded-xl overflow-hidden ${item.status === 'resolved' ? 'border-white/5 opacity-60' : 'border-white/10'}`}
                        >
                            <div
                                className="p-4 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                onClick={() => setExpanded(isExpanded ? null : item.id)}
                            >
                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 ${t.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-sm font-medium text-white">{item.title}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${t.color}`}>{t.label}</span>
                                        {item.status === 'resolved' && (
                                            <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">Resolvido</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                        {item.username && <span>@{item.username}</span>}
                                        {item.email && <span>· {item.email}</span>}
                                        <span>· {format(new Date(item.created_at), "dd MMM yyyy", { locale: ptBR })}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {item.status === 'open' ? (
                                        <button
                                            onClick={e => { e.stopPropagation(); handleStatus(item.id, 'resolved') }}
                                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-400 transition-colors px-2 py-1 rounded-lg hover:bg-green-500/10"
                                            title="Marcar como resolvido"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Resolver
                                        </button>
                                    ) : (
                                        <button
                                            onClick={e => { e.stopPropagation(); handleStatus(item.id, 'open') }}
                                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-yellow-400 transition-colors px-2 py-1 rounded-lg hover:bg-yellow-500/10"
                                            title="Reabrir"
                                        >
                                            <Circle className="w-4 h-4" /> Reabrir
                                        </button>
                                    )}
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
                                        className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="px-4 pb-4 border-t border-white/5 pt-3">
                                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
