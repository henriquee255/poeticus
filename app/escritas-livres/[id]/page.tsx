"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { Heart, Eye, User, ArrowLeft, Pin } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CommentSection } from "@/components/ui/comment-section"

interface Escrita {
    id: string
    title: string
    content: string
    category: string
    pinned: boolean
    likes: number
    views: number
    created_at: string
    profiles: { username: string; avatar_url?: string }
}

export default function EscritaPage() {
    const { id } = useParams() as { id: string }
    const { user } = useAuth()
    const [escrita, setEscrita] = useState<Escrita | null>(null)
    const [loading, setLoading] = useState(true)
    const [liked, setLiked] = useState(false)
    const [likes, setLikes] = useState(0)

    useEffect(() => {
        fetch(`/api/escritas/${id}`)
            .then(r => r.json())
            .then(data => {
                if (data && !data.error) {
                    setEscrita(data)
                    setLikes(data.likes || 0)
                }
                setLoading(false)
            })
        // Check localStorage for like state
        if (typeof window !== 'undefined') {
            setLiked(localStorage.getItem(`escrita_liked_${id}`) === 'true')
        }
    }, [id])

    const handleLike = async () => {
        if (!user) return
        const res = await fetch(`/api/escritas/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'like', user_id: user.id })
        })
        const data = await res.json()
        setLiked(data.liked)
        setLikes(data.likes)
        localStorage.setItem(`escrita_liked_${id}`, data.liked ? 'true' : 'false')
    }

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-gray-500">Carregando...</div></div>
    if (!escrita) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-gray-500">Escrita não encontrada.</div></div>

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-2xl mx-auto px-4 py-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href="/escritas-livres" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10">
                        <ArrowLeft className="w-4 h-4" /> Escritas Livres
                    </Link>

                    <div className="mb-8">
                        {escrita.pinned && (
                            <div className="flex items-center gap-1.5 text-purple-400 text-xs mb-3">
                                <Pin className="w-3 h-3" /> Fixado
                            </div>
                        )}
                        <h1 className="text-3xl md:text-4xl font-bold text-white font-serif mb-6">{escrita.title}</h1>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-500/20 overflow-hidden flex items-center justify-center">
                                {escrita.profiles?.avatar_url
                                    ? <img src={escrita.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                    : <User className="w-4 h-4 text-purple-400" />
                                }
                            </div>
                            <div>
                                <span className="text-sm text-purple-300">@{escrita.profiles?.username || 'anônimo'}</span>
                                <span className="text-gray-600 text-xs ml-2">
                                    {format(new Date(escrita.created_at), "dd MMM yyyy", { locale: ptBR })}
                                </span>
                            </div>
                            <span className="text-xs text-gray-600 capitalize bg-white/5 px-2 py-0.5 rounded-full ml-auto">
                                {escrita.category}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-gray-200 leading-[2] whitespace-pre-wrap font-serif text-lg mb-12">
                        {escrita.content}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 py-6 border-t border-white/10 border-b">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 text-sm transition-colors ${liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'} ${!user ? 'cursor-default' : 'cursor-pointer'}`}
                            title={!user ? 'Entre para curtir' : ''}
                        >
                            <Heart className={`w-5 h-5 ${liked ? 'fill-red-400' : ''}`} />
                            <span>{likes}</span>
                        </button>
                        <span className="flex items-center gap-2 text-sm text-gray-600">
                            <Eye className="w-4 h-4" /> {escrita.views}
                        </span>
                    </div>

                    {/* Comments */}
                    <CommentSection postId={id} />
                </motion.div>
            </div>
        </div>
    )
}
