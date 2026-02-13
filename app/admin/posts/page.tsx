"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Trash2, Eye, Plus, Search, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPosts, deletePost } from "@/lib/storage"
import { Post } from "@/types"
import { cn } from "@/lib/utils"

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const allPosts = await getPosts()
                setPosts(allPosts)
            } catch (error) {
                console.error("Error fetching posts:", error)
            }
        }

        fetchPosts()
    }, [])

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.category.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este poema?")) {
            try {
                await deletePost(id)
                const updatedPosts = await getPosts()
                setPosts(updatedPosts)
            } catch (error) {
                console.error("Error deleting post:", error)
                alert("Erro ao excluir o poema.")
            }
        }
    }

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Gerenciar Poemas</h1>
                    <p className="text-gray-400">Total de {posts.length} publicações.</p>
                </div>
                <Button asChild className="bg-purple-900 hover:bg-purple-800 text-white">
                    <Link href="/admin/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Poema
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar por título ou categoria..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 focus:outline-none focus:border-purple-500">
                        <option>Todos os Status</option>
                        <option>Publicado</option>
                        <option>Rascunho</option>
                    </select>
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Título</th>
                            <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                            <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Data</th>
                            <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-4">
                                    <div className="font-medium text-white">{post.title}</div>
                                    <div className="text-xs text-gray-500 md:hidden">{post.category}</div>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                                        {post.category}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-400 hidden md:table-cell">{post.date}</td>
                                <td className="p-4">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
                                        post.status === 'published'
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                    )}>
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            post.status === 'published' ? "bg-emerald-400 animate-pulse" : "bg-gray-500"
                                        )} />
                                        {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" asChild>
                                            <Link href={`/post/${post.slug}`} target="_blank">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20" asChild>
                                            <Link href={`/admin/edit/${post.id}`}>
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            onClick={() => handleDelete(post.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="md:hidden group-hover:hidden">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredPosts.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        Nenhum poema encontrado.
                    </div>
                )}
            </div>
        </div>
    )
}
