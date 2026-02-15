"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import {
    User, Bookmark, Heart, FolderOpen, Plus, Trash2, LogOut,
    Camera, Save, Eye, EyeOff, PenLine, MessageCircle, MessageSquare,
    Users, Settings, ChevronRight
} from "lucide-react"
import { getPosts } from "@/lib/storage"
import { Post } from "@/types"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Collection { id: string; name: string }
interface SavedPost { id: string; post_id: string; collection_id?: string }

type Tab = 'salvos' | 'curtidos' | 'escritas' | 'posts' | 'comentarios' | 'feedbacks' | 'configuracoes'

const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'salvos', label: 'Salvos', icon: Bookmark },
    { key: 'curtidos', label: 'Curtidos', icon: Heart },
    { key: 'escritas', label: 'Escritas', icon: PenLine },
    { key: 'posts', label: 'Posts', icon: Users },
    { key: 'comentarios', label: 'Comentários', icon: MessageCircle },
    { key: 'feedbacks', label: 'Feedbacks', icon: MessageSquare },
    { key: 'configuracoes', label: 'Config', icon: Settings },
]

export default function PerfilPage() {
    const { user, profile, loading, signOut, refreshProfile } = useAuth()
    const router = useRouter()

    const [tab, setTab] = useState<Tab>('salvos')
    const [username, setUsername] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState('')
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPass, setShowPass] = useState(false)

    const [collections, setCollections] = useState<Collection[]>([])
    const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
    const [allPosts, setAllPosts] = useState<Post[]>([])
    const [newCollectionName, setNewCollectionName] = useState('')
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null)

    // New tab data
    const [escritas, setEscritas] = useState<any[]>([])
    const [feedPosts, setFeedPosts] = useState<any[]>([])
    const [comentarios, setComentarios] = useState<any[]>([])
    const [feedbacks, setFeedbacks] = useState<any[]>([])

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

    useEffect(() => {
        if (!loading && !user) router.push('/login')
    }, [user, loading])

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '')
            setAvatarPreview(profile.avatar_url || '')
        }
    }, [profile])

    useEffect(() => {
        if (!user) return
        fetch('/api/collections?user_id=' + user.id).then(r => r.json()).then(setCollections)
        fetch('/api/saved?user_id=' + user.id).then(r => r.json()).then(setSavedPosts)
        getPosts().then(setAllPosts)
    }, [user])

    useEffect(() => {
        if (!user) return
        if (tab === 'escritas' && escritas.length === 0) {
            fetch('/api/escritas?user_id=' + user.id + '&status=').then(r => r.json()).then(d => setEscritas(Array.isArray(d) ? d : []))
        }
        if (tab === 'posts' && feedPosts.length === 0) {
            fetch('/api/feed?user_id=' + user.id).then(r => r.json()).then(d => setFeedPosts(Array.isArray(d) ? d : []))
        }
        if (tab === 'comentarios' && comentarios.length === 0) {
            fetch('/api/comments?user_id=' + user.id).then(r => r.json()).then(d => setComentarios(Array.isArray(d) ? d : []))
        }
        if (tab === 'feedbacks' && feedbacks.length === 0) {
            fetch('/api/feedback?user_id=' + user.id).then(r => r.json()).then(d => setFeedbacks(Array.isArray(d) ? d : []))
        }
    }, [tab, user])

    const likedPostIds = allPosts.filter(p => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem('liked_' + p.id) === 'true'
    }).map(p => p.id)

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return
        setAvatarFile(file)
        const reader = new FileReader()
        reader.onload = () => setAvatarPreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleSaveProfile = async () => {
        if (!user) return
        setSaving(true)
        let avatar_url = profile?.avatar_url || ''
        if (avatarFile) {
            const form = new FormData()
            form.append('file', avatarFile); form.append('user_id', user.id)
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
            const uploadData = await uploadRes.json()
            if (uploadData.url) avatar_url = uploadData.url + '?t=' + Date.now()
            else { showToast('Erro ao enviar foto: ' + (uploadData.error || 'desconhecido')); setSaving(false); return }
        }
        await fetch('/api/profile', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, username, avatar_url })
        })
        await refreshProfile()
        showToast('Perfil atualizado!'); setSaving(false)
    }

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim() || !user) return
        const res = await fetch('/api/collections', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, name: newCollectionName.trim() })
        })
        const col = await res.json()
        setCollections(prev => [...prev, col]); setNewCollectionName('')
    }

    const handleDeleteCollection = async (id: string) => {
        if (!user) return
        await fetch('/api/collections?id=' + id + '&user_id=' + user.id, { method: 'DELETE' })
        setCollections(prev => prev.filter(c => c.id !== id))
    }

    const handleUnsave = async (post_id: string) => {
        if (!user) return
        await fetch('/api/saved?user_id=' + user.id + '&post_id=' + post_id, { method: 'DELETE' })
        setSavedPosts(prev => prev.filter(s => s.post_id !== post_id))
    }

    const getPostById = (post_id: string) => allPosts.find(p => p.id === post_id)
    const filteredSaved = selectedCollection ? savedPosts.filter(s => s.collection_id === selectedCollection) : savedPosts

    const statusLabel = (s: string) => s === 'published' ? 'Publicado' : s === 'pending' ? 'Aguardando' : 'Rejeitado'
    const statusColor = (s: string) => s === 'published' ? 'text-green-400' : s === 'pending' ? 'text-yellow-400' : 'text-red-400'
    const feedbackTypeLabel = (t: string) => t === 'bug' ? '🐛 Bug' : t === 'suggestion' ? '💡 Sugestão' : '💬 Outro'

    if (loading) return <div className="min-h-screen bg-black pt-28 text-center text-gray-500">Carregando...</div>
    if (!user || !profile) return null

    return (
        <div className="min-h-screen bg-black pt-24 pb-20 px-4">
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
                    {toast}
                </div>
            )}

            <div className="container mx-auto max-w-4xl">
                {/* Profile header */}
                <div className="flex items-center gap-5 mb-8 p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-900/50 border-2 border-purple-500/40 overflow-hidden flex items-center justify-center shrink-0">
                        {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">@{profile.username}</h1>
                        <p className="text-gray-500 text-sm truncate">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-600">{escritas.length > 0 ? escritas.length + ' escritas' : ''}</span>
                        </div>
                    </div>
                    <button onClick={() => { signOut(); router.push('/') }}
                        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-lg hover:bg-red-900/10 shrink-0">
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sair</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 overflow-x-auto scrollbar-hide">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ' +
                                (tab === key ? 'bg-purple-900/40 text-purple-300' : 'text-gray-500 hover:text-white')}>
                            <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                    ))}
                </div>

                {/* Tab: Salvos */}
                {tab === 'salvos' && (
                    <div>
                        <div className="flex flex-wrap gap-2 mb-5">
                            <button onClick={() => setSelectedCollection(null)}
                                className={'px-4 py-1.5 rounded-full text-sm border transition-colors ' + (!selectedCollection ? 'bg-purple-900/40 border-purple-500/30 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white')}>
                                <FolderOpen className="w-3 h-3 inline mr-1.5" />Todos
                            </button>
                            {collections.map(col => (
                                <div key={col.id} className="flex items-center gap-1">
                                    <button onClick={() => setSelectedCollection(col.id === selectedCollection ? null : col.id)}
                                        className={'px-4 py-1.5 rounded-full text-sm border transition-colors ' + (selectedCollection === col.id ? 'bg-purple-900/40 border-purple-500/30 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white')}>
                                        {col.name}
                                    </button>
                                    <button onClick={() => handleDeleteCollection(col.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <input value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreateCollection()}
                                    placeholder="Nova pasta..." className="bg-black border border-white/10 rounded-full px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 w-32" />
                                <button onClick={handleCreateCollection} className="text-purple-400 hover:text-purple-300 transition-colors"><Plus className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredSaved.length === 0 && <p className="text-gray-500 text-sm col-span-2">Nenhum poema salvo ainda.</p>}
                            {filteredSaved.map(s => {
                                const post = getPostById(s.post_id); if (!post) return null
                                return (
                                    <div key={s.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-white/20 transition-colors">
                                        <div>
                                            <span className="text-xs text-purple-400">{post.category}</span>
                                            <Link href={'/post/' + post.slug} className="block text-white hover:text-purple-300 font-serif font-medium mt-1 transition-colors">{post.title}</Link>
                                            <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                                        </div>
                                        <button onClick={() => handleUnsave(s.post_id)} className="text-gray-600 hover:text-red-400 transition-colors shrink-0 mt-1"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Tab: Curtidos */}
                {tab === 'curtidos' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {likedPostIds.length === 0 && <p className="text-gray-500 text-sm">Nenhum poema curtido ainda.</p>}
                        {likedPostIds.map(id => {
                            const post = getPostById(id); if (!post) return null
                            return (
                                <div key={id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                                    <span className="text-xs text-purple-400">{post.category}</span>
                                    <Link href={'/post/' + post.slug} className="block text-white hover:text-purple-300 font-serif font-medium mt-1 transition-colors">{post.title}</Link>
                                    <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Tab: Minhas Escritas */}
                {tab === 'escritas' && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-gray-500 text-sm">{escritas.length} escrita(s)</p>
                            <Link href="/escritas-livres/nova" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                <Plus className="w-4 h-4" /> Nova escrita
                            </Link>
                        </div>
                        {escritas.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">
                                <PenLine className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                <p className="text-sm mb-4">Você ainda não enviou nenhuma escrita.</p>
                                <Link href="/escritas-livres/nova" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">Escrever agora</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {escritas.map(e => (
                                    <div key={e.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3 hover:border-white/20 transition-colors">
                                        {e.image_url && <img src={e.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-xs text-purple-400 capitalize">{e.category}</span>
                                                <span className={'text-xs font-medium ' + statusColor(e.status)}>{statusLabel(e.status)}</span>
                                            </div>
                                            <Link href={'/escritas-livres/' + e.id} className="text-white hover:text-purple-300 font-serif font-medium transition-colors block truncate">{e.title}</Link>
                                            <p className="text-xs text-gray-600 mt-1">{format(new Date(e.created_at), 'dd MMM yyyy', { locale: ptBR })} · {e.likes || 0} curtidas · {e.views || 0} views</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 shrink-0 mt-1" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Meus Posts */}
                {tab === 'posts' && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-gray-500 text-sm">{feedPosts.length} post(s)</p>
                            <Link href="/comunidade" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                <Plus className="w-4 h-4" /> Novo post
                            </Link>
                        </div>
                        {feedPosts.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">
                                <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                <p className="text-sm mb-4">Você ainda não publicou nada na comunidade.</p>
                                <Link href="/comunidade" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">Ir para comunidade</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {feedPosts.map(p => (
                                    <div key={p.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                                        {p.image_url && <img src={p.image_url} alt="" className="w-full max-h-40 object-cover rounded-lg mb-3" />}
                                        <p className="text-gray-200 text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">{p.content}</p>
                                        <p className="text-xs text-gray-600 mt-2">{format(new Date(p.created_at), 'dd MMM yyyy, HH:mm', { locale: ptBR })} · {p.likes || 0} curtidas</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Meus Comentários */}
                {tab === 'comentarios' && (
                    <div>
                        <p className="text-gray-500 text-sm mb-5">{comentarios.length} comentário(s)</p>
                        {comentarios.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">
                                <MessageCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Você ainda não fez nenhum comentário.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {comentarios.map(c => (
                                    <div key={c.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                                        <p className="text-gray-200 text-sm leading-relaxed line-clamp-3">{c.content}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <p className="text-xs text-gray-600">{format(new Date(c.created_at), 'dd MMM yyyy', { locale: ptBR })}</p>
                                            <span className="text-xs text-gray-700">·</span>
                                            <span className="text-xs text-gray-600">{c.likes || 0} curtidas</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Feedbacks */}
                {tab === 'feedbacks' && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-gray-500 text-sm">{feedbacks.length} feedback(s)</p>
                            <Link href="/feedback" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                <Plus className="w-4 h-4" /> Novo feedback
                            </Link>
                        </div>
                        {feedbacks.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">
                                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                <p className="text-sm mb-4">Você ainda não enviou nenhum feedback.</p>
                                <Link href="/feedback" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">Enviar feedback</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {feedbacks.map(f => (
                                    <div key={f.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="text-xs text-gray-500">{feedbackTypeLabel(f.type)}</span>
                                            <span className={'text-xs px-2 py-0.5 rounded-full ' + (f.status === 'resolved' ? 'bg-green-900/30 text-green-400' : f.status === 'in_progress' ? 'bg-blue-900/30 text-blue-400' : 'bg-white/5 text-gray-500')}>
                                                {f.status === 'resolved' ? 'Resolvido' : f.status === 'in_progress' ? 'Em análise' : 'Pendente'}
                                            </span>
                                        </div>
                                        <p className="text-white text-sm font-medium">{f.title}</p>
                                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{f.content}</p>
                                        <p className="text-xs text-gray-600 mt-2">{format(new Date(f.created_at), 'dd MMM yyyy', { locale: ptBR })}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Configurações */}
                {tab === 'configuracoes' && (
                    <div className="max-w-md space-y-4">
                        {/* Perfil */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-medium text-gray-300">Perfil</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-purple-900/50 border-2 border-purple-500/30 overflow-hidden flex items-center justify-center">
                                    {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-purple-400" />}
                                </div>
                                <label className="cursor-pointer flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                    <Camera className="w-4 h-4" /> Trocar foto
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nome de usuário</label>
                                <input value={username} onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                            </div>
                            <button onClick={handleSaveProfile} disabled={saving}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                <Save className="w-4 h-4" />{saving ? 'Salvando...' : 'Salvar perfil'}
                            </button>
                        </div>

                        {/* Email */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-medium text-gray-300">Alterar email</h3>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email atual</label>
                                <input value={user.email || ''} disabled className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Novo email</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="novo@email.com"
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                            </div>
                            <button onClick={async () => {
                                if (!newEmail) return; setSaving(true)
                                const { error } = await supabase.auth.updateUser({ email: newEmail })
                                if (error) showToast('Erro: ' + error.message)
                                else { showToast('Email atualizado!'); setNewEmail('') }
                                setSaving(false)
                            }} disabled={saving || !newEmail}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                <Save className="w-4 h-4" /> Atualizar email
                            </button>
                        </div>

                        {/* Senha */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-medium text-gray-300">Alterar senha</h3>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nova senha</label>
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="mínimo 6 caracteres"
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Confirmar nova senha</label>
                                <input type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="repita a senha"
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                            </div>
                            <button onClick={async () => {
                                if (newPassword.length < 6) return showToast('Senha deve ter ao menos 6 caracteres')
                                if (newPassword !== confirmPassword) return showToast('Senhas não coincidem')
                                setSaving(true)
                                const { error } = await supabase.auth.updateUser({ password: newPassword })
                                if (error) showToast('Erro: ' + error.message)
                                else { showToast('Senha atualizada!'); setNewPassword(''); setConfirmPassword('') }
                                setSaving(false)
                            }} disabled={saving || !newPassword || !confirmPassword}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                <Save className="w-4 h-4" /> Atualizar senha
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
