"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Send, Trash2, User } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles: { username: string; avatar_url?: string }
}

export function CommentSection({ postId }: { postId: string }) {
    const { user } = useAuth()
    const [comments, setComments] = useState<Comment[]>([])
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch(`/api/comments?post_id=${postId}`)
            .then(r => r.json())
            .then(data => setComments(Array.isArray(data) ? data : []))
    }, [postId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim() || !user) return
        setLoading(true)
        const res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, user_id: user.id, content: text.trim() })
        })
        const comment = await res.json()
        if (comment.id) {
            setComments(prev => [...prev, { ...comment, profiles: { username: 'você', avatar_url: '' } }])
            setText("")
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!user) return
        await fetch(`/api/comments?id=${id}&user_id=${user.id}`, { method: 'DELETE' })
        setComments(prev => prev.filter(c => c.id !== id))
    }

    return (
        <div className="mt-16 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white font-serif mb-6">
                Comentários <span className="text-gray-500 font-normal text-sm">({comments.length})</span>
            </h3>

            {/* Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                    <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Escreva um comentário..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                            maxLength={500}
                        />
                        <button
                            type="submit"
                            disabled={!text.trim() || loading}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white px-4 py-2.5 rounded-xl transition-colors shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-center">
                    <p className="text-gray-400 text-sm">
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">Entre</Link>
                        {" "}ou{" "}
                        <Link href="/cadastro" className="text-purple-400 hover:text-purple-300 transition-colors">crie uma conta</Link>
                        {" "}para comentar.
                    </p>
                </div>
            )}

            {/* Lista */}
            <div className="space-y-4">
                {comments.length === 0 && (
                    <p className="text-gray-600 text-sm text-center py-4">Nenhum comentário ainda. Seja o primeiro!</p>
                )}
                {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-900/30 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0">
                            {c.profiles?.avatar_url
                                ? <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                : <User className="w-3 h-3 text-purple-400" />
                            }
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-purple-300">@{c.profiles?.username || 'anônimo'}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">
                                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                    {user?.id === c.user_id && (
                                        <button onClick={() => handleDelete(c.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">{c.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
