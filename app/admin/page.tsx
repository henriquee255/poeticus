"use client"

import { motion } from "framer-motion"
import { BarChart3, FileText, Heart, Share2, Eye, TrendingUp, BookOpen, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { getPosts, getViewStats } from "@/lib/storage"
import { Post } from "@/types"
import Link from "next/link"

interface ViewStats {
    total: number
    monthly: number
    topPosts: { slug: string; views: number }[]
    topLivros: { slug: string; views: number }[]
}

export default function AdminDashboard() {
    const [posts, setPosts] = useState<Post[]>([])
    const [totalLikes, setTotalLikes] = useState(0)
    const [totalShares, setTotalShares] = useState(0)
    const [viewStats, setViewStats] = useState<ViewStats>({ total: 0, monthly: 0, topPosts: [], topLivros: [] })

    useEffect(() => {
        getPosts().then(allPosts => {
            setPosts(allPosts)
            setTotalLikes(allPosts.reduce((sum, p) => sum + (p.likes || 0), 0))
            setTotalShares(allPosts.reduce((sum, p) => sum + ((p as any).shares || 0), 0))
        }).catch(console.error)

        getViewStats().then(setViewStats).catch(console.error)
    }, [])

    const published = posts.filter(p => p.status === 'published')
    const topLiked = [...published].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5)
    const topShared = [...published].sort((a, b) => ((b as any).shares || 0) - ((a as any).shares || 0)).slice(0, 5)

    const stats = [
        { label: "Total de Acessos", value: viewStats.total.toLocaleString('pt-BR'), icon: Eye, color: "text-cyan-400 bg-cyan-500/10" },
        { label: "Acessos Este Mês", value: viewStats.monthly.toLocaleString('pt-BR'), icon: Calendar, color: "text-indigo-400 bg-indigo-500/10" },
        { label: "Poemas Publicados", value: published.length.toString(), icon: FileText, color: "text-purple-400 bg-purple-500/10" },
        { label: "Total de Likes", value: totalLikes.toString(), icon: Heart, color: "text-red-400 bg-red-500/10" },
        { label: "Compartilhamentos", value: totalShares.toString(), icon: Share2, color: "text-blue-400 bg-blue-500/10" },
        { label: "Total de Poemas", value: posts.length.toString(), icon: BarChart3, color: "text-emerald-400 bg-emerald-500/10" },
    ]

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white font-serif mb-2">Dashboard</h1>
                <p className="text-gray-400">Visão geral do seu universo literário.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-2 rounded-lg", stat.color)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                        </motion.div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Top Likes */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Heart className="w-4 h-4 text-red-400" />
                        <h2 className="text-lg font-bold text-white">Mais Curtidos</h2>
                    </div>
                    <div className="space-y-3">
                        {topLiked.length === 0 && <p className="text-gray-500 text-sm">Nenhum like ainda.</p>}
                        {topLiked.map((post, i) => (
                            <div key={post.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                                    <Link href={`/admin/edit/${post.id}`} className="text-sm text-white hover:text-purple-300 transition-colors truncate max-w-[180px]">
                                        {post.title}
                                    </Link>
                                </div>
                                <span className="text-sm font-medium text-red-400 flex items-center gap-1">
                                    <Heart className="w-3 h-3" /> {post.likes || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Shares */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        <h2 className="text-lg font-bold text-white">Mais Compartilhados</h2>
                    </div>
                    <div className="space-y-3">
                        {topShared.length === 0 && <p className="text-gray-500 text-sm">Nenhum compartilhamento ainda.</p>}
                        {topShared.map((post, i) => (
                            <div key={post.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                                    <Link href={`/admin/edit/${post.id}`} className="text-sm text-white hover:text-purple-300 transition-colors truncate max-w-[180px]">
                                        {post.title}
                                    </Link>
                                </div>
                                <span className="text-sm font-medium text-blue-400 flex items-center gap-1">
                                    <Share2 className="w-3 h-3" /> {(post as any).shares || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Viewed Posts */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <h2 className="text-lg font-bold text-white">Poemas Mais Visitados</h2>
                    </div>
                    <div className="space-y-3">
                        {viewStats.topPosts.length === 0 && <p className="text-gray-500 text-sm">Nenhuma visita registrada ainda.</p>}
                        {viewStats.topPosts.map((item, i) => (
                            <div key={item.slug} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                                    <Link href={`/post/${item.slug}`} className="text-sm text-white hover:text-cyan-300 transition-colors truncate max-w-[180px]">
                                        {item.slug}
                                    </Link>
                                </div>
                                <span className="text-sm font-medium text-cyan-400 flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {item.views}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Viewed Livros */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <h2 className="text-lg font-bold text-white">Livros Mais Visitados</h2>
                    </div>
                    <div className="space-y-3">
                        {viewStats.topLivros.length === 0 && <p className="text-gray-500 text-sm">Nenhuma visita registrada ainda.</p>}
                        {viewStats.topLivros.map((item, i) => (
                            <div key={item.slug} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                                    <Link href={`/livros/${item.slug}`} className="text-sm text-white hover:text-indigo-300 transition-colors truncate max-w-[180px]">
                                        {item.slug}
                                    </Link>
                                </div>
                                <span className="text-sm font-medium text-indigo-400 flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {item.views}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
