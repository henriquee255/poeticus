"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Hash, Trash2, Eye, Lock, Globe, Crown, User, ChevronDown, ChevronUp, UserMinus, Search, Pencil, X, Check, Shield } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface Group {
    id: string; name: string; description?: string; member_count: number
    creator_id: string; image_url?: string; is_private?: boolean; created_at: string
    creatorName?: string
}

interface Member {
    user_id: string; role?: string
    profiles: { username: string; avatar_url?: string }
}

export default function AdminGruposPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [groupSearch, setGroupSearch] = useState('')
    const [expanded, setExpanded] = useState<string | null>(null)
    const [membersByGroup, setMembersByGroup] = useState<Record<string, Member[]>>({})
    const [memberLoadingFor, setMemberLoadingFor] = useState<string | null>(null)
    const [memberSearch, setMemberSearch] = useState<Record<string, string>>({})
    const [editingGroup, setEditingGroup] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [editPrivate, setEditPrivate] = useState(false)
    const [savingEdit, setSavingEdit] = useState(false)
    const [toast, setToast] = useState('')

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    useEffect(() => {
        fetch('/api/groups').then(r => r.json()).then(async (data: Group[]) => {
            if (!Array.isArray(data)) { setLoading(false); return }
            // Fetch creator usernames
            const creatorIds = [...new Set(data.map(g => g.creator_id).filter(Boolean))]
            const profilesRes = await fetch(
                `${window.location.origin}/api/profiles/batch?ids=${creatorIds.join(',')}`
            ).catch(() => null)
            let profileMap: Record<string, string> = {}
            if (profilesRes?.ok) {
                const profiles = await profilesRes.json()
                if (Array.isArray(profiles)) {
                    profiles.forEach((p: any) => { if (p.id) profileMap[p.id] = p.username })
                }
            }
            setGroups(data.map(g => ({ ...g, creatorName: profileMap[g.creator_id] || '' })))
            setLoading(false)
        })
    }, [])

    const loadMembers = async (groupId: string) => {
        setMemberLoadingFor(groupId)
        const res = await fetch(`/api/groups/${groupId}/members`)
        const data = await res.json()
        setMembersByGroup(prev => ({ ...prev, [groupId]: Array.isArray(data) ? data : [] }))
        setMemberLoadingFor(null)
    }

    const toggleExpand = (groupId: string) => {
        if (expanded === groupId) { setExpanded(null) }
        else { setExpanded(groupId); loadMembers(groupId) }
    }

    const startEdit = (g: Group) => {
        setEditingGroup(g.id); setEditName(g.name)
        setEditDesc(g.description || ''); setEditPrivate(g.is_private || false)
    }

    const saveEdit = async () => {
        if (!editingGroup) return
        setSavingEdit(true)
        await fetch(`/api/groups/${editingGroup}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ update: { name: editName, description: editDesc, is_private: editPrivate } })
        })
        setGroups(prev => prev.map(g => g.id === editingGroup
            ? { ...g, name: editName, description: editDesc, is_private: editPrivate } : g))
        setEditingGroup(null); setSavingEdit(false); showToast('Grupo atualizado!')
    }

    const handleDeleteGroup = async (id: string) => {
        if (!confirm('Excluir este grupo permanentemente?')) return
        await fetch(`/api/groups/${id}`, { method: 'DELETE' })
        setGroups(prev => prev.filter(g => g.id !== id))
        showToast('Grupo excluído')
    }

    const handleRemoveMember = async (groupId: string, userId: string) => {
        await fetch(`/api/groups/${groupId}/members?admin_id=${userId}&target_user_id=${userId}`, { method: 'DELETE' })
        setMembersByGroup(prev => ({ ...prev, [groupId]: (prev[groupId] || []).filter(m => m.user_id !== userId) }))
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, member_count: Math.max(0, g.member_count - 1) } : g))
        showToast('Membro removido')
    }

    const filteredGroups = groups.filter(g =>
        !groupSearch || g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
        (g.creatorName || '').toLowerCase().includes(groupSearch.toLowerCase())
    )

    return (
        <div className="p-6 md:p-8">
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">{toast}</div>
            )}

            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-1">Grupos</h1>
                    <p className="text-gray-400 text-sm">{groups.length} grupo{groups.length !== 1 ? 's' : ''} criado{groups.length !== 1 ? 's' : ''}</p>
                </div>
                {/* Group search */}
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input value={groupSearch} onChange={e => setGroupSearch(e.target.value)}
                        placeholder="Buscar grupos ou criadores..."
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-600" />
                    {groupSearch && (
                        <button onClick={() => setGroupSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {loading && <div className="text-center py-16 text-gray-500">Carregando...</div>}
            {!loading && filteredGroups.length === 0 && (
                <div className="text-center py-16 text-gray-600">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">{groupSearch ? 'Nenhum grupo encontrado.' : 'Nenhum grupo criado ainda.'}</p>
                </div>
            )}

            <div className="space-y-3">
                {filteredGroups.map((g, i) => (
                    <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">

                        {/* Edit inline form */}
                        <AnimatePresence>
                            {editingGroup === g.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="border-b border-white/5 overflow-hidden bg-purple-900/10">
                                    <div className="p-4 space-y-3">
                                        <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Editar grupo</p>
                                        <div className="flex gap-3 flex-wrap">
                                            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nome"
                                                className="flex-1 min-w-40 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-600" />
                                            <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descrição"
                                                className="flex-1 min-w-40 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-600" />
                                            <button type="button" onClick={() => setEditPrivate(p => !p)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${editPrivate ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'border-white/10 text-gray-400'}`}>
                                                {editPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                                                {editPrivate ? 'Fechado' : 'Aberto'}
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={saveEdit} disabled={!editName.trim() || savingEdit}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm rounded-xl transition-colors">
                                                <Check className="w-3.5 h-3.5" />{savingEdit ? 'Salvando...' : 'Salvar'}
                                            </button>
                                            <button onClick={() => setEditingGroup(null)}
                                                className="px-4 py-2 border border-white/10 text-gray-400 text-sm rounded-xl hover:text-white transition-colors">
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0">
                                {g.image_url ? <img src={g.image_url} alt="" className="w-full h-full object-cover" /> : <Hash className="w-5 h-5 text-purple-400" />}
                            </div>

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
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g.member_count} {g.member_count === 1 ? 'membro' : 'membros'}</span>
                                    {g.creatorName && <span>Criado por <span className="text-gray-400">@{g.creatorName}</span></span>}
                                    <span>{format(new Date(g.created_at), 'dd MMM yyyy', { locale: ptBR })}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => startEdit(g)}
                                    className={`p-2 border rounded-xl transition-colors ${editingGroup === g.id ? 'bg-purple-900/30 border-purple-500/30 text-purple-300' : 'text-gray-600 hover:text-purple-400 border-white/10'}`} title="Editar grupo">
                                    <Pencil className="w-4 h-4" />
                                </button>
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
                        <AnimatePresence>
                            {expanded === g.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-white/5 bg-black/20 overflow-hidden">
                                    {/* Member search */}
                                    <div className="px-4 pt-3 pb-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                            <input
                                                value={memberSearch[g.id] || ''}
                                                onChange={e => setMemberSearch(prev => ({ ...prev, [g.id]: e.target.value }))}
                                                placeholder="Buscar membros..."
                                                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-700" />
                                        </div>
                                    </div>

                                    {memberLoadingFor === g.id && (
                                        <p className="text-xs text-gray-600 text-center py-4">Carregando membros...</p>
                                    )}
                                    {memberLoadingFor !== g.id && (membersByGroup[g.id] || []).length === 0 && (
                                        <p className="text-xs text-gray-600 text-center py-4">Nenhum membro</p>
                                    )}
                                    <div className="divide-y divide-white/[0.04]">
                                        {(membersByGroup[g.id] || [])
                                            .filter(m => {
                                                const q = (memberSearch[g.id] || '').toLowerCase()
                                                return !q || (m.profiles?.username || '').toLowerCase().includes(q)
                                            })
                                            .map(m => (
                                                <div key={m.user_id} className="flex items-center gap-3 px-4 py-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-purple-900/30 overflow-hidden flex items-center justify-center shrink-0">
                                                        {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-purple-400" />}
                                                    </div>
                                                    <span className="text-sm text-gray-300 flex-1">@{m.profiles?.username || 'anônimo'}</span>
                                                    {(m.role === 'creator') && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-yellow-900/20 border border-yellow-500/20 text-yellow-400 rounded-full flex items-center gap-1">
                                                            <Crown className="w-2.5 h-2.5" /> Criador
                                                        </span>
                                                    )}
                                                    {(m.role === 'moderator') && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-purple-900/20 border border-purple-500/20 text-purple-300 rounded-full flex items-center gap-1">
                                                            <Shield className="w-2.5 h-2.5" /> Mod
                                                        </span>
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
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
