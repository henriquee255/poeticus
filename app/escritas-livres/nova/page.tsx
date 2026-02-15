"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { PenLine, Send, CheckCircle, Bold, Italic, Underline, Smile, Image as ImageIcon, X, Type } from "lucide-react"
import Link from "next/link"

const CATEGORIES = ['geral', 'amor', 'reflexão', 'saudade', 'natureza', 'outro']
const EMOJIS = ['😊','😂','❤️','🔥','😍','🥺','😭','✨','😎','🤔','💜','🌸','🌙','⭐','💫','🎉','👏','🙏','💪','😢','😅','🤣','😌','💕','🌹','🦋','🌊','☀️','🌈','💭','📖','🖤','😴','🥰','💔','😤','🤯','🫶','💖','🌺','✍️','🎶','🌿','🍃','💧','🪐','🌌','🦄','🐾','🫠']
const FONTS = [
    { label: 'Padrão', value: 'font-sans' },
    { label: 'Serif', value: 'font-serif' },
    { label: 'Mono', value: 'font-mono' },
]

function EmojiPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])
    return (
        <div ref={ref} className="absolute top-10 left-0 z-50 bg-zinc-900 border border-white/10 rounded-2xl p-3 shadow-xl w-64">
            <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => onPick(e)} className="text-lg hover:bg-white/10 rounded-lg p-1 transition-colors">{e}</button>
                ))}
            </div>
        </div>
    )
}

export default function NovaEscritaPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('geral')
    const [font, setFont] = useState('font-sans')
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState('')
    const [showEmoji, setShowEmoji] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState('')
    const [uploadingImg, setUploadingImg] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!loading && !user) router.push('/login')
    }, [user, loading])

    const insertFormat = (tag: string) => {
        const ta = textareaRef.current; if (!ta) return
        const start = ta.selectionStart; const end = ta.selectionEnd
        const selected = content.substring(start, end)
        const wrapped = tag === 'bold' ? '**' + selected + '**'
            : tag === 'italic' ? '_' + selected + '_'
            : '__' + selected + '__'
        setContent(content.substring(0, start) + wrapped + content.substring(end))
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + wrapped.length, start + wrapped.length) }, 0)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return setError('Preencha título e conteúdo.')
        setSaving(true); setError('')

        let image_url = ''
        if (imageFile) {
            setUploadingImg(true)
            const form = new FormData()
            form.append('file', imageFile); form.append('user_id', user!.id)
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
            const uploadData = await uploadRes.json()
            if (uploadData.url) image_url = uploadData.url
            setUploadingImg(false)
        }

        const res = await fetch('/api/escritas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user!.id, title: title.trim(), content: content.trim(), category, image_url: image_url || undefined })
        })
        const data = await res.json()
        if (data.error) { setError(data.error); setSaving(false) }
        else setDone(true)
    }

    if (done) return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white font-serif mb-3">Escrita enviada!</h2>
                <p className="text-gray-400 mb-8">Sua escrita foi enviada para revisão. Quando aprovada, aparecerá nas Escritas Livres.</p>
                <div className="flex gap-3 justify-center">
                    <Link href="/escritas-livres" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">Ver escritas</Link>
                    <button onClick={() => { setDone(false); setTitle(''); setContent(''); setCategory('geral'); setImagePreview(''); setImageFile(null) }}
                        className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white text-sm rounded-xl transition-colors">
                        Escrever outra
                    </button>
                </div>
            </motion.div>
        </div>
    )

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-2xl mx-auto px-4 py-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-8">
                        <Link href="/escritas-livres" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4 block">
                            ← Escritas Livres
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <PenLine className="w-6 h-6 text-purple-400" />
                            <h1 className="text-3xl font-bold text-white font-serif">Nova escrita</h1>
                        </div>
                        <p className="text-gray-500 text-sm">Compartilhe sua poesia com a comunidade. Será revisada antes de publicar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Título */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Título</label>
                                <input value={title} onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-xl font-serif focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-700"
                                    placeholder="Nome da sua escrita..." maxLength={100} required />
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Categoria</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)}
                                        className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors capitalize">
                                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-black capitalize">{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Fonte</label>
                                    <div className="flex gap-2">
                                        {FONTS.map(f => (
                                            <button key={f.value} type="button" onClick={() => setFont(f.value)}
                                                className={'px-3 py-2 rounded-xl text-sm border transition-colors ' + (font === f.value ? 'bg-purple-900/40 border-purple-500/40 text-purple-300' : 'border-white/10 text-gray-500 hover:text-white') + ' ' + f.value}>
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex items-center gap-1 px-4 py-3 border-b border-white/5">
                                <button type="button" onClick={() => insertFormat('bold')} title="Negrito"
                                    className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <Bold className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => insertFormat('italic')} title="Itálico"
                                    className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <Italic className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => insertFormat('underline')} title="Sublinhado"
                                    className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <Underline className="w-4 h-4" />
                                </button>
                                <div className="w-px h-5 bg-white/10 mx-1" />
                                <div className="relative">
                                    <button type="button" onClick={() => setShowEmoji(p => !p)}
                                        className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-900/20 rounded-lg transition-colors" title="Emojis">
                                        <Smile className="w-4 h-4" />
                                    </button>
                                    {showEmoji && <EmojiPicker onPick={e => { setContent(p => p + e); setShowEmoji(false) }} onClose={() => setShowEmoji(false)} />}
                                </div>
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors" title="Adicionar imagem">
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                <span className="ml-auto text-xs text-gray-700">{content.length}/5000</span>
                            </div>
                            <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)}
                                className={'w-full bg-transparent px-5 py-4 text-gray-100 focus:outline-none resize-none leading-relaxed text-sm ' + font}
                                placeholder="Escreva seu poema aqui..." rows={16} maxLength={5000} required />
                        </div>

                        {imagePreview && (
                            <div className="relative rounded-xl overflow-hidden border border-white/10 w-fit">
                                <img src={imagePreview} alt="" className="max-h-48 object-cover rounded-xl" />
                                <button type="button" onClick={() => { setImageFile(null); setImagePreview('') }}
                                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button type="submit" disabled={saving || uploadingImg}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
                            <Send className="w-4 h-4" />
                            {uploadingImg ? 'Enviando imagem...' : saving ? 'Enviando...' : 'Enviar para revisão'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
