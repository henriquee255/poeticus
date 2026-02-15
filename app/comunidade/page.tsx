"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Trash2, Send, User, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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
    likes: number
    created_at: string
    user_id: string
    profiles: { username: string; avatar_url?: string }
}

function PostCard({ post, currentUserId, onDelete }: { post: FeedPost; currentUserId?: string; onDelete: (id: string) => void }) {
    const [liked, setLiked] = useState(
        typeof window !== 'undefined' ? localStorage.getItem(`feed_liked_${post.id}`) === 'true' : false
    )
    const [likes, setLikes] = useState(post.likes || 0)
    const [showReplies, setShowReplies] = useState(false)
    const [replies, setReplies] = useState<Reply[]>([])
    const [replyText, setReplyText] = useState("")
    const [loadingReplies, setLoadingReplies] = useState(false)

    const handleLike = async () => {
        if (!currentUserId) return
        const res = await fetch(`/api/feed/${post.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUserId })
        })
        const data = await res.json()
        setLiked(data.liked)
        setLikes(data.likes)
        localStorage.setItem(`feed_liked_${post.id}`, data.liked ? 'true' : 'false')
    }

    const toggleReplies = async () => {
        if (!showReplies && replies.length === 0) {
            setLoadingReplies(true)
            const res = await fetch(`/api/feed/${post.id}/replies`)
            const data = await res.json()
            setReplies(Array.isArray(data) ? data : [])
            setLoadingReplies(false)
        }
        setShowReplies(p => !p)
    }

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyText.trim() || !currentUserId) return
        const res = await fetch(`/api/feed/${post.id}/replies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUserId, content: replyText.trim() })
        })
        const data = await res.json()
        if (data.id) {
            setReplies(prev => [...prev, { ...data, profiles: { username: 'você' } }])
            setReplyText("")
            setShowReplies(true)
        }
    }

    const handleDeleteReply = async (replyId: string) => {
        await fetch(`/api/feed/${post.id}/replies?reply_id=${replyId}`, { method: 'DELETE' })
        setReplies(prev => prev.filter(r => r.id !== replyId))
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-900/40 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0">
                    {post.profiles?.avatar_url
                        ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <User className="w-4 h-4 text-purple-400" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-medium text-purple-300">@{post.profiles?.username || 'anônimo'}</span>
                        <span className="text-xs text-gray-600">
                            {format(new Date(post.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                        </span>
                        {currentUserId === post.user_id && (
                            <button onClick={() => onDelete(post.id)} className="ml-auto text-gray-600 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>

                    <div className="flex items-center gap-4 mt-3">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'} ${!currentUserId ? 'cursor-default' : ''}`}
                        >
                            <Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} />
                            <span>{likes}</span>
                        </button>
                        <button
                            onClick={toggleReplies}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>{replies.length > 0 ? replies.length : 'Responder'}</span>
                            {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Replies */}
            <AnimatePresence>
                {showReplies && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 ml-12 space-y-3"
                    >
                        {loadingReplies && <p className="text-xs text-gray-500">Carregando...</p>}
                        {replies.map(r => (
                            <div key={r.id} className="flex gap-2">
                                <div className="w-7 h-7 rounded-full bg-purple-900/30 border border-purple-500/10 overflow-hidden flex items-center justify-center shrink-0">
                                    {r.profiles?.avatar_url
                                        ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                        : <User className="w-3 h-3 text-purple-400" />
                                    }
                                </div>
                                <div className="flex-1 bg-white/[0.03] rounded-xl px-3 py-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-purple-400">@{r.profiles?.username || 'anônimo'}</span>
                                        <span className="text-xs text-gray-700">
                                            {format(new Date(r.created_at), "dd MMM", { locale: ptBR })}
                                        </span>
                                        {currentUserId === r.user_id && (
                                            <button onClick={() => handleDeleteReply(r.id)} className="ml-auto text-gray-700 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-300 break-words">{r.content}</p>
                                </div>
                            </div>
                        ))}

                        {currentUserId && (
                            <form onSubmit={handleReply} className="flex gap-2">
                                <input
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Escreva uma resposta..."
                                    className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    maxLength={500}
                                />
                                <button type="submit" disabled={!replyText.trim()} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white px-3 py-2 rounded-xl transition-colors">
                                    <Send className="w-3 h-3" />
                                </button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function ComunidadePage() {
    const { user, profile } = useAuth()
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState("")
    const [posting, setPosting] = useState(false)

    useEffect(() => {
        fetch('/api/feed').then(r => r.json()).then(data => {
            setPosts(Array.isArray(data) ? data : [])
            setLoading(false)
        })
    }, [])

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim() || !user) return
        setPosting(true)
        const res = await fetch('/api/feed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, content: text.trim() })
        })
        const data = await res.json()
        if (data.id) {
            setPosts(prev => [{ ...data, profiles: { username: profile?.username || 'você', avatar_url: profile?.avatar_url } }, ...prev])
            setText("")
        }
        setPosting(false)
    }

    const handleDelete = async (id: string) => {
        await fetch(`/api/feed/${id}`, { method: 'DELETE' })
        setPosts(prev => prev.filter(p => p.id !== id))
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-2xl mx-auto px-4 py-16">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white font-serif mb-2">Comunidade</h1>
                    <p className="text-gray-400">Compartilhe pensamentos com outros leitores.</p>
                </div>

                {/* Post form */}
                {user ? (
                    <form onSubmit={handlePost} className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                        <div className="flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-900/40 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0">
                                {profile?.avatar_url
                                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    : <User className="w-4 h-4 text-purple-400" />
                                }
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder="O que você está pensando?"
                                    className="w-full bg-transparent text-white placeholder:text-gray-600 text-sm leading-relaxed focus:outline-none resize-none"
                                    rows={3}
                                    maxLength={500}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-700">{text.length}/500</span>
                                    <button type="submit" disabled={!text.trim() || posting} className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white text-sm rounded-xl transition-colors">
                                        <Send className="w-3.5 h-3.5" />
                                        {posting ? 'Publicando...' : 'Publicar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-center">
                        <p className="text-gray-400 text-sm">
                            <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">Entre</Link>
                            {" "}ou{" "}
                            <Link href="/cadastro" className="text-purple-400 hover:text-purple-300 transition-colors">crie uma conta</Link>
                            {" "}para participar da comunidade.
                        </p>
                    </div>
                )}

                {/* Feed */}
                {loading && <div className="text-center py-16 text-gray-500">Carregando...</div>}
                {!loading && posts.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <MessageCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p>Nenhuma publicação ainda. Seja o primeiro!</p>
                    </div>
                )}
                <div className="space-y-4">
                    {posts.map((p, i) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                            <PostCard post={p} currentUserId={user?.id} onDelete={handleDelete} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
