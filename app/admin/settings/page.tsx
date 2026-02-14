"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Save, Instagram, Globe, Info, User } from "lucide-react"
import { getSettings, saveSettings } from "@/lib/storage"
import { SiteSettings } from "@/types"

export default function SettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [toast, setToast] = useState("")

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(""), 2500)
    }

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error)
    }, [])

    const handleSave = async () => {
        if (!settings) return
        setIsSaving(true)
        try {
            await saveSettings(settings)
            showToast("Configurações salvas!")
        } catch {
            showToast("Erro ao salvar.")
        } finally {
            setIsSaving(false)
        }
    }

    if (!settings) return null

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Toast */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
                    {toast}
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Configurações</h1>
                    <p className="text-gray-400">Gerencie a identidade e conteúdo do seu blog.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Identidade */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Globe className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">Identidade do Site</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nome do Blog</label>
                            <input
                                type="text"
                                value={settings.name}
                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="Poeticus"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Descrição / Slogan</label>
                            <textarea
                                value={settings.description}
                                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors h-20 resize-none"
                                placeholder="Um refúgio digital para a alma..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nome do Autor (Padrão)</label>
                            <input
                                type="text"
                                value={settings.authorName || ''}
                                onChange={(e) => setSettings({ ...settings, authorName: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="Seu Nome ou Pseudônimo"
                            />
                        </div>
                    </div>
                </div>

                {/* Redes Sociais */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Instagram className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">Redes Sociais</h2>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Instagram URL</label>
                        <div className="relative">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={settings.instagramUrl || ''}
                                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="https://instagram.com/seuusuario"
                            />
                        </div>
                    </div>
                </div>

                {/* Página Sobre */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">Página "Sobre"</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Título da Página</label>
                            <input
                                type="text"
                                value={settings.aboutTitle || ''}
                                onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="Sobre mim"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Conteúdo</label>
                            <textarea
                                value={settings.aboutContent || ''}
                                onChange={(e) => setSettings({ ...settings, aboutContent: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none font-serif leading-relaxed"
                                placeholder={"Escreva aqui o conteúdo da página Sobre...\n\nPode usar várias linhas, tudo será preservado."}
                                rows={12}
                            />
                            <p className="text-xs text-gray-600 mt-2">As quebras de linha serão preservadas exatamente como digitadas.</p>
                        </div>
                        <a
                            href="/sobre"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs text-purple-400 hover:text-purple-300 underline transition-colors"
                        >
                            Visualizar página Sobre →
                        </a>
                    </div>
                </div>

                {/* Dica */}
                <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-6 flex items-start gap-4">
                    <Info className="w-5 h-5 text-purple-400 mt-1 shrink-0" />
                    <div>
                        <h3 className="text-white font-medium mb-1">Dica de SEO</h3>
                        <p className="text-sm text-gray-400">
                            O nome e a descrição do blog são usados nos metadados, influenciando como seu site aparece nos resultados de busca.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
