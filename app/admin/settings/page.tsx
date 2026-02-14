"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Save, Instagram, Globe, Info } from "lucide-react"
import { getSettings, saveSettings } from "@/lib/storage"
import { SiteSettings } from "@/types"

export default function SettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings()
                setSettings(data)
            } catch (error) {
                console.error("Error fetching settings:", error)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        if (!settings) return
        setIsSaving(true)
        try {
            await saveSettings(settings)
            alert("Configurações salvas com sucesso!")
        } catch (error) {
            console.error("Error saving settings:", error)
            alert("Erro ao salvar configurações.")
        } finally {
            setIsSaving(false)
        }
    }

    if (!settings) return null

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-2">Configurações Gerais</h1>
                    <p className="text-gray-400">Gerencie a identidade e links do seu blog.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-purple-900 hover:bg-purple-800 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
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
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors h-24 resize-none"
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

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Instagram className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">Redes Sociais</h2>
                    </div>

                    <div className="space-y-4">
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
                </div>

                <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-6 flex items-start gap-4">
                    <Info className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                        <h3 className="text-white font-medium mb-1">Dica de SEO</h3>
                        <p className="text-sm text-gray-400">
                            O nome e a descrição do blog são usados para os metadados da página, influenciando como seu site aparece nos resultados de busca.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
