"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import {
    Heart, MessageCircle, Trash2, Send, User, ChevronDown, ChevronUp,
    Image as ImageIcon, Smile, X, Users, Plus, Hash, Globe, Search,
    ChevronRight, Sparkles, Lock, Unlock, Upload, Crown, Shield
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const EMOJIS = ['😊','😂','❤️','🔥','😍','🥺','😭','✨','😎','🤔','💜','🌸','🌙','⭐','💫','🎉','👏','🙏','💪','😢','😅','🤣','😌','💕','🌹','🦋','🌊','☀️','🌈','💭','📖','🖤','😴','🥰','💔','😤','🤯','🫶','💖','🌺','✍️','🎶','🌿','🍃','💧','🪐','🌌','🦄','🐾','🫠']

function EmojiPicker({ onPick, onClose, up }: { onPick: (e: string) => void; onClose: () => void; up?: boolean }) {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])
    return (
        <div ref={ref} className={`absolute ${up ? 'bottom-10' : 'top-10'} left-0 z-50 bg-zinc-900 border border-white/10 rounded-2xl p-3 shadow-xl w-64`}>
            <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map(e => (
                    <button key={e} onClick={() => onPick(e)} className="text-lg hover:bg-white/10 rounded-lg p-1 transition-colors">{e}</button>
                ))}
            </div>
        </div>
    )
}

interface Group {
    id: string
    name: string
    description?: string
    member_count: number
    creator_id: string
    image_url?: string
    cover_url?: string
    is_private?: boolean
    created_at: string
}

interface Reply {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles: { username: string; avatar_url?: string }
}

interface FeedPost {
    id: string
    content: string
    image_url?: string
    likes: number
    created_at: string
    user_id: string
    group_id?: string
    profiles: { username: string; avatar_url?: string }
    feed_groups?: { name: string }
}

function GroupAvatar({ group, size = 9 }: { group: Group; size?: number }) {
    const s = `w-${size} h-${size}`
    return (
        <div className={`${s} rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0`}>
            {group.image_url
                ? <img src={group.image_url} alt="" className="w-full h-full object-cover" />
                : <Hash className="w-4 h-4 text-purple-400" />
            }
        </div>
    )
}

function PostCard({ post, currentUserId, currentProfile, onDelete }: {
    post: FeedPost; currentUserId?: string; currentProfile?: any; onDelete: (id: string) => void
}) {
    const [liked, setLiked] = useState(
        typeof window !== 'undefined' ? localStorage.getItem('feed_liked_' + post.id) === 'true' : false
    )
    const [likes, setLikes] = useState(post.likes || 0)
    const [showReplies, setShowReplies] = useState(false)
    const [replies, setReplies] = useState<Reply[]>([])
    const [replyText, setReplyText] = useState('')
    const [loadingReplies, setLoadingReplies] = useState(false)
    const [replyCount, setReplyCount] = useState(0)
    const [showEmojiReply, setShowEmojiReply] = useState(false)

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
            setLoadingReplies(true)
            const res = await fetch('/api/feed/' + post.id + '/replies')
            const data = await res.json()
            const arr = Array.isArray(data) ? data : []
            setReplies(arr); setReplyCount(arr.length); setLoadingReplies(false)
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
            setReplies(prev => [...prev, { ...data, profiles: { username: currentProfile?.username || 'você', avatar_url: currentProfile?.avatar_url } }])
            setReplyCount(c => c + 1); setReplyText(''); setShowReplies(true)
        }
    }

    const handleDeleteReply = async (replyId: string) => {
        await fetch('/api/feed/' + post.id + '/replies?reply_id=' + replyId, { method: 'DELETE' })
        setReplies(prev => prev.filter(r => r.id !== replyId)); setReplyCount(c => c - 1)
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/15 transition-all">
            <div className="p-4 sm:p-5">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 overflow-hidden flex items-center justify-center shrink-0">
                        {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1.5">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-white">@{post.profiles?.username || 'anônimo'}</span>
                                    {post.feed_groups?.name && (
                                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-purple-900/30 border border-purple-500/20 text-purple-300 rounded-full">
                                            <Hash className="w-2.5 h-2.5" />{post.feed_groups.name}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-gray-600">{format(new Date(post.created_at), 'dd MMM yyyy, HH:mm', { locale: ptBR })}</span>
                            </div>
                            {currentUserId === post.user_id && (
                                <button onClick={() => onDelete(post.id)} className="text-gray-700 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-900/10 mt-0.5">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
                    <button onClick={handleLike}
                        className={'flex items-center gap-1.5 text-xs transition-all ' + (liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400') + (!currentUserId ? ' cursor-default' : '')}>
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
                        className="border-t border-white/5 bg-black/30">
                        <div className="p-4 space-y-3">
                            {loadingReplies && <p className="text-xs text-gray-500 text-center py-2">Carregando...</p>}
                            {replies.map(r => (
                                <div key={r.id} className="flex gap-2">
                                    <div className="w-7 h-7 rounded-full bg-purple-900/30 border border-purple-500/10 overflow-hidden flex items-center justify-center shrink-0">
                                        {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-purple-400" />}
                                    </div>
                                    <div className="flex-1 bg-white/[0.04] rounded-xl px-3 py-2">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-medium text-purple-400">@{r.profiles?.username || 'anônimo'}</span>
                                            <span className="text-xs text-gray-700">{format(new Date(r.created_at), 'dd MMM', { locale: ptBR })}</span>
                                            {currentUserId === r.user_id && (
                                                <button onClick={() => handleDeleteReply(r.id)} className="ml-auto text-gray-700 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-300 break-words">{r.content}</p>
                                    </div>
                                </div>
                            ))}
                            {currentUserId && (
                                <form onSubmit={handleReply} className="flex gap-2">
                                    <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Escreva uma resposta..."
                                        className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors" maxLength={500} />
                                    <div className="relative">
                                        <button type="button" onClick={() => setShowEmojiReply(p => !p)} className="h-full px-2 text-gray-500 hover:text-yellow-400 transition-colors">
                                            <Smile className="w-3.5 h-3.5" />
                                        </button>
                                        {showEmojiReply && <EmojiPicker onPick={e => { setReplyText(p => p + e); setShowEmojiReply(false) }} onClose={() => setShowEmojiReply(false)} up />}
                                    </div>
                                    <button type="submit" disabled={!replyText.trim()} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white px-3 py-2 rounded-xl transition-colors"><Send className="w-3 h-3" /></button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// Advanced group creation form
function CreateGroupForm({ userId, onCreated, onCancel }: {
    userId: string; onCreated: (g: Group) => void; onCancel: () => void
}) {
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [isPrivate, setIsPrivate] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState('')
    const [coverPreview, setCoverPreview] = useState('')
    const [creating, setCreating] = useState(false)
    const imgRef = useRef<HTMLInputElement>(null)
    const coverRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'cover') => {
        const file = e.target.files?.[0]; if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            if (type === 'image') { setImageFile(file); setImagePreview(reader.result as string) }
            else { setCoverFile(file); setCoverPreview(reader.result as string) }
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setCreating(true)

        let image_url = ''
        let cover_url = ''

        // Upload images (group_id is not known yet, use temp name)
        const tempId = Date.now().toString()
        if (imageFile) {
            const form = new FormData()
            form.append('file', imageFile); form.append('group_id', tempId); form.append('type', 'image')
            const r = await fetch('/api/upload/group', { method: 'POST', body: form })
            const d = await r.json()
            if (d.url) image_url = d.url
        }
        if (coverFile) {
            const form = new FormData()
            form.append('file', coverFile); form.append('group_id', tempId + '_cover'); form.append('type', 'cover')
            const r = await fetch('/api/upload/group', { method: 'POST', body: form })
            const d = await r.json()
            if (d.url) cover_url = d.url
        }

        const res = await fetch('/api/groups', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), description: desc.trim(), creator_id: userId, image_url: image_url || undefined, cover_url: cover_url || undefined, is_private: isPrivate })
        })
        const data = await res.json()
        if (data.id) onCreated(data)
        setCreating(false)
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Cover image */}
            <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Imagem de capa</label>
                <div
                    onClick={() => coverRef.current?.click()}
                    className="relative w-full h-24 rounded-xl border border-dashed border-white/10 overflow-hidden cursor-pointer hover:border-purple-500/30 transition-colors bg-white/[0.02]">
                    {coverPreview
                        ? <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                        : <div className="flex flex-col items-center justify-center h-full gap-1">
                            <Upload className="w-5 h-5 text-gray-600" />
                            <span className="text-xs text-gray-600">Capa do grupo</span>
                        </div>
                    }
                    <input ref={coverRef} type="file" accept="image/*" onChange={e => handleFileChange(e, 'cover')} className="hidden" />
                </div>
            </div>

            {/* Avatar image */}
            <div className="flex items-center gap-3">
                <div onClick={() => imgRef.current?.click()}
                    className="w-16 h-16 rounded-2xl border border-dashed border-white/10 overflow-hidden cursor-pointer hover:border-purple-500/30 transition-colors bg-white/[0.02] flex items-center justify-center shrink-0">
                    {imagePreview
                        ? <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                        : <div className="flex flex-col items-center gap-0.5">
                            <Hash className="w-5 h-5 text-gray-600" />
                            <span className="text-[10px] text-gray-700">Ícone</span>
                        </div>
                    }
                    <input ref={imgRef} type="file" accept="image/*" onChange={e => handleFileChange(e, 'image')} className="hidden" />
                </div>
                <div className="flex-1 space-y-2">
                    <input value={name} onChange={e => setName(e.target.value)}
                        placeholder="Nome do grupo" maxLength={40} required
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-600" />
                    <input value={desc} onChange={e => setDesc(e.target.value)}
                        placeholder="Descrição (opcional)" maxLength={120}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-600" />
                </div>
            </div>

            {/* Privacy toggle */}
            <button type="button" onClick={() => setIsPrivate(p => !p)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isPrivate ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                {isPrivate ? <Lock className="w-4 h-4 shrink-0" /> : <Unlock className="w-4 h-4 shrink-0" />}
                <div className="text-left flex-1">
                    <p className="text-sm font-medium">{isPrivate ? 'Grupo fechado' : 'Grupo aberto'}</p>
                    <p className="text-xs opacity-60">{isPrivate ? 'Entrada por aprovação do criador' : 'Qualquer um pode entrar'}</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-all ${isPrivate ? 'bg-amber-500' : 'bg-white/10'} relative shrink-0`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${isPrivate ? 'left-4' : 'left-0.5'}`} />
                </div>
            </button>

            <div className="flex gap-2">
                <button type="submit" disabled={!name.trim() || creating}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors">
                    {creating ? 'Criando...' : 'Criar grupo'}
                </button>
                <button type="button" onClick={onCancel}
                    className="px-4 py-2.5 border border-white/10 text-gray-400 text-sm rounded-xl hover:text-white transition-colors">
                    Cancelar
                </button>
            </div>
        </form>
    )
}

export default function ComunidadePage() {
    const { user, profile } = useAuth()
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState('')
    const [posting, setPosting] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState('')
    const [uploadingImg, setUploadingImg] = useState(false)
    const [showEmoji, setShowEmoji] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [groups, setGroups] = useState<Group[]>([])
    const [activeGroup, setActiveGroup] = useState<Group | null>(null)
    const [memberOf, setMemberOf] = useState<Set<string>>(new Set())
    const [requestedOf, setRequestedOf] = useState<Set<string>>(new Set())
    const [groupSearch, setGroupSearch] = useState('')
    const [showCreateGroup, setShowCreateGroup] = useState(false)
    const [postInGroup, setPostInGroup] = useState(false)

    const loadFeed = (groupId?: string | null) => {
        setLoading(true)
        const url = groupId ? `/api/feed?group_id=${groupId}` : '/api/feed'
        fetch(url).then(r => r.json()).then(data => {
            setPosts(Array.isArray(data) ? data : [])
            setLoading(false)
        })
    }

    const loadGroups = () => {
        fetch('/api/groups').then(r => r.json()).then(data => {
            if (Array.isArray(data)) {
                setGroups(data)
                if (user) {
                    const joined = new Set<string>(
                        data.filter((g: Group) =>
                            typeof window !== 'undefined' && localStorage.getItem(`group_member_${g.id}_${user.id}`) === 'true'
                        ).map((g: Group) => g.id)
                    )
                    const requested = new Set<string>(
                        data.filter((g: Group) =>
                            typeof window !== 'undefined' && localStorage.getItem(`group_requested_${g.id}_${user.id}`) === 'true'
                        ).map((g: Group) => g.id)
                    )
                    setMemberOf(joined)
                    setRequestedOf(requested)
                }
            }
        })
    }

    useEffect(() => { loadFeed(); loadGroups() }, [])

    const handleSelectGroup = (g: Group | null) => {
        setActiveGroup(g)
        loadFeed(g?.id)
        setPostInGroup(!!g)
    }

    const handleToggleMember = async (groupId: string, group: Group) => {
        if (!user) return
        const isMember = memberOf.has(groupId)
        if (isMember) {
            // Leave
            const res = await fetch(`/api/groups/${groupId}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            })
            const data = await res.json()
            const next = new Set(memberOf); next.delete(groupId); setMemberOf(next)
            localStorage.setItem(`group_member_${groupId}_${user.id}`, 'false')
            setGroups(prev => prev.map(g => g.id === groupId ? { ...g, member_count: data.member_count } : g))
        } else if (requestedOf.has(groupId)) {
            // Already requested — do nothing (show status)
            return
        } else {
            // Join or request
            const res = await fetch(`/api/groups/${groupId}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            })
            const data = await res.json()
            if (data.requested) {
                const next = new Set(requestedOf); next.add(groupId); setRequestedOf(next)
                localStorage.setItem(`group_requested_${groupId}_${user.id}`, 'true')
            } else if (data.member) {
                const next = new Set(memberOf); next.add(groupId); setMemberOf(next)
                localStorage.setItem(`group_member_${groupId}_${user.id}`, 'true')
                setGroups(prev => prev.map(g => g.id === groupId ? { ...g, member_count: data.member_count } : g))
            }
        }
    }

    const handleGroupCreated = (g: Group) => {
        setGroups(prev => [g, ...prev])
        const next = new Set(memberOf); next.add(g.id); setMemberOf(next)
        localStorage.setItem(`group_member_${g.id}_${user!.id}`, 'true')
        setShowCreateGroup(false)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim() || !user) return
        setPosting(true)
        let image_url = ''
        if (imageFile) {
            setUploadingImg(true)
            const form = new FormData()
            form.append('file', imageFile); form.append('user_id', user.id)
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
            const uploadData = await uploadRes.json()
            if (uploadData.url) image_url = uploadData.url
            setUploadingImg(false)
        }
        const body: any = { user_id: user.id, content: text.trim() }
        if (image_url) body.image_url = image_url
        if (postInGroup && activeGroup) body.group_id = activeGroup.id
        const res = await fetch('/api/feed', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        const data = await res.json()
        if (data.id) {
            setPosts(prev => [{
                ...data,
                profiles: { username: profile?.username || 'você', avatar_url: profile?.avatar_url },
                feed_groups: postInGroup && activeGroup ? { name: activeGroup.name } : undefined
            }, ...prev])
            setText(''); setImageFile(null); setImagePreview('')
        }
        setPosting(false)
    }

    const handleDelete = async (id: string) => {
        await fetch('/api/feed/' + id, { method: 'DELETE' })
        setPosts(prev => prev.filter(p => p.id !== id))
    }

    const filteredGroups = groups.filter(g =>
        groupSearch ? g.name.toLowerCase().includes(groupSearch.toLowerCase()) : true
    )

    const renderJoinButton = (g: Group, compact = false) => {
        const isMember = memberOf.has(g.id)
        const isRequested = requestedOf.has(g.id)
        if (isMember) return (
            <button onClick={ev => { ev.stopPropagation(); handleToggleMember(g.id, g) }}
                className={`text-[10px] px-2 py-1 rounded-lg border transition-all shrink-0 bg-purple-900/30 border-purple-500/30 text-purple-300 hover:bg-red-900/20 hover:border-red-500/20 hover:text-red-400`}>
                Sair
            </button>
        )
        if (isRequested) return (
            <span className="text-[10px] px-2 py-1 rounded-lg border border-amber-500/20 text-amber-400/70 shrink-0 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Pendente
            </span>
        )
        return (
            <button onClick={ev => { ev.stopPropagation(); handleToggleMember(g.id, g) }}
                className="text-[10px] px-2 py-1 rounded-lg border transition-all shrink-0 border-white/10 text-gray-600 hover:border-purple-500/30 hover:text-purple-300">
                {g.is_private ? <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5" />Pedir</span> : 'Entrar'}
            </button>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Mobile groups strip */}
            <div className="lg:hidden border-b border-white/5 bg-zinc-950/80 sticky top-0 z-30 backdrop-blur-md">
                <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                    <button onClick={() => handleSelectGroup(null)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all border ${!activeGroup ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                        <Globe className="w-3.5 h-3.5" /> Feed global
                    </button>
                    {groups.map(g => (
                        <button key={g.id} onClick={() => handleSelectGroup(g)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all border ${activeGroup?.id === g.id ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                            {g.image_url
                                ? <img src={g.image_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                                : <Hash className="w-3 h-3" />
                            }
                            {g.name}
                            {g.is_private && <Lock className="w-2.5 h-2.5 opacity-60" />}
                        </button>
                    ))}
                    {user && (
                        <button onClick={() => setShowCreateGroup(p => !p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 border border-dashed border-white/20 text-gray-500 hover:border-purple-500/40 hover:text-purple-400 transition-all">
                            <Plus className="w-3 h-3" /> Criar grupo
                        </button>
                    )}
                </div>
                <AnimatePresence>
                    {showCreateGroup && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5 overflow-hidden">
                            <CreateGroupForm userId={user!.id} onCreated={handleGroupCreated} onCancel={() => setShowCreateGroup(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
                <div className="flex gap-8">
                    {/* Left sidebar — desktop */}
                    <aside className="hidden lg:flex flex-col w-72 shrink-0">
                        <div className="sticky top-8 space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white font-serif mb-1">Comunidade</h1>
                                <p className="text-gray-600 text-sm">Compartilhe pensamentos e reflexões</p>
                            </div>

                            <button onClick={() => handleSelectGroup(null)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${!activeGroup ? 'bg-purple-600/20 border-purple-500/30 text-purple-300' : 'border-white/5 text-gray-400 hover:border-white/10 hover:text-white'}`}>
                                <Globe className="w-4 h-4 shrink-0" />
                                <span className="text-sm font-medium">Feed global</span>
                            </button>

                            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm font-semibold text-white">Grupos</span>
                                        <span className="text-xs text-gray-600">({groups.length})</span>
                                    </div>
                                    {user && (
                                        <button onClick={() => setShowCreateGroup(p => !p)}
                                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 hover:bg-purple-900/30 text-gray-400 hover:text-purple-300 transition-all">
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {showCreateGroup && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            className="border-b border-white/5 overflow-hidden">
                                            <CreateGroupForm userId={user!.id} onCreated={handleGroupCreated} onCancel={() => setShowCreateGroup(false)} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="px-3 pt-3 pb-1">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                        <input value={groupSearch} onChange={e => setGroupSearch(e.target.value)}
                                            placeholder="Buscar grupos..."
                                            className="w-full bg-white/[0.03] border border-white/[0.07] rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-700" />
                                    </div>
                                </div>

                                <div className="p-2 max-h-96 overflow-y-auto">
                                    {filteredGroups.length === 0 && (
                                        <p className="text-xs text-gray-600 text-center py-4">Nenhum grupo ainda</p>
                                    )}
                                    {filteredGroups.map(g => (
                                        <Link key={g.id} href={`/comunidade/grupos/${g.id}`}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors ${activeGroup?.id === g.id ? 'bg-purple-900/20' : ''}`}
                                            onClick={ev => { ev.preventDefault(); handleSelectGroup(g) }}>
                                            <GroupAvatar group={g} size={9} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-medium text-gray-200 truncate">{g.name}</p>
                                                    {g.is_private && <Lock className="w-3 h-3 text-amber-500/60 shrink-0" />}
                                                </div>
                                                <p className="text-[11px] text-gray-600">{g.member_count} {g.member_count === 1 ? 'membro' : 'membros'}</p>
                                            </div>
                                            {user && renderJoinButton(g)}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/10 rounded-2xl p-4">
                                <Sparkles className="w-5 h-5 text-purple-400 mb-2" />
                                <p className="text-sm font-medium text-white mb-1">Novo por aqui?</p>
                                <p className="text-xs text-gray-500 mb-3">Entre em grupos para encontrar pessoas com os mesmos interesses.</p>
                                {!user && (
                                    <Link href="/cadastro" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                                        Criar conta grátis <ChevronRight className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main feed */}
                    <main className="flex-1 min-w-0 space-y-4">
                        <AnimatePresence>
                            {activeGroup && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    className="rounded-2xl overflow-hidden border border-white/10">
                                    {activeGroup.cover_url && (
                                        <div className="w-full h-28 overflow-hidden">
                                            <img src={activeGroup.cover_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className={`px-5 py-4 flex items-center justify-between ${activeGroup.cover_url ? 'bg-black/70 backdrop-blur-sm' : 'bg-purple-900/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <GroupAvatar group={activeGroup} size={10} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="font-bold text-white text-lg leading-none">{activeGroup.name}</h2>
                                                    {activeGroup.is_private && <Lock className="w-3.5 h-3.5 text-amber-400/70" />}
                                                </div>
                                                {activeGroup.description && <p className="text-xs text-gray-400 mt-0.5">{activeGroup.description}</p>}
                                                <p className="text-xs text-purple-400/60 mt-0.5">{activeGroup.member_count} membros</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/comunidade/grupos/${activeGroup.id}`}
                                                className="text-xs px-3 py-1.5 border border-white/10 text-gray-400 hover:text-white rounded-xl transition-colors">
                                                Ver grupo
                                            </Link>
                                            <button onClick={() => handleSelectGroup(null)} className="text-gray-500 hover:text-white p-1 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {user ? (
                            <div className="bg-zinc-900/80 border border-white/[0.07] rounded-2xl p-5">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 overflow-hidden flex items-center justify-center shrink-0">
                                        {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-purple-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)}
                                            placeholder={activeGroup && postInGroup ? `Publicar em #${activeGroup.name}...` : 'O que você está pensando?'}
                                            className="w-full bg-transparent text-white placeholder:text-gray-600 text-sm leading-relaxed focus:outline-none resize-none"
                                            rows={3} maxLength={500} />
                                        {imagePreview && (
                                            <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 w-fit">
                                                <img src={imagePreview} alt="" className="max-h-48 object-cover rounded-xl" />
                                                <button onClick={() => { setImageFile(null); setImagePreview('') }}
                                                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 flex-wrap gap-2">
                                            <div className="flex items-center gap-1 relative">
                                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                                    className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors">
                                                    <ImageIcon className="w-4 h-4" />
                                                </button>
                                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                <div className="relative">
                                                    <button type="button" onClick={() => setShowEmoji(p => !p)}
                                                        className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-900/20 rounded-lg transition-colors">
                                                        <Smile className="w-4 h-4" />
                                                    </button>
                                                    {showEmoji && <EmojiPicker onPick={e => { setText(p => p + e); setShowEmoji(false); textareaRef.current?.focus() }} onClose={() => setShowEmoji(false)} />}
                                                </div>
                                                <span className="text-xs text-gray-700 ml-1">{text.length}/500</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {activeGroup && (
                                                    <button type="button" onClick={() => setPostInGroup(p => !p)}
                                                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${postInGroup ? 'bg-purple-900/30 border-purple-500/30 text-purple-300' : 'border-white/10 text-gray-500 hover:border-white/20'}`}>
                                                        <Hash className="w-3 h-3" />{activeGroup.name}
                                                    </button>
                                                )}
                                                <button onClick={handlePost} disabled={!text.trim() || posting || uploadingImg}
                                                    className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white text-sm font-medium rounded-xl transition-colors">
                                                    <Send className="w-3.5 h-3.5" />
                                                    {uploadingImg ? 'Enviando...' : posting ? 'Publicando...' : 'Publicar'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-900/50 border border-white/[0.07] rounded-2xl p-6 text-center">
                                <p className="text-gray-400 text-sm mb-4">Participe da comunidade</p>
                                <div className="flex gap-3 justify-center">
                                    <Link href="/login" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">Entrar</Link>
                                    <Link href="/cadastro" className="px-5 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-gray-300 text-sm rounded-xl transition-colors">Criar conta</Link>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="space-y-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 animate-pulse">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-white/5 rounded w-32" />
                                                <div className="h-3 bg-white/5 rounded w-full" />
                                                <div className="h-3 bg-white/5 rounded w-3/4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!loading && posts.length === 0 && (
                            <div className="text-center py-20 text-gray-600">
                                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">{activeGroup ? `Nenhuma publicação em #${activeGroup.name} ainda.` : 'Nenhuma publicação ainda. Seja o primeiro!'}</p>
                            </div>
                        )}
                        <div className="space-y-3">
                            {posts.map(p => <PostCard key={p.id} post={p} currentUserId={user?.id} currentProfile={profile} onDelete={handleDelete} />)}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
