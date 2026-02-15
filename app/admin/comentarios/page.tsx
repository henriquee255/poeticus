"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare, Trash2, Heart, User, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface Comment {
    id: string
    content: string
    created_at: string
    post_id: string
    user_id: string
    likes: number
    profiles: { username: string; avatar_url?: string }
}

export default function ComentariosPage() {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState("")

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    const load = () => {
        setLoading(true)
        fetch('/api/comments?admin=1')
            .then(r => r.json())
            .then(data => { setComments(Array.isArray(data) ? data : []); setLoading(false) })
    }

    useEffect(() => { load() }, [])

    const handleDelete = async (id: string) => {
        await fetch(`/api/comments?id=${id}&user_id=admin`, { method: 'DELETE' })
        setComments(prev => prev.filter(c => c.id !== id))
        showToast("Comentário removido")
    }

    const handleLike = async (comment: Comment) => {
        const newLikes = (comment.likes || 0) + 1
        await fetch('/api/comments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: comment.id, likes: newLikes })
        })
        setComments(prev => prev.map(c => c.id === comment.id ? { ...c, likes: newLikes } : c))
    }

    return (
        <div className="p-6 md:p-8">
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
                    {toast}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white font-serif mb-2">Comentários</h1>
                <p className="text-gray-400">{comments.length} comentário{comments.length !== 1 ? 's' : ''} no total</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {loading && <div className="text-center py-16 text-gray-500">Carregando...</div>}
                {!loading && comments.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p>Nenhum comentário ainda.</p>
                    </div>
                )}
                {comments.map((c, i) => (
                    <motion.div
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-purple-900/40 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0">
                            {c.profiles?.avatar_url
                                ? <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                : <User className="w-4 h-4 text-purple-400" />
                            }
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                                <span className="text-sm font-medium text-purple-300">
                                    @{c.profiles?.username || 'anônimo'}
                                </span>
                                <Link
                                    href={`/post/${c.post_id}`}
                                    target="_blank"
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    ver poema
                                </Link>
                                <span className="text-xs text-gray-600">
                                    {format(new Date(c.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed break-words">{c.content}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-start gap-3 shrink-0">
                            <button
                                onClick={() => handleLike(c)}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 transition-colors text-xs"
                                title="Curtir"
                            >
                                <Heart className="w-4 h-4" />
                                <span>{c.likes || 0}</span>
                            </button>
                            <button
                                onClick={() => handleDelete(c.id)}
                                className="text-gray-500 hover:text-red-400 transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
