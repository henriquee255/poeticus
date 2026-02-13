"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, FileText, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { getPosts } from "@/lib/storage"
import { Post } from "@/types"
import Link from "next/link"

export default function AdminDashboard() {
    const [posts, setPosts] = useState<Post[]>([])
    const [stats, setStats] = useState([
        { label: "Total de Leitores", value: "12.5k", change: "+12%", icon: Users },
        { label: "Poemas Publicados", value: "0", change: "+0", icon: FileText },
        { label: "Visualizações Mensais", value: "45.2k", change: "+8%", icon: Eye },
        { label: "Engajamento", value: "24%", change: "+2%", icon: BarChart3 },
    ])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const allPosts = await getPosts()
                setPosts(allPosts)
                const published = allPosts.filter(p => p.status === 'published').length

                setStats(prev => prev.map(stat =>
                    stat.label === "Poemas Publicados"
                        ? { ...stat, value: published.toString(), change: `+${published}` }
                        : stat
                ))
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            }
        }

        fetchDashboardData()
    }, [])

    const recentPosts = posts.slice(0, 5)

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white font-serif mb-2">Dashboard</h1>
                <p className="text-gray-400">Visão geral do seu universo literário.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                        </motion.div>
                    )
                })}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Atividade Recente (Poemas)</h2>
                <div className="space-y-4">
                    {recentPosts.length > 0 ? (
                        recentPosts.map((post) => (
                            <div key={post.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        post.status === 'published' ? "bg-emerald-500" : "bg-purple-500"
                                    )} />
                                    <div>
                                        <p className="text-sm text-white font-medium">
                                            {post.status === 'published' ? 'Poema publicado:' : 'Novo rascunho:'} "{post.title}"
                                        </p>
                                        <p className="text-xs text-gray-500">{post.date} • {post.category}</p>
                                    </div>
                                </div>
                                <Link
                                    href={`/admin/edit/${post.id}`}
                                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    Ver detalhes
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm py-4">Nenhuma atividade recente encontrada.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
