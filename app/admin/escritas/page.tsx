"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { PenLine, Pin, Trash2, User, Eye, Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface Escrita {
    id: string
    title: string
    content: string
    category: string
    status: string
    pinned: boolean
    likes: number
    views: number
    created_at: string
    profiles: { username: string; avatar_url?: string }
}

export default function AdminEscritasPage() {
    const [escritas, setEscritas] = useState<Escrita[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [toast, setToast] = useState("")

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    const load = () => {
        setLoading(true)
        fetch(`/api/escritas?admin=1&status=published`)
            .then(r => r.json())
            .then(data => { setEscritas(Array.isArray(data) ? data : []); setLoading(false) })
    }

    useEffect(() => { load() }, [])

    const handlePin = async (e: Escrita) => {
        await fetch(`/api/escritas/${e.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pinned: !e.pinned })
        })
        showToast(e.pinned ? "Desafixado" : "Fixado!")
        load()
    }

    const handleDelete = async (id: string) => {
        await fetch(`/api/escritas/${id}`, { method: 'DELETE' })
        setEscritas(prev => prev.filter(e => e.id !== id))
        showToast("Escrita excluída")
    }

    const filtered = escritas.filter(e =>
        !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.profiles?.username?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-6 md:p-8">
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
                    {toast}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white font-serif mb-2">Escritas Livres</h1>
                <p className="text-gray-400 text-sm">Escritas publicadas pela comunidade. Exclua conteúdo inadequado.</p>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por título ou autor..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
            </div>

            {loading && <div className="text-center py-16 text-gray-500">Carregando...</div>}
            {!loading && filtered.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                    <PenLine className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>{search ? 'Nenhuma escrita encontrada.' : 'Nenhuma escrita publicada ainda.'}</p>
                </div>
            )}

            <div className="space-y-4">
                {filtered.map((e, i) => (
                    <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-5"
                    >
                        <div className="flex items-start gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    {e.pinned && <Pin className="w-3 h-3 text-purple-400" />}
                                    <Link href={`/escritas-livres/${e.id}`} target="_blank" className="font-bold text-white hover:text-purple-300 transition-colors font-serif">
                                        {e.title}
                                    </Link>
                                    <span className="text-xs text-gray-600 capitalize bg-white/5 px-2 py-0.5 rounded-full">{e.category}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-5 h-5 rounded-full bg-purple-900/40 overflow-hidden flex items-center justify-center">
                                        {e.profiles?.avatar_url
                                            ? <img src={e.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            : <User className="w-3 h-3 text-purple-400" />
                                        }
                                    </div>
                                    <span className="text-xs text-gray-500">@{e.profiles?.username || 'anônimo'}</span>
                                    <span className="text-gray-700">·</span>
                                    <span className="text-xs text-gray-600">{format(new Date(e.created_at), "dd MMM yyyy", { locale: ptBR })}</span>
                                    <span className="text-gray-700">·</span>
                                    <span className="text-xs text-gray-600 flex items-center gap-1"><Eye className="w-3 h-3" />{e.views}</span>
                                </div>
                                <p className="text-gray-500 text-sm line-clamp-2">
                                    {e.content.replace(/<[^>]+>/g, '').slice(0, 150)}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => handlePin(e)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs rounded-lg transition-colors ${e.pinned ? 'bg-purple-900/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/20' : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/30 hover:text-purple-300'}`}
                                >
                                    <Pin className="w-3.5 h-3.5" /> {e.pinned ? 'Desafixar' : 'Fixar'}
                                </button>
                                <button
                                    onClick={() => handleDelete(e.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/10 border border-red-500/20 text-red-400 hover:bg-red-900/30 text-xs rounded-lg transition-colors"
                                    title="Excluir permanentemente"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
