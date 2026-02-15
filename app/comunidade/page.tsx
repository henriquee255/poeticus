"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Trash2, Send, User, ChevronDown, ChevronUp, Image as ImageIcon, Smile, X } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const EMOJIS = ['😊','😂','❤️','🔥','😍','🥺','😭','✨','😎','🤔','💜','🌸','🌙','⭐','💫','🎉','👏','🙏','💪','😢','😅','🤣','😌','💕','🌹','🦋','🌊','☀️','🌈','💭','📖','🖤','😴','🥰','💔','😤','🤯','🫶','💖','🌺','✍️','🎶','🌿','🍃','💧','🪐','🌌','🦄','🐾','🫠']

function EmojiPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])
    return (
        <div ref={ref} className="absolute bottom-12 left-0 z-50 bg-zinc-900 border border-white/10 rounded-2xl p-3 shadow-xl w-64">
            <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map(e => (
                    <button key={e} onClick={() => onPick(e)} className="text-lg hover:bg-white/10 rounded-lg p-1 transition-colors">{e}</button>
                ))}
            </div>
        </div>
    )
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
    profiles: { username: string; avatar_url?: string }
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
            className="bg-zinc-900/80 border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/15 transition-colors">
            <div className="p-4 sm:p-5">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 overflow-hidden flex items-center justify-center shrink-0">
                        {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-white">@{post.profiles?.username || 'anônimo'}</span>
                                <span className="text-xs text-gray-600">{format(new Date(post.created_at), 'dd MMM yyyy, HH:mm', { locale: ptBR })}</span>
                            </div>
                            {currentUserId === post.user_id && (
                                <button onClick={() => onDelete(post.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-900/10">
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
                                        {showEmojiReply && <EmojiPicker onPick={e => { setReplyText(p => p + e); setShowEmojiReply(false) }} onClose={() => setShowEmojiReply(false)} />}
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

    useEffect(() => {
        fetch('/api/feed').then(r => r.json()).then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false) })
    }, [])

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
        const res = await fetch('/api/feed', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, content: text.trim(), image_url: image_url || undefined })
        })
        const data = await res.json()
        if (data.id) {
            setPosts(prev => [{ ...data, profiles: { username: profile?.username || 'você', avatar_url: profile?.avatar_url } }, ...prev])
            setText(''); setImageFile(null); setImagePreview('')
        }
        setPosting(false)
    }

    const handleDelete = async (id: string) => {
        await fetch('/api/feed/' + id, { method: 'DELETE' })
        setPosts(prev => prev.filter(p => p.id !== id))
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-2xl mx-auto px-4 py-16">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white font-serif mb-2">Comunidade</h1>
                    <p className="text-gray-500 text-sm">Compartilhe pensamentos, poesias e reflexões.</p>
                </div>

                {user ? (
                    <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-5 mb-6">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 overflow-hidden flex items-center justify-center shrink-0">
                                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-purple-400" />}
                            </div>
                            <div className="flex-1">
                                <textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)}
                                    placeholder="O que você está pensando?"
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
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-1 relative">
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors" title="Adicionar foto">
                                            <ImageIcon className="w-4 h-4" />
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        <div className="relative">
                                            <button type="button" onClick={() => setShowEmoji(p => !p)}
                                                className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-900/20 rounded-lg transition-colors" title="Emojis">
                                                <Smile className="w-4 h-4" />
                                            </button>
                                            {showEmoji && <EmojiPicker onPick={e => { setText(p => p + e); setShowEmoji(false); textareaRef.current?.focus() }} onClose={() => setShowEmoji(false)} />}
                                        </div>
                                        <span className="text-xs text-gray-700 ml-2">{text.length}/500</span>
                                    </div>
                                    <button onClick={handlePost} disabled={!text.trim() || posting || uploadingImg}
                                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white text-sm font-medium rounded-xl transition-colors">
                                        <Send className="w-3.5 h-3.5" />
                                        {uploadingImg ? 'Enviando...' : posting ? 'Publicando...' : 'Publicar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-6 text-center">
                        <p className="text-gray-400 text-sm mb-4">Participe da comunidade</p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/login" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">Entrar</Link>
                            <Link href="/cadastro" className="px-5 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-gray-300 text-sm rounded-xl transition-colors">Criar conta</Link>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5" />
                                    <div className="flex-1 space-y-2"><div className="h-3 bg-white/5 rounded w-32" /><div className="h-3 bg-white/5 rounded w-full" /><div className="h-3 bg-white/5 rounded w-3/4" /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && posts.length === 0 && (
                    <div className="text-center py-20 text-gray-600">
                        <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Nenhuma publicação ainda. Seja o primeiro!</p>
                    </div>
                )}
                <div className="space-y-3">
                    {posts.map(p => <PostCard key={p.id} post={p} currentUserId={user?.id} currentProfile={profile} onDelete={handleDelete} />)}
                </div>
            </div>
        </div>
    )
}
