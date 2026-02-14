"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, Plus, Mail, Edit2, Trash2, X, Check, Send, UserCheck, Eye, EyeOff, ShieldOff, ShieldCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UserData {
    id: string
    email: string
    username: string
    avatar_url: string
    created_at: string
    last_sign_in_at: string
    is_blocked?: boolean
}

export default function UsuariosPage() {
    const [users, setUsers] = useState<UserData[]>([])
    const [blocked, setBlocked] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState("")
    const [modal, setModal] = useState<'create' | 'edit' | null>(null)
    const [editUser, setEditUser] = useState<UserData | null>(null)
    const [showPass, setShowPass] = useState(false)
    const [showBlocked, setShowBlocked] = useState(false)

    const [fEmail, setFEmail] = useState("")
    const [fPassword, setFPassword] = useState("")
    const [fUsername, setFUsername] = useState("")

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    const loadUsers = () => {
        setLoading(true)
        fetch('/api/admin/users').then(r => r.json()).then(data => {
            const all = Array.isArray(data) ? data : []
            setUsers(all.filter((u: UserData) => !u.is_blocked))
            setBlocked(all.filter((u: UserData) => u.is_blocked))
            setLoading(false)
        })
    }

    useEffect(() => { loadUsers() }, [])

    const resetForm = () => { setFEmail(""); setFPassword(""); setFUsername(""); setShowPass(false) }
    const closeModal = () => { setModal(null); setEditUser(null); resetForm() }

    const handleCreate = async () => {
        if (!fEmail || !fPassword) return showToast("Preencha email e senha")
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', email: fEmail, password: fPassword, username: fUsername })
        })
        const data = await res.json()
        if (data.error) return showToast("Erro: " + data.error)
        showToast("Usuário criado!")
        closeModal()
        loadUsers()
    }

    const handleEdit = async () => {
        if (!editUser) return
        const body: any = { user_id: editUser.id }
        if (fUsername) body.username = fUsername
        if (fEmail && fEmail !== editUser.email) body.email = fEmail

        const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        const data = await res.json()
        if (data.error) return showToast("Erro: " + data.error)
        showToast("Usuário atualizado!")
        closeModal()
        loadUsers()
    }

    const handleBlock = async (user: UserData) => {
        await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, is_blocked: true })
        })
        showToast(`@${user.username || user.email} bloqueado`)
        loadUsers()
    }

    const handleUnblock = async (user: UserData) => {
        await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, is_blocked: false })
        })
        showToast(`@${user.username || user.email} reativado`)
        loadUsers()
    }

    const openEdit = (user: UserData) => {
        setEditUser(user)
        setFEmail(user.email)
        setFUsername(user.username)
        setFPassword("")
        setModal('edit')
    }

    const renderRow = (u: UserData, i: number) => (
        <motion.div
            key={u.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className={`grid grid-cols-[1fr_1fr_140px_120px] items-center px-6 py-4 border-b border-white/5 last:border-0 transition-colors ${u.is_blocked ? 'opacity-50' : 'hover:bg-white/[0.02]'}`}
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0">
                    {u.avatar_url
                        ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <Users className="w-3 h-3 text-purple-400" />
                    }
                </div>
                <div>
                    <span className="text-white text-sm">@{u.username || '—'}</span>
                    {u.is_blocked && <span className="ml-2 text-xs text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded">bloqueado</span>}
                </div>
            </div>
            <span className="text-gray-400 text-sm truncate">{u.email}</span>
            <span className="text-gray-500 text-xs">
                {u.created_at ? formatDistanceToNow(new Date(u.created_at), { addSuffix: true, locale: ptBR }) : '—'}
            </span>
            <div className="flex items-center gap-2 justify-end">
                <button onClick={() => openEdit(u)} className="text-gray-500 hover:text-purple-400 transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                </button>
                {u.is_blocked ? (
                    <button onClick={() => handleUnblock(u)} className="text-gray-500 hover:text-green-400 transition-colors" title="Reativar">
                        <ShieldCheck className="w-4 h-4" />
                    </button>
                ) : (
                    <button onClick={() => handleBlock(u)} className="text-gray-500 hover:text-red-400 transition-colors" title="Bloquear">
                        <ShieldOff className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.div>
    )

    return (
        <div className="p-8">
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
                    {toast}
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Usuários</h1>
                    <p className="text-gray-400">Gerencie os usuários do blog.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setModal('create') }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                >
                    <Plus className="w-4 h-4" /> Criar usuário
                </button>
            </div>

            {/* Tabela ativos */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4">
                <div className="grid grid-cols-[1fr_1fr_140px_120px] text-xs text-gray-500 uppercase tracking-wider px-6 py-3 border-b border-white/10">
                    <span>Usuário</span>
                    <span>Email</span>
                    <span>Cadastro</span>
                    <span className="text-right">Ações</span>
                </div>
                {loading && <div className="text-center py-12 text-gray-500">Carregando...</div>}
                {!loading && users.length === 0 && <div className="text-center py-12 text-gray-500">Nenhum usuário ainda.</div>}
                {users.map((u, i) => renderRow(u, i))}
            </div>

            <p className="text-xs text-gray-600 mb-6">{users.length} usuário{users.length !== 1 ? 's' : ''} ativo{users.length !== 1 ? 's' : ''}</p>

            {/* Bloqueados */}
            {blocked.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowBlocked(p => !p)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-3"
                    >
                        <ShieldOff className="w-4 h-4" />
                        {showBlocked ? 'Ocultar' : 'Ver'} usuários bloqueados ({blocked.length})
                    </button>
                    {showBlocked && (
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden opacity-70">
                            <div className="grid grid-cols-[1fr_1fr_140px_120px] text-xs text-gray-500 uppercase tracking-wider px-6 py-3 border-b border-white/10">
                                <span>Usuário</span><span>Email</span><span>Cadastro</span><span className="text-right">Ações</span>
                            </div>
                            {blocked.map((u, i) => renderRow(u, i))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">
                                {modal === 'create' ? 'Criar usuário' : `Editar @${editUser?.username || editUser?.email}`}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nome de usuário</label>
                                <input
                                    value={fUsername}
                                    onChange={e => setFUsername(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                    placeholder="seunome"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={fEmail}
                                    onChange={e => setFEmail(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                    placeholder="usuario@email.com"
                                />
                            </div>

                            {modal === 'create' && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Senha</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={fPassword}
                                            onChange={e => setFPassword(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                            placeholder="mínimo 6 caracteres"
                                        />
                                        <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={closeModal} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={modal === 'create' ? handleCreate : handleEdit}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                            >
                                {modal === 'create' ? <><UserCheck className="w-4 h-4" /> Criar</> : <><Check className="w-4 h-4" /> Salvar</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
