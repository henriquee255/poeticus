"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import {
    Hash, Users, Settings, ArrowLeft, Lock, Unlock, User, Crown, Shield,
    Trash2, Check, X, Upload, Send, Heart, MessageCircle, ChevronDown, ChevronUp,
    Smile, Image as ImageIcon, UserMinus, UserCheck, Globe
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const EMOJIS = ['😊','😂','❤️','🔥','😍','🥺','😭','✨','😎','🤔','💜','🌸','🌙','⭐','💫','🎉','👏','🙏','💪','😢']

type Tab = 'feed' | 'members' | 'settings'

interface Group {
    id: string; name: string; description?: string; member_count: number
    creator_id: string; image_url?: string; cover_url?: string; is_private?: boolean; created_at: string
    profiles?: { username: string; avatar_url?: string }
}

interface Member {
    group_id: string; user_id: string; role: string
    profiles: { id: string; username: string; avatar_url?: string; bio?: string }
}

interface JoinRequest {
    id: string; group_id: string; user_id: string; status: string; created_at: string
    profiles: { username: string; avatar_url?: string }
}

interface FeedPost {
    id: string; content: string; image_url?: string; likes: number
    created_at: string; user_id: string
    profiles: { username: string; avatar_url?: string }
}

interface Reply {
    id: string; content: string; created_at: string; user_id: string
    profiles: { username: string; avatar_url?: string }
}

function RoleBadge({ role }: { role: string }) {
    if (role === 'creator') return (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-yellow-900/30 border border-yellow-500/20 text-yellow-400 rounded-full">
            <Crown className="w-2.5 h-2.5" /> Criador
        </span>
    )
    if (role === 'moderator') return (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-purple-900/30 border border-purple-500/20 text-purple-300 rounded-full">
            <Shield className="w-2.5 h-2.5" /> Moderador
        </span>
    )
    return null
}

function PostCard({ post, currentUserId, currentProfile, groupId, onDelete }: {
    post: FeedPost; currentUserId?: string; currentProfile?: any; groupId: string; onDelete: (id: string) => void
}) {
    const [liked, setLiked] = useState(
        typeof window !== 'undefined' ? localStorage.getItem('feed_liked_' + post.id) === 'true' : false
    )
    const [likes, setLikes] = useState(post.likes || 0)
    const [showReplies, setShowReplies] = useState(false)
    const [replies, setReplies] = useState<Reply[]>([])
    const [replyText, setReplyText] = useState('')
    const [replyCount, setReplyCount] = useState(0)
    const [loading, setLoading] = useState(false)

    const handleLike = async () => {
        if (!currentUserId) return
        const res = await fetch('/api/feed/' + post.id, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUserId })
        })
        const data = await res.json()
        setLiked(data.liked); setLikes(data.likes)
        localStorage.setItem('feed_liked_' + post.id, data.liked ? 'true' : 'false')
    }

    const toggleReplies = async () => {
        if (!showReplies && replies.length === 0) {
            setLoading(true)
            const res = await fetch('/api/feed/' + post.id + '/replies')
            const data = await res.json()
            const arr = Array.isArray(data) ? data : []
            setReplies(arr); setReplyCount(arr.length); setLoading(false)
        }
        setShowReplies(p => !p)
    }

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyText.trim() || !currentUserId) return
        const res = await fetch('/api/feed/' + post.id + '/replies', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUserId, content: replyText.trim() })
        })
        const data = await res.json()
        if (data.id) {
            setReplies(prev => [...prev, { ...data, profiles: currentProfile }])
            setReplyCount(c => c + 1); setReplyText('')
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/15 transition-all">
            <div className="p-4 sm:p-5">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 overflow-hidden flex items-center justify-center shrink-0">
                        {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <span className="text-sm font-semibold text-white">@{post.profiles?.username || 'anônimo'}</span>
                                <p className="text-[11px] text-gray-600">{format(new Date(post.created_at), 'dd MMM yyyy, HH:mm', { locale: ptBR })}</p>
                            </div>
                            {currentUserId === post.user_id && (
                                <button onClick={() => onDelete(post.id)} className="text-gray-700 hover:text-red-400 transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                            )}
                        </div>
                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
                    </div>
                </div>
                {post.image_url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 ml-[52px]">
                        <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" />
                    </div>
                )}
                <div className="flex items-center gap-5 mt-4 pl-[52px]">
                    <button onClick={handleLike} className={'flex items-center gap-1.5 text-xs transition-all ' + (liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400')}>
                        <Heart className={'w-4 h-4 ' + (liked ? 'fill-red-400' : '')} /><span>{likes}</span>
                    </button>
                    <button onClick={toggleReplies} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{replyCount > 0 ? replyCount : 'Responder'}</span>
                        {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {showReplies && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/5 bg-black/30 p-4 space-y-3">
                        {loading && <p className="text-xs text-gray-500 text-center py-2">Carregando...</p>}
                        {replies.map(r => (
                            <div key={r.id} className="flex gap-2">
                                <div className="w-7 h-7 rounded-full bg-purple-900/30 overflow-hidden flex items-center justify-center shrink-0">
                                    {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-purple-400" />}
                                </div>
                                <div className="flex-1 bg-white/[0.04] rounded-xl px-3 py-2">
                                    <span className="text-xs font-medium text-purple-400">@{r.profiles?.username}</span>
                                    <span className="text-xs text-gray-700 ml-2">{format(new Date(r.created_at), 'dd MMM', { locale: ptBR })}</span>
                                    <p className="text-xs text-gray-300 mt-0.5">{r.content}</p>
                                </div>
                            </div>
                        ))}
                        {currentUserId && (
                            <form onSubmit={handleReply} className="flex gap-2">
                                <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Responder..."
                                    className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500" maxLength={500} />
                                <button type="submit" disabled={!replyText.trim()} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white px-3 py-2 rounded-xl"><Send className="w-3 h-3" /></button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default function GroupPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const { user, profile } = useAuth()
    const [tab, setTab] = useState<Tab>('feed')
    const [group, setGroup] = useState<Group | null>(null)
    const [groupError, setGroupError] = useState(false)
    const [myRole, setMyRole] = useState<string | null>(null)
    const [isMember, setIsMember] = useState(false)
    const [isRequested, setIsRequested] = useState(false)
    const [members, setMembers] = useState<Member[]>([])
    const [membersLoaded, setMembersLoaded] = useState(false)
    const [requests, setRequests] = useState<JoinRequest[]>([])
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [loadingFeed, setLoadingFeed] = useState(true)
    const [text, setText] = useState('')
    const [posting, setPosting] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Settings form
    const [editName, setEditName] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [editPrivate, setEditPrivate] = useState(false)
    const [editImageFile, setEditImageFile] = useState<File | null>(null)
    const [editImagePreview, setEditImagePreview] = useState('')
    const [editCoverFile, setEditCoverFile] = useState<File | null>(null)
    const [editCoverPreview, setEditCoverPreview] = useState('')
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')
    const editImgRef = useRef<HTMLInputElement>(null)
    const editCoverRef = useRef<HTMLInputElement>(null)

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    // Load group data
    useEffect(() => {
        fetch(`/api/groups/${id}`).then(r => r.json()).then(data => {
            if (data?.id) {
                setGroup(data)
                setEditName(data.name)
                setEditDesc(data.description || '')
                setEditPrivate(data.is_private || false)
                setEditImagePreview(data.image_url || '')
                setEditCoverPreview(data.cover_url || '')
            } else {
                setGroupError(true)
            }
        }).catch(() => setGroupError(true))
    }, [id])

    // Check membership from API (more reliable than localStorage)
    useEffect(() => {
        if (!user || !group) return
        // Creator is always a member - skip API call
        if (user.id === group.creator_id) {
            setIsMember(true)
            setMyRole('creator')
            return
        }
        fetch(`/api/groups/${id}/members`).then(r => r.json()).then(data => {
            if (Array.isArray(data)) {
                setMembers(data)
                setMembersLoaded(true)
                const me = data.find((m: Member) => m.user_id === user.id)
                if (me) {
                    setIsMember(true)
                    setMyRole(me.role)
                    localStorage.setItem(`group_member_${id}_${user.id}`, 'true')
                } else {
                    const requested = localStorage.getItem(`group_requested_${id}_${user.id}`) === 'true'
                    setIsRequested(requested)
                }
            }
        })
    }, [id, user, group])

    useEffect(() => {
        if (!group) return
        // Load feed
        setLoadingFeed(true)
        fetch(`/api/feed?group_id=${id}`).then(r => r.json()).then(data => {
            setPosts(Array.isArray(data) ? data : [])
            setLoadingFeed(false)
        })
    }, [group, id])

    useEffect(() => {
        if (tab === 'members' && !membersLoaded) {
            fetch(`/api/groups/${id}/members`).then(r => r.json()).then(data => {
                if (Array.isArray(data)) { setMembers(data); setMembersLoaded(true) }
            })
        }
        if (tab === 'settings' && (myRole === 'creator' || myRole === 'moderator')) {
            fetch(`/api/groups/${id}/requests`).then(r => r.json()).then(data => {
                setRequests(Array.isArray(data) ? data : [])
            })
        }
    }, [tab, id])

    const handleJoin = async () => {
        if (!user || !group) return
        if (isRequested) return
        const res = await fetch(`/api/groups/${id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id })
        })
        const data = await res.json()
        if (data.requested) {
            setIsRequested(true)
            localStorage.setItem(`group_requested_${id}_${user.id}`, 'true')
            showToast('Solicitação enviada!')
        } else if (data.member) {
            setIsMember(true); setMyRole('member')
            localStorage.setItem(`group_member_${id}_${user.id}`, 'true')
            setGroup(g => g ? { ...g, member_count: data.member_count } : g)
            showToast('Você entrou no grupo!')
        }
    }

    const handleLeave = async () => {
        if (!user) return
        const res = await fetch(`/api/groups/${id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id })
        })
        const data = await res.json()
        if (!data.member) {
            setIsMember(false); setMyRole(null)
            localStorage.setItem(`group_member_${id}_${user.id}`, 'false')
            setGroup(g => g ? { ...g, member_count: data.member_count } : g)
        }
    }

    const handleChangeRole = async (targetUserId: string, role: string) => {
        if (!user) return
        await fetch(`/api/groups/${id}/members`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_id: user.id, target_user_id: targetUserId, role })
        })
        setMembers(prev => prev.map(m => m.user_id === targetUserId ? { ...m, role } : m))
        showToast('Cargo atualizado!')
    }

    const handleRemoveMember = async (targetUserId: string) => {
        if (!user) return
        await fetch(`/api/groups/${id}/members?admin_id=${user.id}&target_user_id=${targetUserId}`, { method: 'DELETE' })
        setMembers(prev => prev.filter(m => m.user_id !== targetUserId))
        setGroup(g => g ? { ...g, member_count: Math.max(0, (g.member_count || 1) - 1) } : g)
        showToast('Membro removido')
    }

    const handleRequest = async (reqId: string, action: 'approve' | 'reject') => {
        if (!user) return
        await fetch(`/api/groups/${id}/requests`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: reqId, action, admin_id: user.id })
        })
        setRequests(prev => prev.filter(r => r.id !== reqId))
        if (action === 'approve') setGroup(g => g ? { ...g, member_count: (g.member_count || 0) + 1 } : g)
        showToast(action === 'approve' ? 'Aprovado!' : 'Rejeitado')
    }

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !group) return
        setSaving(true)

        let image_url = group.image_url || ''
        let cover_url = group.cover_url || ''

        if (editImageFile) {
            const form = new FormData()
            form.append('file', editImageFile); form.append('group_id', id); form.append('type', 'image')
            const r = await fetch('/api/upload/group', { method: 'POST', body: form })
            const d = await r.json()
            if (d.url) image_url = d.url
        }
        if (editCoverFile) {
            const form = new FormData()
            form.append('file', editCoverFile); form.append('group_id', id + '_cover'); form.append('type', 'cover')
            const r = await fetch('/api/upload/group', { method: 'POST', body: form })
            const d = await r.json()
            if (d.url) cover_url = d.url
        }

        await fetch(`/api/groups/${id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ update: { name: editName, description: editDesc, is_private: editPrivate, image_url, cover_url } })
        })
        setGroup(g => g ? { ...g, name: editName, description: editDesc, is_private: editPrivate, image_url, cover_url } : g)
        setSaving(false)
        showToast('Grupo atualizado!')
    }

    const handleDeleteGroup = async () => {
        if (!user || myRole !== 'creator') return
        if (!confirm('Excluir este grupo permanentemente?')) return
        await fetch(`/api/groups/${id}`, { method: 'DELETE' })
        router.push('/comunidade')
    }

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim() || !user) return
        setPosting(true)
        let image_url = ''
        if (imageFile) {
            const form = new FormData()
            form.append('file', imageFile); form.append('user_id', user.id)
            const r = await fetch('/api/upload', { method: 'POST', body: form })
            const d = await r.json()
            if (d.url) image_url = d.url
        }
        const res = await fetch('/api/feed', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, content: text.trim(), image_url: image_url || undefined, group_id: id })
        })
        const data = await res.json()
        if (data.id) {
            setPosts(prev => [{ ...data, profiles: { username: profile?.username || 'você', avatar_url: profile?.avatar_url } }, ...prev])
            setText(''); setImageFile(null); setImagePreview('')
        }
        setPosting(false)
    }

    const handleDeletePost = async (postId: string) => {
        await fetch('/api/feed/' + postId, { method: 'DELETE' })
        setPosts(prev => prev.filter(p => p.id !== postId))
    }

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'cover') => {
        const file = e.target.files?.[0]; if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            if (type === 'image') { setEditImageFile(file); setEditImagePreview(reader.result as string) }
            else { setEditCoverFile(file); setEditCoverPreview(reader.result as string) }
        }
        reader.readAsDataURL(file)
    }

    const handlePostImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const canManage = myRole === 'creator' || myRole === 'moderator'

    if (groupError) return (
        <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4 px-4">
            <Hash className="w-10 h-10 text-gray-700" />
            <p className="text-gray-500 text-sm">Grupo não encontrado.</p>
            <Link href="/comunidade" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">← Voltar à comunidade</Link>
        </div>
    )

    if (!group) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-black">
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
                    {toast}
                </div>
            )}

            {/* Cover */}
            <div className="relative">
                {group.cover_url
                    ? <div className="w-full h-40 md:h-56 overflow-hidden"><img src={group.cover_url} alt="" className="w-full h-full object-cover" /></div>
                    : <div className="w-full h-24 md:h-32 bg-gradient-to-br from-purple-900/40 to-indigo-900/40" />
                }
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent" />
            </div>

            <div className="max-w-4xl mx-auto px-4">
                {/* Group header */}
                <div className="flex items-end gap-4 -mt-10 pb-6 relative z-10">
                    <div className="w-20 h-20 rounded-2xl border-4 border-black bg-gradient-to-br from-purple-900/80 to-indigo-900/80 overflow-hidden flex items-center justify-center shrink-0 shadow-xl">
                        {group.image_url ? <img src={group.image_url} alt="" className="w-full h-full object-cover" /> : <Hash className="w-8 h-8 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold text-white font-serif">{group.name}</h1>
                            {group.is_private && <Lock className="w-4 h-4 text-amber-400/70" />}
                        </div>
                        {group.description && <p className="text-sm text-gray-400 mt-0.5">{group.description}</p>}
                        <p className="text-xs text-gray-600 mt-1">{group.member_count} membros · criado {format(new Date(group.created_at), 'MMM yyyy', { locale: ptBR })}</p>
                    </div>
                    <div className="flex items-center gap-2 pb-1 shrink-0 flex-wrap">
                        <Link href="/comunidade" className="flex items-center gap-1.5 text-xs px-3 py-2 border border-white/10 text-gray-400 hover:text-white rounded-xl transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" /> Comunidade
                        </Link>
                        {user && !isMember && !isRequested && (
                            <button onClick={handleJoin}
                                className="text-sm px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center gap-1.5">
                                {group.is_private ? <><Lock className="w-3.5 h-3.5" /> Pedir entrada</> : <><Users className="w-3.5 h-3.5" /> Entrar</>}
                            </button>
                        )}
                        {user && isRequested && !isMember && (
                            <span className="text-xs px-4 py-2 border border-amber-500/20 text-amber-400/70 rounded-xl flex items-center gap-1.5">
                                <Lock className="w-3 h-3" /> Aguardando aprovação
                            </span>
                        )}
                        {user && isMember && myRole !== 'creator' && (
                            <button onClick={handleLeave} className="text-xs px-4 py-2 border border-white/10 text-gray-400 hover:text-red-400 rounded-xl transition-colors">
                                Sair do grupo
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 w-fit mb-6">
                    {([
                        { key: 'feed', label: 'Feed', icon: Globe },
                        { key: 'members', label: `Membros (${group.member_count})`, icon: Users },
                        ...(canManage ? [{ key: 'settings', label: 'Configurações', icon: Settings }] : [])
                    ] as { key: Tab; label: string; icon: any }[]).map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                            <t.icon className="w-3.5 h-3.5" />{t.label}
                        </button>
                    ))}
                </div>

                {/* TAB: FEED */}
                {tab === 'feed' && (
                    <div className="space-y-4 pb-16">
                        {user && (isMember || !group.is_private) && (
                            <div className="bg-zinc-900/80 border border-white/[0.07] rounded-2xl p-5">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 overflow-hidden flex items-center justify-center shrink-0">
                                        {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-purple-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <textarea value={text} onChange={e => setText(e.target.value)}
                                            placeholder={`Publicar em #${group.name}...`}
                                            className="w-full bg-transparent text-white placeholder:text-gray-600 text-sm focus:outline-none resize-none"
                                            rows={3} maxLength={500} />
                                        {imagePreview && (
                                            <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 w-fit">
                                                <img src={imagePreview} alt="" className="max-h-36 object-cover rounded-xl" />
                                                <button onClick={() => { setImageFile(null); setImagePreview('') }}
                                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-1">
                                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                                    className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors">
                                                    <ImageIcon className="w-4 h-4" />
                                                </button>
                                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePostImgChange} className="hidden" />
                                                <span className="text-xs text-gray-700">{text.length}/500</span>
                                            </div>
                                            <button onClick={handlePost} disabled={!text.trim() || posting}
                                                className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white text-sm font-medium rounded-xl transition-colors">
                                                <Send className="w-3.5 h-3.5" />{posting ? 'Publicando...' : 'Publicar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!user && group.is_private && (
                            <div className="bg-zinc-900/50 border border-amber-500/10 rounded-2xl p-6 text-center">
                                <Lock className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Este é um grupo fechado. Entre para ver as publicações.</p>
                            </div>
                        )}
                        {loadingFeed && [1,2,3].map(i => (
                            <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 animate-pulse h-24" />
                        ))}
                        {!loadingFeed && posts.length === 0 && (
                            <div className="text-center py-16 text-gray-600">
                                <Hash className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Nenhuma publicação ainda. Seja o primeiro!</p>
                            </div>
                        )}
                        <div className="space-y-3">
                            {posts.map(p => <PostCard key={p.id} post={p} currentUserId={user?.id} currentProfile={profile} groupId={id} onDelete={handleDeletePost} />)}
                        </div>
                    </div>
                )}

                {/* TAB: MEMBERS */}
                {tab === 'members' && (
                    <div className="space-y-2 pb-16">
                        {!membersLoaded && (
                            <div className="text-center py-16 text-gray-600">
                                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-sm">Carregando membros...</p>
                            </div>
                        )}
                        {membersLoaded && members.length === 0 && (
                            <div className="text-center py-16 text-gray-600">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Nenhum membro ainda.</p>
                            </div>
                        )}
                        {members.map(m => (
                            <motion.div key={m.user_id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                                <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0">
                                    {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-purple-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-white">@{m.profiles?.username || 'anônimo'}</span>
                                        <RoleBadge role={m.role} />
                                    </div>
                                    {m.profiles?.bio && <p className="text-xs text-gray-600 truncate">{m.profiles.bio}</p>}
                                </div>
                                {canManage && m.user_id !== user?.id && m.role !== 'creator' && (
                                    <div className="flex items-center gap-1 shrink-0">
                                        {myRole === 'creator' && (
                                            <button
                                                onClick={() => handleChangeRole(m.user_id, m.role === 'moderator' ? 'member' : 'moderator')}
                                                className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${m.role === 'moderator' ? 'border-purple-500/30 text-purple-300 hover:border-red-500/30 hover:text-red-400' : 'border-white/10 text-gray-500 hover:border-purple-500/30 hover:text-purple-300'}`}
                                                title={m.role === 'moderator' ? 'Rebaixar' : 'Promover a Moderador'}>
                                                {m.role === 'moderator' ? <Shield className="w-3 h-3" /> : <Shield className="w-3 h-3 opacity-40" />}
                                            </button>
                                        )}
                                        <button onClick={() => handleRemoveMember(m.user_id)}
                                            className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-900/10"
                                            title="Remover do grupo">
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* TAB: SETTINGS */}
                {tab === 'settings' && canManage && (
                    <div className="space-y-6 pb-16 max-w-xl">
                        {/* Pending requests */}
                        {requests.length > 0 && (
                            <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-amber-500/10 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-semibold text-amber-300">Solicitações pendentes ({requests.length})</span>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {requests.map(req => (
                                        <div key={req.id} className="flex items-center gap-3 px-4 py-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-900/40 overflow-hidden flex items-center justify-center shrink-0">
                                                {req.profiles?.avatar_url ? <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-purple-400" />}
                                            </div>
                                            <span className="text-sm text-white flex-1">@{req.profiles?.username}</span>
                                            <span className="text-xs text-gray-600">{format(new Date(req.created_at), 'dd MMM', { locale: ptBR })}</span>
                                            <div className="flex gap-1.5">
                                                <button onClick={() => handleRequest(req.id, 'approve')}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-green-900/20 border border-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-900/40 transition-colors">
                                                    <Check className="w-3 h-3" /> Aprovar
                                                </button>
                                                <button onClick={() => handleRequest(req.id, 'reject')}
                                                    className="p-1.5 text-gray-600 hover:text-red-400 border border-white/10 rounded-lg transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Edit group */}
                        <form onSubmit={handleSaveSettings} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/5">
                                <h3 className="font-semibold text-white">Configurações do grupo</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* Cover */}
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Imagem de capa</label>
                                    <div onClick={() => editCoverRef.current?.click()}
                                        className="relative w-full h-28 rounded-xl border border-dashed border-white/10 overflow-hidden cursor-pointer hover:border-purple-500/30 transition-colors bg-white/[0.02]">
                                        {editCoverPreview
                                            ? <img src={editCoverPreview} alt="" className="w-full h-full object-cover" />
                                            : <div className="flex flex-col items-center justify-center h-full gap-1">
                                                <Upload className="w-5 h-5 text-gray-600" />
                                                <span className="text-xs text-gray-600">Clique para alterar</span>
                                            </div>
                                        }
                                        <input ref={editCoverRef} type="file" accept="image/*" onChange={e => handleEditFileChange(e, 'cover')} className="hidden" />
                                    </div>
                                </div>

                                {/* Avatar + Name */}
                                <div className="flex items-start gap-3">
                                    <div onClick={() => editImgRef.current?.click()}
                                        className="w-16 h-16 rounded-2xl border border-dashed border-white/10 overflow-hidden cursor-pointer hover:border-purple-500/30 transition-colors bg-white/[0.02] flex items-center justify-center shrink-0">
                                        {editImagePreview
                                            ? <img src={editImagePreview} alt="" className="w-full h-full object-cover" />
                                            : <Hash className="w-5 h-5 text-gray-600" />
                                        }
                                        <input ref={editImgRef} type="file" accept="image/*" onChange={e => handleEditFileChange(e, 'image')} className="hidden" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nome do grupo" maxLength={40}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-600" />
                                        <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descrição" maxLength={120}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-600" />
                                    </div>
                                </div>

                                {/* Privacy */}
                                <button type="button" onClick={() => setEditPrivate(p => !p)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${editPrivate ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                                    {editPrivate ? <Lock className="w-4 h-4 shrink-0" /> : <Unlock className="w-4 h-4 shrink-0" />}
                                    <div className="text-left flex-1">
                                        <p className="text-sm font-medium">{editPrivate ? 'Grupo fechado' : 'Grupo aberto'}</p>
                                        <p className="text-xs opacity-60">{editPrivate ? 'Entrada por aprovação' : 'Qualquer um pode entrar'}</p>
                                    </div>
                                    <div className={`w-9 h-5 rounded-full transition-all ${editPrivate ? 'bg-amber-500' : 'bg-white/10'} relative shrink-0`}>
                                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${editPrivate ? 'left-4' : 'left-0.5'}`} />
                                    </div>
                                </button>

                                <button type="submit" disabled={saving || !editName.trim()}
                                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors">
                                    {saving ? 'Salvando...' : 'Salvar alterações'}
                                </button>
                            </div>
                        </form>

                        {/* Danger zone */}
                        {myRole === 'creator' && (
                            <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-5">
                                <h4 className="text-sm font-semibold text-red-400 mb-3">Zona de perigo</h4>
                                <button onClick={handleDeleteGroup}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500/20 text-red-400 text-sm rounded-xl hover:bg-red-900/40 transition-colors">
                                    <Trash2 className="w-4 h-4" /> Excluir grupo permanentemente
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
