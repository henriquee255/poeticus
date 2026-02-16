"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, Hash, Trash2, Eye, Lock, Globe, Crown, User, ChevronDown, ChevronUp, UserMinus } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface Group {
    id: string; name: string; description?: string; member_count: number
    creator_id: string; image_url?: string; is_private?: boolean; created_at: string
    profiles?: { username: string; avatar_url?: string }
}

interface Member {
    user_id: string; role: string
    profiles: { username: string; avatar_url?: string }
}

export default function AdminGruposPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [membersByGroup, setMembersByGroup] = useState<Record<string, Member[]>>({})
    const [toast, setToast] = useState('')

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    useEffect(() => {
        fetch('/api/groups').then(r => r.json()).then(data => {
            setGroups(Array.isArray(data) ? data : [])
            setLoading(false)
        })
    }, [])

    const loadMembers = async (groupId: string) => {
        if (membersByGroup[groupId]) return
        const res = await fetch(`/api/groups/${groupId}/members`)
        const data = await res.json()
        setMembersByGroup(prev => ({ ...prev, [groupId]: Array.isArray(data) ? data : [] }))
    }

    const toggleExpand = (groupId: string) => {
        if (expanded === groupId) {
            setExpanded(null)
        } else {
            setExpanded(groupId)
            loadMembers(groupId)
        }
    }

    const handleDeleteGroup = async (id: string) => {
        if (!confirm('Excluir este grupo permanentemente?')) return
        await fetch(`/api/groups/${id}`, { method: 'DELETE' })
        setGroups(prev => prev.filter(g => g.id !== id))
        showToast('Grupo excluído')
    }

    const handleRemoveMember = async (groupId: string, userId: string) => {
        // Admin removal — pass as query params with a dummy admin_id
        // For admin we use a special admin flow via the API
        await fetch(`/api/groups/${groupId}/members?admin_id=${userId}&target_user_id=${userId}`, { method: 'DELETE' })
        setMembersByGroup(prev => ({
            ...prev,
            [groupId]: (prev[groupId] || []).filter(m => m.user_id !== userId)
        }))
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, member_count: Math.max(0, g.member_count - 1) } : g))
        showToast('Membro removido')
    }

    return (
        <div className="p-6 md:p-8">
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
                    {toast}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white font-serif mb-2">Grupos</h1>
                <p className="text-gray-400">Gerencie os grupos da comunidade.</p>
            </div>

            {loading && <div className="text-center py-16 text-gray-500">Carregando...</div>}
            {!loading && groups.length === 0 && (
                <div className="text-center py-16 text-gray-600">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Nenhum grupo criado ainda.</p>
                </div>
            )}

            <div className="space-y-3">
                {groups.map((g, i) => (
                    <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                        <div className="p-4 flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0">
                                {g.image_url ? <img src={g.image_url} alt="" className="w-full h-full object-cover" /> : <Hash className="w-5 h-5 text-purple-400" />}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <span className="font-bold text-white">{g.name}</span>
                                    {g.is_private
                                        ? <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-900/20 border border-amber-500/20 text-amber-400 rounded-full"><Lock className="w-2.5 h-2.5" />Fechado</span>
                                        : <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-gray-500 rounded-full"><Globe className="w-2.5 h-2.5" />Aberto</span>
                                    }
                                </div>
                                {g.description && <p className="text-xs text-gray-500 truncate mb-0.5">{g.description}</p>}
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g.member_count} membros</span>
                                    <span>Criado por @{g.profiles?.username || '—'}</span>
                                    <span>{format(new Date(g.created_at), 'dd MMM yyyy', { locale: ptBR })}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <Link href={`/comunidade/grupos/${g.id}`} target="_blank"
                                    className="p-2 text-gray-600 hover:text-purple-400 border border-white/10 rounded-xl transition-colors" title="Ver grupo">
                                    <Eye className="w-4 h-4" />
                                </Link>
                                <button onClick={() => toggleExpand(g.id)}
                                    className="p-2 text-gray-600 hover:text-white border border-white/10 rounded-xl transition-colors" title="Ver membros">
                                    {expanded === g.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                <button onClick={() => handleDeleteGroup(g.id)}
                                    className="p-2 text-gray-600 hover:text-red-400 border border-white/10 rounded-xl transition-colors" title="Excluir grupo">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Members panel */}
                        {expanded === g.id && (
                            <div className="border-t border-white/5 bg-black/20">
                                {!membersByGroup[g.id] && (
                                    <p className="text-xs text-gray-600 text-center py-4">Carregando membros...</p>
                                )}
                                {membersByGroup[g.id]?.length === 0 && (
                                    <p className="text-xs text-gray-600 text-center py-4">Nenhum membro</p>
                                )}
                                <div className="divide-y divide-white/[0.04]">
                                    {(membersByGroup[g.id] || []).map(m => (
                                        <div key={m.user_id} className="flex items-center gap-3 px-5 py-2.5">
                                            <div className="w-8 h-8 rounded-full bg-purple-900/30 overflow-hidden flex items-center justify-center shrink-0">
                                                {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-purple-400" />}
                                            </div>
                                            <span className="text-sm text-gray-300 flex-1">@{m.profiles?.username || 'anônimo'}</span>
                                            {m.role === 'creator' && (
                                                <span className="text-[10px] px-2 py-0.5 bg-yellow-900/20 border border-yellow-500/20 text-yellow-400 rounded-full flex items-center gap-1">
                                                    <Crown className="w-2.5 h-2.5" /> Criador
                                                </span>
                                            )}
                                            {m.role === 'moderator' && (
                                                <span className="text-[10px] px-2 py-0.5 bg-purple-900/20 border border-purple-500/20 text-purple-300 rounded-full">Mod</span>
                                            )}
                                            {m.role !== 'creator' && (
                                                <button onClick={() => handleRemoveMember(g.id, m.user_id)}
                                                    className="p-1.5 text-gray-700 hover:text-red-400 transition-colors" title="Remover">
                                                    <UserMinus className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
