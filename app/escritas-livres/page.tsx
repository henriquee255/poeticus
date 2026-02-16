"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Heart, Eye, PenLine, Pin, User, Search, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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
    user_id: string
    profiles: { username: string; avatar_url?: string }
}

const DEFAULT_CATS = ['todos', 'geral', 'amor', 'reflexão', 'saudade', 'natureza', 'cristã', 'outro']

export default function EscritasLivresPage() {
    const { user } = useAuth()
    const [escritas, setEscritas] = useState<Escrita[]>([])
    const [loading, setLoading] = useState(true)
    const [sort, setSort] = useState('recent')
    const [category, setCategory] = useState('todos')
    const [search, setSearch] = useState('')
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATS)

    useEffect(() => {
        setLoading(true)
        const params = new URLSearchParams({ sort })
        if (category !== 'todos') params.set('category', category)
        fetch(`/api/escritas?${params}`)
            .then(r => r.json())
            .then(data => { setEscritas(Array.isArray(data) ? data : []); setLoading(false) })
    }, [sort, category])

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const cats = data.map((c: any) => (typeof c === 'string' ? c : c.name)?.toLowerCase().trim()).filter(Boolean)
                const merged = [...new Set([...DEFAULT_CATS, ...cats])]
                setCategories(merged)
            }
        }).catch(() => {})
    }, [])

    const preview = (content: string) => content.replace(/<[^>]+>/g, '').slice(0, 120) + '...'

    const filtered = escritas.filter(e => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return e.title.toLowerCase().includes(q) || e.profiles?.username?.toLowerCase().includes(q) || preview(e.content).toLowerCase().includes(q)
    })

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white font-serif mb-2">Escritas Livres</h1>
                        <p className="text-gray-400">Poemas e escritas da comunidade Poeticus.</p>
                    </div>
                    {user ? (
                        <Link
                            href="/escritas-livres/nova"
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            <PenLine className="w-4 h-4" /> Publicar escrita
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white text-sm rounded-xl transition-colors"
                        >
                            Entre para publicar
                        </Link>
                    )}
                </div>

                {/* Search */}
                <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por título, autor..."
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-600"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                        {[['recent', 'Recentes'], ['likes', 'Mais curtidas'], ['views', 'Mais vistas']].map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => setSort(val)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sort === val ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${category === cat ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300 bg-white/5 border border-white/5'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {loading && <div className="text-center py-16 text-gray-500">Carregando...</div>}
                {!loading && filtered.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <PenLine className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p>{search ? 'Nenhuma escrita encontrada para essa busca.' : 'Nenhuma escrita ainda. Seja o primeiro!'}</p>
                    </div>
                )}
                <div className="space-y-4">
                    {filtered.map((e, i) => (
                        <motion.div
                            key={e.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                        >
                            <Link
                                href={`/escritas-livres/${e.id}`}
                                className="block bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-purple-500/20 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {e.pinned && <Pin className="w-3 h-3 text-purple-400 shrink-0" />}
                                        <h2 className="text-lg font-bold text-white font-serif group-hover:text-purple-300 transition-colors truncate">
                                            {e.title}
                                        </h2>
                                    </div>
                                    <span className="text-xs text-gray-600 capitalize shrink-0 bg-white/5 px-2 py-0.5 rounded-full">
                                        {e.category}
                                    </span>
                                </div>

                                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                                    {preview(e.content)}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-purple-900/40 border border-purple-500/20 overflow-hidden flex items-center justify-center">
                                            {e.profiles?.avatar_url
                                                ? <img src={e.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                : <User className="w-3 h-3 text-purple-400" />
                                            }
                                        </div>
                                        <span className="text-xs text-gray-500">@{e.profiles?.username || 'anônimo'}</span>
                                        <span className="text-gray-700">·</span>
                                        <span className="text-xs text-gray-600">
                                            {format(new Date(e.created_at), "dd MMM yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{e.likes}</span>
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{e.views}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
