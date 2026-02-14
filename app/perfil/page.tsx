"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { User, Bookmark, Heart, FolderOpen, Plus, Trash2, LogOut, Camera, Save } from "lucide-react"
import { getPosts } from "@/lib/storage"
import { Post } from "@/types"
import Link from "next/link"

interface Collection { id: string; name: string }
interface SavedPost { id: string; post_id: string; collection_id?: string }

export default function PerfilPage() {
    const { user, profile, loading, signOut, refreshProfile } = useAuth()
    const router = useRouter()

    const [tab, setTab] = useState<'salvos' | 'curtidos' | 'configuracoes'>('salvos')
    const [username, setUsername] = useState("")
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState("")
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState("")

    const [collections, setCollections] = useState<Collection[]>([])
    const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
    const [allPosts, setAllPosts] = useState<Post[]>([])
    const [newCollectionName, setNewCollectionName] = useState("")
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null)

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500) }

    useEffect(() => {
        if (!loading && !user) router.push("/login")
    }, [user, loading])

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || "")
            setAvatarPreview(profile.avatar_url || "")
        }
    }, [profile])

    useEffect(() => {
        if (!user) return
        // Load collections
        fetch(`/api/collections?user_id=${user.id}`).then(r => r.json()).then(setCollections)
        // Load saved posts
        fetch(`/api/saved?user_id=${user.id}`).then(r => r.json()).then(setSavedPosts)
        // Load all posts for matching
        getPosts().then(setAllPosts)
    }, [user])

    // Get liked posts from localStorage
    const likedPostIds = allPosts.filter(p => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem(`liked_${p.id}`) === 'true'
    }).map(p => p.id)

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setAvatarFile(file)
        const reader = new FileReader()
        reader.onload = () => setAvatarPreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleSaveProfile = async () => {
        if (!user) return
        setSaving(true)
        let avatar_url = profile?.avatar_url || ""

        if (avatarFile) {
            // Upload to Supabase Storage
            const ext = avatarFile.name.split('.').pop()
            const path = `avatars/${user.id}.${ext}`
            const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
            if (!error) {
                const { data } = supabase.storage.from('avatars').getPublicUrl(path)
                avatar_url = data.publicUrl
            }
        }

        await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, username, avatar_url })
        })
        await refreshProfile()
        showToast("Perfil atualizado!")
        setSaving(false)
    }

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim() || !user) return
        const res = await fetch('/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, name: newCollectionName.trim() })
        })
        const col = await res.json()
        setCollections(prev => [...prev, col])
        setNewCollectionName("")
    }

    const handleDeleteCollection = async (id: string) => {
        if (!user) return
        await fetch(`/api/collections?id=${id}&user_id=${user.id}`, { method: 'DELETE' })
        setCollections(prev => prev.filter(c => c.id !== id))
    }

    const handleUnsave = async (post_id: string) => {
        if (!user) return
        await fetch(`/api/saved?user_id=${user.id}&post_id=${post_id}`, { method: 'DELETE' })
        setSavedPosts(prev => prev.filter(s => s.post_id !== post_id))
    }

    const getPostById = (post_id: string) => allPosts.find(p => p.id === post_id)

    const filteredSaved = selectedCollection
        ? savedPosts.filter(s => s.collection_id === selectedCollection)
        : savedPosts

    if (loading) return <div className="min-h-screen bg-black pt-28 text-center text-gray-500">Carregando...</div>
    if (!user || !profile) return null

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-4">
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
                    {toast}
                </div>
            )}

            <div className="container mx-auto max-w-4xl">
                {/* Header do perfil */}
                <div className="flex items-center gap-6 mb-10">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-purple-900/50 border-2 border-purple-500/30 overflow-hidden flex items-center justify-center">
                            {avatarPreview
                                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                                : <User className="w-8 h-8 text-purple-400" />
                            }
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-serif">@{profile.username}</h1>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                    <button
                        onClick={() => { signOut(); router.push('/') }}
                        className="ml-auto flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg hover:bg-red-900/10"
                    >
                        <LogOut className="w-4 h-4" /> Sair
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-8 w-fit">
                    {([['salvos', 'Salvos', Bookmark], ['curtidos', 'Curtidos', Heart], ['configuracoes', 'Configurações', User]] as any[]).map(([key, label, Icon]) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-purple-900/40 text-purple-300' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {/* Tab: Salvos */}
                {tab === 'salvos' && (
                    <div>
                        {/* Coleções */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                onClick={() => setSelectedCollection(null)}
                                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${!selectedCollection ? 'bg-purple-900/40 border-purple-500/30 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white'}`}
                            >
                                <FolderOpen className="w-3 h-3 inline mr-1.5" />Todos
                            </button>
                            {collections.map(col => (
                                <div key={col.id} className="flex items-center gap-1">
                                    <button
                                        onClick={() => setSelectedCollection(col.id === selectedCollection ? null : col.id)}
                                        className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${selectedCollection === col.id ? 'bg-purple-900/40 border-purple-500/30 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white'}`}
                                    >
                                        {col.name}
                                    </button>
                                    <button onClick={() => handleDeleteCollection(col.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <input
                                    value={newCollectionName}
                                    onChange={e => setNewCollectionName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreateCollection()}
                                    placeholder="Nova pasta..."
                                    className="bg-black border border-white/10 rounded-full px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 w-32"
                                />
                                <button onClick={handleCreateCollection} className="text-purple-400 hover:text-purple-300 transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Posts salvos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredSaved.length === 0 && <p className="text-gray-500 text-sm col-span-2">Nenhum poema salvo ainda.</p>}
                            {filteredSaved.map(s => {
                                const post = getPostById(s.post_id)
                                if (!post) return null
                                return (
                                    <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-xs text-purple-400">{post.category}</span>
                                            <Link href={`/post/${post.slug}`} className="block text-white hover:text-purple-300 font-serif font-medium mt-1 transition-colors">
                                                {post.title}
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                                        </div>
                                        <button onClick={() => handleUnsave(s.post_id)} className="text-gray-600 hover:text-red-400 transition-colors shrink-0 mt-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Tab: Curtidos */}
                {tab === 'curtidos' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {likedPostIds.length === 0 && <p className="text-gray-500 text-sm">Nenhum poema curtido ainda.</p>}
                        {likedPostIds.map(id => {
                            const post = getPostById(id)
                            if (!post) return null
                            return (
                                <div key={id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <span className="text-xs text-purple-400">{post.category}</span>
                                    <Link href={`/post/${post.slug}`} className="block text-white hover:text-purple-300 font-serif font-medium mt-1 transition-colors">
                                        {post.title}
                                    </Link>
                                    <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Tab: Configurações */}
                {tab === 'configuracoes' && (
                    <div className="max-w-md space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-purple-900/50 border-2 border-purple-500/30 overflow-hidden flex items-center justify-center">
                                    {avatarPreview
                                        ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                                        : <User className="w-6 h-6 text-purple-400" />
                                    }
                                </div>
                                <label className="cursor-pointer flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                    <Camera className="w-4 h-4" /> Trocar foto
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nome de usuário</label>
                                <input
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email</label>
                                <input
                                    value={user.email || ""}
                                    disabled
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Salvando..." : "Salvar alterações"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
