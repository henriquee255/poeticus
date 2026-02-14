"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, Plus, Mail, Edit2, Trash2, X, Check, Send, UserCheck, Eye, EyeOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UserData {
    id: string
    email: string
    username: string
    avatar_url: string
    created_at: string
    last_sign_in_at: string
}

export default function UsuariosPage() {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState("")
    const [modal, setModal] = useState<'create' | 'invite' | 'edit' | null>(null)
    const [editUser, setEditUser] = useState<UserData | null>(null)
    const [showPass, setShowPass] = useState(false)

    // Form fields
    const [fEmail, setFEmail] = useState("")
    const [fPassword, setFPassword] = useState("")
    const [fUsername, setFUsername] = useState("")

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    const loadUsers = () => {
        setLoading(true)
        fetch('/api/admin/users').then(r => r.json()).then(data => {
            setUsers(Array.isArray(data) ? data : [])
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

    const handleInvite = async () => {
        if (!fEmail) return showToast("Digite o email")
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'invite', email: fEmail })
        })
        const data = await res.json()
        if (data.error) return showToast("Erro: " + data.error)
        showToast(`Convite enviado para ${fEmail}!`)
        closeModal()
        loadUsers()
    }

    const handleEdit = async () => {
        if (!editUser) return
        const body: any = { user_id: editUser.id }
        if (fEmail) body.email = fEmail
        if (fPassword) body.password = fPassword
        if (fUsername) body.username = fUsername

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

    const handleDelete = async (user: UserData) => {
        if (!confirm(`Deletar usuário ${user.email}?`)) return
        await fetch(`/api/admin/users?user_id=${user.id}`, { method: 'DELETE' })
        showToast("Usuário removido")
        loadUsers()
    }

    const openEdit = (user: UserData) => {
        setEditUser(user)
        setFEmail(user.email)
        setFUsername(user.username)
        setFPassword("")
        setModal('edit')
    }

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
                <div className="flex gap-3">
                    <button
                        onClick={() => { resetForm(); setModal('invite') }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
                    >
                        <Mail className="w-4 h-4" /> Enviar convite
                    </button>
                    <button
                        onClick={() => { resetForm(); setModal('create') }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Criar usuário
                    </button>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_150px_150px_100px] text-xs text-gray-500 uppercase tracking-wider px-6 py-3 border-b border-white/10">
                    <span>Usuário</span>
                    <span>Email</span>
                    <span>Cadastro</span>
                    <span>Último acesso</span>
                    <span className="text-right">Ações</span>
                </div>

                {loading && (
                    <div className="text-center py-12 text-gray-500">Carregando...</div>
                )}

                {!loading && users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">Nenhum usuário ainda.</div>
                )}

                {users.map((u, i) => (
                    <motion.div
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="grid grid-cols-[1fr_1fr_150px_150px_100px] items-center px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0">
                                {u.avatar_url
                                    ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                    : <Users className="w-3 h-3 text-purple-400" />
                                }
                            </div>
                            <span className="text-white text-sm">@{u.username || '—'}</span>
                        </div>
                        <span className="text-gray-400 text-sm truncate">{u.email}</span>
                        <span className="text-gray-500 text-xs">
                            {u.created_at ? formatDistanceToNow(new Date(u.created_at), { addSuffix: true, locale: ptBR }) : '—'}
                        </span>
                        <span className="text-gray-500 text-xs">
                            {u.last_sign_in_at ? formatDistanceToNow(new Date(u.last_sign_in_at), { addSuffix: true, locale: ptBR }) : 'Nunca'}
                        </span>
                        <div className="flex items-center gap-2 justify-end">
                            <button
                                onClick={() => openEdit(u)}
                                className="text-gray-500 hover:text-purple-400 transition-colors"
                                title="Editar"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(u)}
                                className="text-gray-500 hover:text-red-400 transition-colors"
                                title="Deletar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <p className="text-xs text-gray-600 mt-4">{users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}</p>

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
                                {modal === 'create' && 'Criar usuário'}
                                {modal === 'invite' && 'Enviar convite'}
                                {modal === 'edit' && `Editar @${editUser?.username || editUser?.email}`}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {modal !== 'invite' && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Nome de usuário</label>
                                    <input
                                        value={fUsername}
                                        onChange={e => setFUsername(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                        placeholder="seunome"
                                    />
                                </div>
                            )}

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

                            {modal !== 'invite' && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        {modal === 'edit' ? 'Nova senha (deixe vazio para manter)' : 'Senha'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={fPassword}
                                            onChange={e => setFPassword(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                            placeholder="mínimo 6 caracteres"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(p => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {modal === 'invite' && (
                                <p className="text-xs text-gray-500 bg-white/5 rounded-lg px-4 py-3">
                                    O usuário receberá um email com um link para criar sua senha e acessar o blog.
                                </p>
                            )}

                            {modal === 'create' && fEmail && fPassword && (
                                <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-3 text-xs text-gray-400">
                                    <p className="font-medium text-purple-300 mb-1">Dados de acesso:</p>
                                    <p>Email: <span className="text-white">{fEmail}</span></p>
                                    <p>Senha: <span className="text-white">{showPass ? fPassword : '••••••••'}</span></p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={closeModal} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={modal === 'create' ? handleCreate : modal === 'invite' ? handleInvite : handleEdit}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                            >
                                {modal === 'invite' ? <><Send className="w-4 h-4" /> Enviar convite</> :
                                 modal === 'create' ? <><UserCheck className="w-4 h-4" /> Criar</> :
                                 <><Check className="w-4 h-4" /> Salvar</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
